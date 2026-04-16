import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Mountain } from 'lucide-react';
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
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-mid/50" />
          <input
            type="text"
            placeholder={`${t('common.search')} tambang...`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
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
            <tbody className="divide-y divide-cream-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-forest-mid/50">
                      <div className="h-8 w-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                      <span className="text-sm">{t('common.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-forest-mid/40">
                      <Mountain size={32} />
                      <span className="text-sm">{t('common.noData')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data.map((mine, idx) => (
                  <tr key={mine.id} className="hover:bg-cream-100/60 transition-colors">
                    <td className="table-cell text-forest-mid/50 text-xs font-medium">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="table-cell font-semibold text-forest-deep">{mine.name}</td>
                    <td className="table-cell">
                      <span className="badge bg-earth-100 text-earth-700">{mine.mineral_type}</span>
                    </td>
                    <td className="table-cell text-forest-mid">{mine.location}</td>
                    <td className="table-cell text-forest-mid">{Number(mine.area).toLocaleString('id-ID')} Ha</td>
                    <td className="table-cell text-forest-mid">{mine.phone || '—'}</td>
                    <td className="table-cell font-semibold text-forest-deep">
                      {mine.employee_count?.toLocaleString('id-ID') ?? 0}
                    </td>
                    {canEdit && (
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(mine)}
                            className="p-1.5 text-forest-mid hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(mine.id)}
                            className="p-1.5 text-forest-mid hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
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
