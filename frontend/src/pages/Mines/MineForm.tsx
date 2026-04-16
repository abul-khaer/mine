import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Mine } from '../../types';

const schema = z.object({
  name:         z.string().min(1, 'Nama wajib diisi'),
  location:     z.string().min(1, 'Lokasi wajib diisi'),
  address:      z.string().min(1, 'Alamat wajib diisi'),
  area:         z.coerce.number().positive('Luas harus lebih dari 0'),
  mineral_type: z.string().min(1, 'Jenis mineral wajib diisi'),
  phone:        z.string().optional(),
  latitude:     z.coerce.number().optional(),
  longitude:    z.coerce.number().optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  mine: Mine | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MineForm({ mine, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = !!mine;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (mine) reset(mine);
    else reset({ name: '', location: '', address: '', area: 0, mineral_type: '', phone: '' });
  }, [mine, reset]);

  const mutation = useMutation({
    mutationFn: (data: unknown) =>
      isEdit
        ? api.put(`/mines/${mine!.id}`, data)
        : api.post('/mines', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Tambang berhasil diupdate' : 'Tambang berhasil ditambahkan');
      onSuccess();
    },
    onError: () => toast.error('Terjadi kesalahan, coba lagi'),
  });

  const field = (
    key: keyof FormData,
    label: string,
    type: string = 'text',
    placeholder?: string
  ) => (
    <div>
      <label className="block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5">{label}</label>
      <input
        {...register(key)}
        type={type}
        placeholder={placeholder}
        className="input-field"
      />
      {errors[key] && (
        <p className="text-xs text-red-500 mt-1">{errors[key]?.message}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name', t('mines.name'), 'text', 'Tambang Emas A')}
        {field('mineral_type', t('mines.mineralType'), 'text', 'Emas, Batubara, ...')}
        {field('location', t('mines.location'), 'text', 'Kalimantan Timur')}
        {field('phone', t('mines.phone'), 'tel', '+62...')}
        {field('area', t('mines.area'), 'number', '1000')}
      </div>
      <div>
        <label className="block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5">
          {t('mines.address')}
        </label>
        <textarea
          {...register('address')}
          rows={2}
          className="input-field"
          placeholder="Jl. Pertambangan No. 1, ..."
        />
        {errors.address && (
          <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field('latitude', 'Latitude', 'number', '-0.502')}
        {field('longitude', 'Longitude', 'number', '117.153')}
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-cream-200">
        <button type="button" onClick={onCancel} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
}
