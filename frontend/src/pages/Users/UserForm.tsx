import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { User, Mine, Role } from '../../types';
import { ALL_MENUS } from '../../utils/roleAccess';

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

const labelClass = 'block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5';

// Group menus by group
const menuGroups = ALL_MENUS.reduce((acc, menu) => {
  if (!acc[menu.group]) acc[menu.group] = [];
  acc[menu.group].push(menu);
  return acc;
}, {} as Record<string, typeof ALL_MENUS[number][]>);

export default function UserForm({ user, mines, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = !!user;
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      reset({ ...user, password: '' });
      // Parse existing menu_access
      try {
        const parsed = JSON.parse(user.menu_access ?? '[]');
        setSelectedMenus(Array.isArray(parsed) ? parsed : []);
      } catch {
        setSelectedMenus([]);
      }
    } else {
      reset({ name: '', email: '', role: 'staff', password: '' });
      setSelectedMenus(['dashboard']);
    }
  }, [user, reset]);

  const toggleMenu = (key: string) => {
    setSelectedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleGroup = (group: string) => {
    const groupKeys = menuGroups[group].map((m) => m.key);
    const allSelected = groupKeys.every((k) => selectedMenus.includes(k));
    if (allSelected) {
      setSelectedMenus((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setSelectedMenus((prev) => [...new Set([...prev, ...groupKeys])]);
    }
  };

  const selectAll = () => {
    setSelectedMenus(ALL_MENUS.map((m) => m.key));
  };

  const deselectAll = () => {
    setSelectedMenus([]);
  };

  const mutation = useMutation({
    mutationFn: (data: unknown) =>
      isEdit ? api.put(`/users/${user!.id}`, data) : api.post('/users', data),
    onSuccess: () => {
      toast.success(isEdit ? 'User berhasil diupdate' : 'User berhasil ditambahkan');
      onSuccess();
    },
    onError: () => toast.error('Terjadi kesalahan'),
  });

  const onSubmit = (d: FormData) => {
    mutation.mutate({
      ...d,
      menu_access: d.role === 'super_admin' ? ALL_MENUS.map((m) => m.key) : selectedMenus,
    });
  };

  const isSuperAdmin = selectedRole === 'super_admin';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('users.name')}</label>
          <input {...register('name')} className="input-field" placeholder="Nama lengkap" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelClass}>{t('users.email')}</label>
          <input {...register('email')} type="email" className="input-field" placeholder="email@perusahaan.com" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t('users.role')}</label>
          <select {...register('role')} className="input-field">
            {ROLES.map((r) => (
              <option key={r} value={r}>{t(`roles.${r}` as any)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t('users.mine')}</label>
          <select {...register('mine_id')} className="input-field">
            <option value="">-- Tidak terkait tambang --</option>
            {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {t('users.password')}{' '}
          {isEdit && <span className="normal-case font-normal text-forest-mid/50">(kosongkan jika tidak diubah)</span>}
        </label>
        <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {/* Menu Access */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + ' mb-0'}>Akses Menu</label>
          {!isSuperAdmin && (
            <div className="flex gap-2">
              <button type="button" onClick={selectAll} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Pilih Semua
              </button>
              <span className="text-xs text-forest-mid/30">|</span>
              <button type="button" onClick={deselectAll} className="text-xs text-red-500 hover:text-red-600 font-medium">
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {isSuperAdmin ? (
          <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-700">
            Super Admin memiliki akses ke <strong>semua menu</strong> secara otomatis.
          </div>
        ) : (
          <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 space-y-4">
            {Object.entries(menuGroups).map(([group, menus]) => {
              const groupKeys = menus.map((m) => m.key);
              const allChecked = groupKeys.every((k) => selectedMenus.includes(k));
              const someChecked = groupKeys.some((k) => selectedMenus.includes(k));

              return (
                <div key={group}>
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="flex items-center gap-2 mb-2 group/header"
                  >
                    <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                      allChecked
                        ? 'bg-primary-600 border-primary-600'
                        : someChecked
                        ? 'bg-primary-200 border-primary-400'
                        : 'bg-white border-cream-400 group-hover/header:border-primary-400'
                    }`}>
                      {(allChecked || someChecked) && <Check size={10} className={allChecked ? 'text-white' : 'text-primary-600'} />}
                    </div>
                    <span className="text-xs font-bold text-forest-deep uppercase tracking-wider">{group}</span>
                  </button>

                  {/* Menu items */}
                  <div className="grid grid-cols-2 gap-1.5 ml-6">
                    {menus.map((menu) => {
                      const checked = selectedMenus.includes(menu.key);
                      return (
                        <button
                          key={menu.key}
                          type="button"
                          onClick={() => toggleMenu(menu.key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                            checked
                              ? 'bg-primary-100 text-primary-700 font-medium'
                              : 'bg-white text-forest-mid hover:bg-cream-100 border border-cream-200'
                          }`}
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-cream-400'
                          }`}>
                            {checked && <Check size={10} className="text-white" />}
                          </div>
                          <span className="truncate">{menu.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-2 border-t border-cream-200">
        <button type="button" onClick={onCancel} className="btn-secondary">{t('common.cancel')}</button>
        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
}
