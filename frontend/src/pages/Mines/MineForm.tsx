import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Mine } from '../../types';

const schema = z.object({
  name:         z.string().min(1, 'Nama wajib diisi'),
  location:     z.string().min(1, 'Lokasi wajib diisi'),
  address:      z.string().min(1, 'Alamat wajib diisi'),
  area:         z.coerce.number().positive('Luas harus lebih dari 0'),
  mineral_type: z.string().min(1, 'Jenis mineral wajib dipilih'),
  phone:        z.string().optional(),
  coordinates:  z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface MineralTypeOption {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  mine: Mine | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const labelClass = 'block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5';

export default function MineForm({ mine, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = !!mine;

  const { data: mineralTypes = [] } = useQuery<MineralTypeOption[]>({
    queryKey: ['master-data-select', 'mineral_type'],
    queryFn: () => api.get('/master-data?category=mineral_type').then((r) => r.data),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (mine) {
      const coordinates = (mine.latitude && mine.longitude)
        ? `${mine.latitude}, ${mine.longitude}`
        : '';
      reset({ ...mine, coordinates } as any);
    } else {
      reset({ name: '', location: '', address: '', area: 0, mineral_type: '', phone: '', coordinates: '' });
    }
  }, [mine, reset]);

  const parseCoordinates = (raw: string | undefined) => {
    if (!raw?.trim()) return {};
    const parts = raw.split(',');
    const lat = parseFloat(parts[0]?.trim());
    const lng = parseFloat(parts[1]?.trim());
    return {
      latitude:  isNaN(lat) ? undefined : lat,
      longitude: isNaN(lng) ? undefined : lng,
    };
  };

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
      <label className={labelClass}>{label}</label>
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
    <form
      onSubmit={handleSubmit(({ coordinates, ...rest }) =>
        mutation.mutate({ ...rest, ...parseCoordinates(coordinates) })
      )}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('name', t('mines.name'), 'text', 'Tambang Emas A')}

        {/* Mineral Type Dropdown */}
        <div>
          <label className={labelClass}>{t('mines.mineralType')}</label>
          <select {...register('mineral_type')} className="input-field">
            <option value="">-- Pilih Jenis Mineral --</option>
            {mineralTypes.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
                {m.description ? ` — ${m.description}` : ''}
              </option>
            ))}
          </select>
          {errors.mineral_type && (
            <p className="text-xs text-red-500 mt-1">{errors.mineral_type.message}</p>
          )}
        </div>

        {field('location', t('mines.location'), 'text', 'Kalimantan Timur')}
        {field('phone', t('mines.phone'), 'tel', '+62...')}
        {field('area', t('mines.area'), 'number', '1000')}
      </div>

      <div>
        <label className={labelClass}>{t('mines.address')}</label>
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

      <div>
        <label className={labelClass}>Koordinat (Google Maps)</label>
        <input
          {...register('coordinates')}
          className="input-field"
          placeholder="-5.1531805022114945, 119.40575966650356"
        />
        <p className="text-xs text-forest-mid/50 mt-1">
          Paste koordinat dari Google Maps (latitude, longitude)
        </p>
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
