import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { User, Mine, PaginatedResponse } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserForm from './UserForm';

export default function UserManagement() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', page],
    queryFn: () => api.get('/users', { params: { page, limit: 15 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const { data: mines } = useQuery<Mine[]>({
    queryKey: ['mines-select'],
    queryFn: () => api.get('/mines/all').then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success('User berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus user'),
  });

  return (
    <div>
      <PageHeader
        title={t('users.title')}
        action={
          <button onClick={() => { setEditUser(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> {t('users.add')}
          </button>
        }
      />

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">No</th>
                <th className="table-header">{t('users.name')}</th>
                <th className="table-header">{t('users.email')}</th>
                <th className="table-header">{t('users.role')}</th>
                <th className="table-header">{t('users.mine')}</th>
                <th className="table-header">Akses Menu</th>
                <th className="table-header text-center">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-forest-mid/50">
                    <div className="h-8 w-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                    <span className="text-sm">{t('common.loading')}</span>
                  </div>
                </td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-forest-mid/40">
                    <UserCog size={32} />
                    <span className="text-sm">{t('common.noData')}</span>
                  </div>
                </td></tr>
              ) : (
                data?.data.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-cream-100/60 transition-colors">
                    <td className="table-cell text-forest-mid/50 text-xs font-medium">{(page - 1) * 15 + idx + 1}</td>
                    <td className="table-cell font-semibold text-forest-deep">{user.name}</td>
                    <td className="table-cell text-forest-mid">{user.email}</td>
                    <td className="table-cell">
                      <span className="badge bg-primary-100 text-primary-700">
                        {t(`roles.${user.role}` as any)}
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.mine?.name
                        ? <span className="badge bg-earth-100 text-earth-700">{user.mine.name}</span>
                        : <span className="text-forest-mid/40">—</span>
                      }
                    </td>
                    <td className="table-cell">
                      {user.role === 'super_admin' ? (
                        <span className="badge bg-primary-100 text-primary-700">Semua</span>
                      ) : (() => {
                        try {
                          const menus = JSON.parse(user.menu_access ?? '[]');
                          return menus.length > 0
                            ? <span className="badge bg-earth-100 text-earth-700">{menus.length} menu</span>
                            : <span className="text-forest-mid/40">—</span>;
                        } catch { return <span className="text-forest-mid/40">—</span>; }
                      })()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => { setEditUser(user); setModalOpen(true); }} className="p-1.5 text-forest-mid hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(user.id)} className="p-1.5 text-forest-mid hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.total_pages > 1 && (
          <Pagination page={page} totalPages={data.total_pages} total={data.total} limit={15} onPageChange={setPage} />
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? t('users.edit') : t('users.add')} size="lg">
        <UserForm
          user={editUser}
          mines={mines ?? []}
          onSuccess={() => { setModalOpen(false); qc.invalidateQueries({ queryKey: ['users'] }); }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message={t('users.deleteConfirm')}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
