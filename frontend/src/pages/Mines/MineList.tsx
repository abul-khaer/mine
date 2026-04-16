import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { Mine, PaginatedResponse } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MineForm from './MineForm';
import { useAuthStore } from '../../store/authStore';

export default function MineList() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { hasRole } = useAuthStore();
  const canEdit = hasRole('super_admin', 'admin_tambang');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMine, setEditMine] = useState<Mine | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Mine>>({
    queryKey: ['mines', page, search],
    queryFn: () =>
      api.get('/mines', { params: { page, limit: 10, search } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/mines/${id}`),
    onSuccess: () => {
      toast.success('Tambang berhasil dihapus');
      qc.invalidateQueries({ queryKey: ['mines'] });
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus tambang'),
  });

  const openAdd = () => { setEditMine(null); setModalOpen(true); };
  const openEdit = (mine: Mine) => { setEditMine(mine); setModalOpen(true); };

  return (
    <div>
      <PageHeader
        title={t('mines.title')}
        action={
          canEdit ? (
            <button onClick={openAdd} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> {t('mines.add')}
            </button>
          ) : undefined
        }
      />

      {/* Search */}
      <div className="card mb-5">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`${t('common.search')} tambang...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">No</th>
                <th className="table-header">{t('mines.name')}</th>
                <th className="table-header">{t('mines.mineralType')}</th>
                <th className="table-header">{t('mines.location')}</th>
                <th className="table-header">{t('mines.area')}</th>
                <th className="table-header">{t('mines.phone')}</th>
                <th className="table-header">{t('mines.employees')}</th>
                {canEdit && <th className="table-header text-center">{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                data?.data.map((mine, idx) => (
                  <tr key={mine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-gray-400">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="table-cell font-semibold text-gray-900">{mine.name}</td>
                    <td className="table-cell">
                      <span className="badge bg-yellow-100 text-yellow-800">{mine.mineral_type}</span>
                    </td>
                    <td className="table-cell text-gray-600">{mine.location}</td>
                    <td className="table-cell">{mine.area.toLocaleString('id-ID')} Ha</td>
                    <td className="table-cell text-gray-600">{mine.phone || '—'}</td>
                    <td className="table-cell font-medium">
                      {mine.employee_count?.toLocaleString('id-ID') ?? 0}
                    </td>
                    {canEdit && (
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(mine)}
                            className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(mine.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
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
          <Pagination
            page={page}
            totalPages={data.total_pages}
            total={data.total}
            limit={10}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMine ? t('mines.edit') : t('mines.add')}
        size="lg"
      >
        <MineForm
          mine={editMine}
          onSuccess={() => {
            setModalOpen(false);
            qc.invalidateQueries({ queryKey: ['mines'] });
          }}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message={t('mines.deleteConfirm')}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
