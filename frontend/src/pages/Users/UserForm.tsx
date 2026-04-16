import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { User, Mine, Role } from '../../types';

const ROLES: Role[] = [
  'super_admin','admin_tambang','finance','accounting',
  'kepala_tambang','manager_produksi','staff','hr',
  'manager_hr','manager_finance','procurement',
];

const schema = z.object({
  name:     z.string().min(1, 'Nama wajib diisi'),
  email:    z.string().email('Email tidak valid'),
  role:     z.enum(['super_admin','admin_tambang','finance','accounting',
                    'kepala_tambang','manager_produksi','staff','hr',
                    'manager_hr','manager_finance','procurement']),
  mine_id:  z.coerce.number().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

interface Props {
  user: User | null;
  mines: Mine[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({ user, mines, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = !!user;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  useEffect(() => {
    if (user) reset({ ...user, password: '' });
    else reset({ name: '', email: '', role: 'staff', password: '' });
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: unknown) =>
      isEdit ? api.put(`/users/${user!.id}`, data) : api.post('/users', data),
    onSuccess: () => {
      toast.success(isEdit ? 'User berhasil diupdate' : 'User berhasil ditambahkan');
      onSuccess();
    },
    onError: () => toast.error('Terjadi kesalahan'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('users.name')}</label>
        <input {...register('name')} className="input-field" placeholder="Nama lengkap" />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('users.email')}</label>
        <input {...register('email')} type="email" className="input-field" placeholder="email@perusahaan.com" />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('users.role')}</label>
        <select {...register('role')} className="input-field">
          {ROLES.map((r) => (
            <option key={r} value={r}>{t(`roles.${r}` as any)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('users.mine')}</label>
        <select {...register('mine_id')} className="input-field">
          <option value="">-- Tidak terkait tambang --</option>
          {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('users.password')} {isEdit && <span className="text-xs text-gray-400">(kosongkan jika tidak diubah)</span>}
        </label>
        <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">{t('common.cancel')}</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
}
