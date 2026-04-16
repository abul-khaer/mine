import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Employee, Mine } from '../../types';

const schema = z.object({
  mine_id:    z.coerce.number().positive('Tambang wajib dipilih'),
  name:       z.string().min(1, 'Nama wajib diisi'),
  nik:        z.string().min(1, 'NIK wajib diisi'),
  position:   z.string().min(1, 'Jabatan wajib diisi'),
  department: z.string().min(1, 'Departemen wajib diisi'),
  hire_date:  z.string().min(1, 'Tanggal bergabung wajib diisi'),
  status:     z.enum(['active', 'inactive']),
  phone:      z.string().optional(),
  email:      z.string().email().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

interface Props {
  employee: Employee | null;
  mines: Mine[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EmployeeForm({ employee, mines, onSuccess, onCancel }: Props) {
  const { t } = useTranslation();
  const isEdit = !!employee;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { status: 'active' },
  });

  useEffect(() => {
    if (employee) reset({ ...employee, email: employee.email ?? '' });
    else reset({ name: '', nik: '', position: '', department: '', hire_date: '', status: 'active', phone: '', email: '' });
  }, [employee, reset]);

  const mutation = useMutation({
    mutationFn: (data: unknown) =>
      isEdit ? api.put(`/employees/${employee!.id}`, data) : api.post('/employees', data),
    onSuccess: () => {
      toast.success(isEdit ? 'Karyawan berhasil diupdate' : 'Karyawan berhasil ditambahkan');
      onSuccess();
    },
    onError: () => toast.error('Terjadi kesalahan'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tambang */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.mine')}</label>
          <select {...register('mine_id')} className="input-field">
            <option value="">-- Pilih Tambang --</option>
            {mines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {errors.mine_id && <p className="text-xs text-red-500 mt-1">{errors.mine_id.message}</p>}
        </div>

        {/* NIK */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.nik')}</label>
          <input {...register('nik')} className="input-field" placeholder="EMP001" />
          {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik.message}</p>}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.name')}</label>
          <input {...register('name')} className="input-field" placeholder="Nama lengkap" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.position')}</label>
          <input {...register('position')} className="input-field" placeholder="Engineer, Driver, ..." />
          {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.department')}</label>
          <input {...register('department')} className="input-field" placeholder="Operasional, HR, ..." />
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
        </div>

        {/* Hire Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.hireDate')}</label>
          <input {...register('hire_date')} type="date" className="input-field" />
          {errors.hire_date && <p className="text-xs text-red-500 mt-1">{errors.hire_date.message}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('common.status')}</label>
          <select {...register('status')} className="input-field">
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.phone')}</label>
          <input {...register('phone')} type="tel" className="input-field" placeholder="+62..." />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('employees.email')}</label>
          <input {...register('email')} type="email" className="input-field" placeholder="email@..." />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
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
