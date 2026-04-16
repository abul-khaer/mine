import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { CompanySettings } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import { useCompanyStore } from '../../store/companyStore';

export default function SettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const setSettings = useCompanyStore((s) => s.setSettings);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
  });

  const { register, handleSubmit, reset } = useForm<Omit<CompanySettings, 'id' | 'updated_at' | 'logo_url'>>();

  useEffect(() => {
    if (company) reset(company);
  }, [company, reset]);

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
    },
    onError: () => toast.error('Gagal upload logo'),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  return (
    <div>
      <PageHeader title={t('settings.title')} />

      <div className="max-w-2xl space-y-6">
        {/* Logo */}
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} /> {t('settings.logo')}
          </h2>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {company?.logo_url ? (
                <img src={company.logo_url} alt="logo" className="h-full w-full object-contain p-1" />
              ) : (
                <Building2 size={28} className="text-gray-300" />
              )}
            </div>
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadMutation.isPending}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Upload size={15} />
                {uploadMutation.isPending ? t('common.loading') : company?.logo_url ? t('settings.changeLogo') : t('settings.uploadLogo')}
              </button>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG maks 2MB</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        {/* Company info form */}
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="card space-y-4">
          <h2 className="text-base font-semibold text-gray-900 mb-2">{t('settings.company')}</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('settings.companyName')}</label>
            <input {...register('company_name')} className="input-field" placeholder="PT. Tambang Nusantara" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('settings.address')}</label>
            <textarea {...register('address')} rows={2} className="input-field" placeholder="Jl. Pertambangan No. 1, Jakarta" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('settings.phone')}</label>
              <input {...register('phone')} type="tel" className="input-field" placeholder="+62 21 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('settings.email')}</label>
              <input {...register('email')} type="email" className="input-field" placeholder="info@perusahaan.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('settings.website')}</label>
            <input {...register('website')} className="input-field" placeholder="https://perusahaan.com" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
              {saveMutation.isPending ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
