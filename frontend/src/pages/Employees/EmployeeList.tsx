import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Employee, Mine, PaginatedResponse } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmployeeForm from './EmployeeForm';
import { useAuthStore } from '../../store/authStore';

export default function EmployeeList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { hasRole } = useAuthStore();
  const canEdit = hasRole('super_admin', 'admin_tambang', 'hr', 'manager_hr');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [mineFilter, setMineFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ['employees', page, search, mineFilter],
    queryFn: () =>
      api.get('/employees', {
        params: { page, limit: 10, search, mine_id: mineFilter || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: mines } = useQuery<Mine[]>({
    queryKey: ['mines-select'],
    queryFn: () => api.get('/mines/all').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/employees/${id}`),
    onSuccess: () => {
      toast.success('Karyawan berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['employees'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus karyawan'),
  });

  const openAdd = () => { setEditEmployee(null); setModalOpen(true); };
  const openEdit = (emp: Employee) => { setEditEmployee(emp); setModalOpen(true); };

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        action={
          canEdit ? (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> {t('employees.add')}
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('common.search')} karyawan...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
        <select
          value={mineFilter}
          onChange={(e) => { setMineFilter(e.target.value); setPage(1); }}
          className="input-field max-w-xs"
        >
          <option value="">{t('common.all')} Tambang</option>
          {mines?.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">No</th>
                <th className="table-header">{t('employees.nik')}</th>
                <th className="table-header">{t('employees.name')}</th>
                <th className="table-header">{t('employees.position')}</th>
                <th className="table-header">{t('employees.department')}</th>
                <th className="table-header">{t('employees.mine')}</th>
                <th className="table-header">{t('common.status')}</th>
                {canEdit && <th className="table-header text-center">{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                data?.data.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400">{(page - 1) * 10 + idx + 1}</td>
                    <td className="table-cell font-mono text-xs">{emp.nik}</td>
                    <td className="table-cell font-semibold text-gray-900">{emp.name}</td>
                    <td className="table-cell">{emp.position}</td>
                    <td className="table-cell text-gray-600">{emp.department}</td>
                    <td className="table-cell text-gray-600">{emp.mine?.name ?? '—'}</td>
                    <td className="table-cell">
                      <span className={`badge ${emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {emp.status === 'active' ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(emp)} className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteId(emp.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.total_pages > 1 && (
          <Pagination page={page} totalPages={data.total_pages} total={data.total} limit={10} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editEmployee ? t('employees.edit') : t('employees.add')} size="lg">
        <EmployeeForm
          employee={editEmployee}
          mines={mines ?? []}
          onSuccess={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['employees'] }); }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message={t('employees.deleteConfirm')}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
