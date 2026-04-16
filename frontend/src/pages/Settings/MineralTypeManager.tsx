import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X, Gem } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface MineralType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export default function MineralTypeManager() {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [addName, setAddName] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery<MineralType[]>({
    queryKey: ['mineral-types-admin'],
    queryFn: () => api.get('/mineral-types/all').then((r) => r.data),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['mineral-types-admin'] });
    qc.invalidateQueries({ queryKey: ['mineral-types'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/mineral-types', data),
    onSuccess: () => { toast.success('Mineral type ditambahkan'); invalidate(); setAddOpen(false); setAddName(''); setAddDesc(''); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Gagal menambahkan'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; name: string; description?: string }) =>
      api.put(`/mineral-types/${id}`, data),
    onSuccess: () => { toast.success('Berhasil diupdate'); invalidate(); setEditId(null); },
    onError: () => toast.error('Gagal mengupdate'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      api.put(`/mineral-types/${id}`, { is_active }),
    onSuccess: () => invalidate(),
    onError: () => toast.error('Gagal mengubah status'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/mineral-types/${id}`),
    onSuccess: () => { toast.success('Mineral type dihapus'); invalidate(); setDeleteId(null); },
    onError: () => toast.error('Gagal menghapus'),
  });

  const startEdit = (item: MineralType) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditDesc(item.description ?? '');
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-earth-100 rounded-xl flex items-center justify-center">
            <Gem size={16} className="text-earth-600" />
          </div>
          <h2 className="text-base font-bold text-forest-deep">Master Jenis Mineral</h2>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
        >
          <Plus size={15} /> Tambah
        </button>
      </div>

      {/* Add form */}
      {addOpen && (
        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Tambah Jenis Mineral Baru</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Nama mineral (contoh: Nikel)"
              className="input-field text-sm"
            />
            <input
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              placeholder="Deskripsi (opsional)"
              className="input-field text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate({ name: addName.trim(), description: addDesc.trim() || undefined })}
              disabled={!addName.trim() || createMutation.isPending}
              className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5"
            >
              <Check size={14} /> Simpan
            </button>
            <button onClick={() => { setAddOpen(false); setAddName(''); setAddDesc(''); }} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
              <X size={14} /> Batal
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Nama Mineral</th>
              <th className="table-header">Deskripsi</th>
              <th className="table-header text-center">Status</th>
              <th className="table-header text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8 text-forest-mid/40">Memuat...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-forest-mid/40">Belum ada data</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-cream-100/60 transition-colors">
                  <td className="table-cell">
                    {editId === item.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-field text-sm py-1.5"
                      />
                    ) : (
                      <span className="font-semibold text-forest-deep">{item.name}</span>
                    )}
                  </td>
                  <td className="table-cell text-forest-mid">
                    {editId === item.id ? (
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="input-field text-sm py-1.5"
                        placeholder="Deskripsi (opsional)"
                      />
                    ) : (
                      item.description || <span className="text-forest-mid/30">—</span>
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, is_active: !item.is_active })}
                      className={`badge cursor-pointer transition-colors ${
                        item.is_active
                          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          : 'bg-cream-200 text-forest-mid hover:bg-cream-300'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-center gap-1.5">
                      {editId === item.id ? (
                        <>
                          <button
                            onClick={() => updateMutation.mutate({ id: item.id, name: editName.trim(), description: editDesc.trim() || undefined })}
                            disabled={!editName.trim() || updateMutation.isPending}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Simpan"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="p-1.5 text-forest-mid hover:bg-cream-200 rounded-lg transition-colors"
                            title="Batal"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-forest-mid hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 text-forest-mid hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        message="Hapus mineral type ini? Tambang yang menggunakan jenis ini tidak akan terpengaruh."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
