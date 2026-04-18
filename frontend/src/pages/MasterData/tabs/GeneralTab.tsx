import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Eye, Target, FileText, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import type { CompanySettings } from '../../../types';
import { useCompanyStore } from '../../../store/companyStore';
import { useState } from 'react';

const labelClass = 'block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5';

interface GeneralForm {
  vision: string;
  mission: string;
  footer_text: string;
}

export default function GeneralTab() {
  const qc = useQueryClient();
  const setSettings = useCompanyStore((s) => s.setSettings);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm<GeneralForm>();
  const [missionItems, setMissionItems] = useState<string[]>([]);
  const [newMission, setNewMission] = useState('');

  useEffect(() => {
    if (company) {
      reset({
        vision: company.vision ?? '',
        mission: company.mission ?? '',
        footer_text: company.footer_text ?? '',
      });
      // Parse mission items (stored as JSON array or newline-separated)
      try {
        const parsed = JSON.parse(company.mission ?? '[]');
        if (Array.isArray(parsed)) setMissionItems(parsed);
        else setMissionItems(company.mission ? company.mission.split('\n').filter(Boolean) : []);
      } catch {
        setMissionItems(company.mission ? company.mission.split('\n').filter(Boolean) : []);
      }
    }
  }, [company, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: Partial<CompanySettings>) => api.put('/settings/company', data).then((r) => r.data),
    onSuccess: (data) => {
      toast.success('Data berhasil disimpan');
      setSettings(data);
      qc.invalidateQueries({ queryKey: ['company-settings'] });
    },
    onError: () => toast.error('Gagal menyimpan data'),
  });

  const addMission = () => {
    if (newMission.trim()) {
      const updated = [...missionItems, newMission.trim()];
      setMissionItems(updated);
      setValue('mission', JSON.stringify(updated));
      setNewMission('');
    }
  };

  const removeMission = (index: number) => {
    const updated = missionItems.filter((_, i) => i !== index);
    setMissionItems(updated);
    setValue('mission', JSON.stringify(updated));
  };

  const onSubmit = (data: GeneralForm) => {
    saveMutation.mutate({
      vision: data.vision,
      mission: JSON.stringify(missionItems),
      footer_text: data.footer_text,
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Visi */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
              <Eye size={16} className="text-primary-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">Visi Perusahaan</h2>
          </div>
          <div>
            <label className={labelClass}>Visi</label>
            <textarea
              {...register('vision')}
              rows={3}
              className="input-field"
              placeholder="Masukkan visi perusahaan..."
            />
            <p className="text-xs text-forest-mid/50 mt-1">Akan ditampilkan di halaman beranda</p>
          </div>
        </div>

        {/* Misi */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-earth-100 rounded-xl flex items-center justify-center">
              <Target size={16} className="text-earth-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">Misi Perusahaan</h2>
          </div>

          {/* Mission list */}
          <div className="space-y-2 mb-4">
            {missionItems.length === 0 && (
              <p className="text-sm text-forest-mid/50 italic">Belum ada misi ditambahkan</p>
            )}
            {missionItems.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-cream-50 border border-cream-200 rounded-xl px-4 py-3">
                <span className="text-xs font-bold text-primary-600 bg-primary-100 rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-forest-deep flex-1">{item}</p>
                <button
                  type="button"
                  onClick={() => removeMission(index)}
                  className="text-red-400 hover:text-red-600 shrink-0 p-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add new mission */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMission}
              onChange={(e) => setNewMission(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMission(); } }}
              placeholder="Tambah misi baru..."
              className="input-field flex-1"
            />
            <button
              type="button"
              onClick={addMission}
              disabled={!newMission.trim()}
              className="btn-secondary flex items-center gap-1.5 text-sm shrink-0"
            >
              <Plus size={14} /> Tambah
            </button>
          </div>
          <p className="text-xs text-forest-mid/50 mt-2">Tekan Enter atau klik Tambah untuk menambahkan misi</p>
        </div>

        {/* Footer */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-forest-dark/10 rounded-xl flex items-center justify-center">
              <FileText size={16} className="text-forest-dark" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">Teks Footer</h2>
          </div>
          <div>
            <label className={labelClass}>Footer</label>
            <input
              {...register('footer_text')}
              className="input-field"
              placeholder="© 2026 PT. Nama Perusahaan. All rights reserved."
            />
            <p className="text-xs text-forest-mid/50 mt-1">Teks yang ditampilkan di bagian bawah halaman beranda. Kosongkan untuk menggunakan default.</p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2">
            <Save size={15} />
            {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
