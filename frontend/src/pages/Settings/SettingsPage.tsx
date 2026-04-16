import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Building2, Save, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { CompanySettings } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import { useCompanyStore } from '../../store/companyStore';

const labelClass = 'block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5';

export default function SettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const setSettings = useCompanyStore((s) => s.setSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
  });

  const { register, handleSubmit, reset } = useForm<Omit<CompanySettings, 'id' | 'updated_at' | 'logo_url'>>();

  useEffect(() => {
    if (company) reset(company);
  }, [company, reset]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<CompanySettings>) => api.put('/settings/company', data).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(t('settings.saved'));
      setSettings(data);
      qc.invalidateQueries({ queryKey: ['company-settings'] });
    },
    onError: () => toast.error('Gagal menyimpan pengaturan'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('logo', file);
      return api.post('/settings/company/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: (data) => {
      toast.success('Logo berhasil diupload');
      setSettings(data);
      qc.invalidateQueries({ queryKey: ['company-settings'] });
      cancelPreview();
    },
    onError: () => toast.error('Gagal upload logo'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Revoke previous preview URL
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    // Create local preview
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    // Reset input so same file can be reselected
    e.target.value = '';
  };

  const confirmUpload = () => {
    if (pendingFile) uploadMutation.mutate(pendingFile);
  };

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  };

  // Displayed image: preview takes priority over saved logo
  const displayedImage = previewUrl ?? company?.logo_url ?? null;
  const isPreviewing = !!previewUrl;

  return (
    <div>
      <PageHeader title={t('settings.title')} />

      <div className="max-w-2xl space-y-6">
        {/* Logo */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
              <Building2 size={16} className="text-primary-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">{t('settings.logo')}</h2>
          </div>

          <div className="flex items-start gap-5">
            {/* Logo preview box */}
            <div className="relative shrink-0">
              <div className={`h-28 w-28 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all
                ${isPreviewing
                  ? 'border-primary-400 bg-primary-50 ring-4 ring-primary-100'
                  : 'border-dashed border-cream-300 bg-cream-100'}`}
              >
                {displayedImage ? (
                  <img src={displayedImage} alt="logo preview" className="h-full w-full object-contain p-2" />
                ) : (
                  <Building2 size={36} className="text-forest-mid/30" />
                )}
              </div>
              {/* Preview badge */}
              {isPreviewing && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  Preview
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex-1">
              {!isPreviewing ? (
                /* Normal state */
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <Upload size={15} />
                    {company?.logo_url ? t('settings.changeLogo') : t('settings.uploadLogo')}
                  </button>
                  <p className="text-xs text-forest-mid/50 mt-2">PNG, JPG maks 2MB</p>
                </div>
              ) : (
                /* Preview state — show confirm/cancel */
                <div>
                  <p className="text-sm font-semibold text-forest-deep mb-1">
                    Logo baru dipilih
                  </p>
                  <p className="text-xs text-forest-mid/60 mb-3">
                    {pendingFile?.name} · {((pendingFile?.size ?? 0) / 1024).toFixed(0)} KB
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmUpload}
                      disabled={uploadMutation.isPending}
                      className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
                    >
                      <Check size={15} />
                      {uploadMutation.isPending ? 'Mengupload...' : 'Simpan Logo'}
                    </button>
                    <button
                      onClick={cancelPreview}
                      disabled={uploadMutation.isPending}
                      className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4"
                    >
                      <X size={15} />
                      Batal
                    </button>
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="mt-2 text-xs text-forest-mid/60 hover:text-forest-mid underline"
                  >
                    Pilih gambar lain
                  </button>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Company info form */}
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 bg-earth-100 rounded-xl flex items-center justify-center">
              <Building2 size={16} className="text-earth-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">{t('settings.company')}</h2>
          </div>

          <div>
            <label className={labelClass}>{t('settings.companyName')}</label>
            <input {...register('company_name')} className="input-field" placeholder="PT. Tambang Nusantara" />
          </div>

          <div>
            <label className={labelClass}>{t('settings.address')}</label>
            <textarea {...register('address')} rows={2} className="input-field" placeholder="Jl. Pertambangan No. 1, Jakarta" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('settings.phone')}</label>
              <input {...register('phone')} type="tel" className="input-field" placeholder="+62 21 1234 5678" />
            </div>
            <div>
              <label className={labelClass}>{t('settings.email')}</label>
              <input {...register('email')} type="email" className="input-field" placeholder="info@perusahaan.com" />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('settings.website')}</label>
            <input {...register('website')} className="input-field" placeholder="https://perusahaan.com" />
          </div>

          <div className="pt-2 border-t border-cream-200">
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2">
              <Save size={15} />
              {saveMutation.isPending ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
