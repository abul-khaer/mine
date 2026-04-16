import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShieldCheck, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import { useRoleAccessStore, type RoleAccessItem } from '../../store/roleAccessStore';

// ── Menu definitions ──────────────────────────────────────────────────────────
const MENUS = [
  { key: 'dashboard',          label: 'Dashboard',          group: 'Menu Utama' },
  { key: 'mines',              label: 'Tambang',             group: 'Menu Utama' },
  { key: 'employees',          label: 'Karyawan',            group: 'Menu Utama' },
  { key: 'master_data',        label: 'Master Data',         group: 'Menu Utama' },
  { key: 'reports_employee',   label: 'Laporan Karyawan',   group: 'Laporan' },
  { key: 'reports_production', label: 'Laporan Produksi',   group: 'Laporan' },
  { key: 'reports_financial',  label: 'Laporan Keuangan',   group: 'Laporan' },
  { key: 'reports_activity',   label: 'Laporan Kegiatan',   group: 'Laporan' },
  { key: 'reports_issue',      label: 'Laporan Insiden',    group: 'Laporan' },
  { key: 'users',              label: 'Manajemen User',      group: 'Admin' },
  { key: 'settings',           label: 'Pengaturan',          group: 'Admin' },
  { key: 'role_access',        label: 'Hak Akses',           group: 'Admin' },
];

// ── Role definitions ──────────────────────────────────────────────────────────
const ROLES = [
  { key: 'super_admin',      label: 'Super Admin',      locked: true },
  { key: 'admin_tambang',    label: 'Admin Tambang',    locked: false },
  { key: 'finance',          label: 'Finance',          locked: false },
  { key: 'accounting',       label: 'Accounting',       locked: false },
  { key: 'kepala_tambang',   label: 'Kepala Tambang',   locked: false },
  { key: 'manager_produksi', label: 'Manager Produksi', locked: false },
  { key: 'staff',            label: 'Staff',            locked: false },
  { key: 'hr',               label: 'HR',               locked: false },
  { key: 'manager_hr',       label: 'Manager HR',       locked: false },
  { key: 'manager_finance',  label: 'Manager Finance',  locked: false },
  { key: 'procurement',      label: 'Procurement',      locked: false },
];

type AccessMatrix = Record<string, Record<string, boolean>>;

function buildMatrix(items: RoleAccessItem[]): AccessMatrix {
  const matrix: AccessMatrix = {};
  // Initialize all to false
  for (const menu of MENUS) {
    matrix[menu.key] = {};
    for (const role of ROLES) {
      matrix[menu.key][role.key] = false;
    }
  }
  // Apply API values
  for (const item of items) {
    if (matrix[item.menu_key]) {
      matrix[item.menu_key][item.role] = item.has_access;
    }
  }
  // super_admin always has access (locked)
  for (const menu of MENUS) {
    matrix[menu.key]['super_admin'] = true;
  }
  return matrix;
}

function matrixToItems(matrix: AccessMatrix): RoleAccessItem[] {
  const items: RoleAccessItem[] = [];
  for (const menu of MENUS) {
    for (const role of ROLES) {
      items.push({
        menu_key: menu.key,
        role: role.key,
        has_access: role.locked ? true : (matrix[menu.key]?.[role.key] ?? false),
      });
    }
  }
  return items;
}

// Group menus by group label
const GROUPS = Array.from(new Set(MENUS.map((m) => m.group)));

export default function RoleAccessPage() {
  const setFromApi = useRoleAccessStore((s) => s.setFromApi);
  const [matrix, setMatrix] = useState<AccessMatrix>(() => buildMatrix([]));
  const [dirty, setDirty] = useState(false);

  const { data: apiItems = [], isLoading } = useQuery<RoleAccessItem[]>({
    queryKey: ['role-access'],
    queryFn: () => api.get('/role-access').then((r) => r.data),
  });

  useEffect(() => {
    if (apiItems.length > 0) {
      setMatrix(buildMatrix(apiItems));
      setDirty(false);
    }
  }, [apiItems]);

  const saveMutation = useMutation({
    mutationFn: (items: RoleAccessItem[]) =>
      api.put('/role-access', { items }).then((r) => r.data),
    onSuccess: (saved: RoleAccessItem[]) => {
      toast.success('Hak akses berhasil disimpan');
      setFromApi(saved); // update sidebar immediately
      setDirty(false);
    },
    onError: () => toast.error('Gagal menyimpan hak akses'),
  });

  const toggle = (menuKey: string, roleKey: string) => {
    setMatrix((prev) => ({
      ...prev,
      [menuKey]: {
        ...prev[menuKey],
        [roleKey]: !prev[menuKey][roleKey],
      },
    }));
    setDirty(true);
  };

  const handleReset = () => {
    setMatrix(buildMatrix(apiItems));
    setDirty(false);
  };

  return (
    <div>
      <PageHeader title="Hak Akses Menu" />

      <div className="card p-0 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShieldCheck size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-forest-deep">Pengaturan Hak Akses</p>
              <p className="text-xs text-forest-mid/60">Centang menu yang boleh diakses setiap role</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && (
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-1.5 text-sm py-1.5 px-3"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            )}
            <button
              onClick={() => saveMutation.mutate(matrixToItems(matrix))}
              disabled={saveMutation.isPending || !dirty}
              className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3 disabled:opacity-50"
            >
              <Save size={14} />
              {saveMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 bg-cream-50 border-b border-cream-200 flex items-center gap-4 text-xs text-forest-mid/60">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-primary-100 border border-primary-300" />
            Akses diberikan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-cream-200 border border-cream-300" />
            Tidak ada akses
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-4 rounded bg-forest-bg/20 border border-forest-bg/30" />
            Super Admin (terkunci)
          </span>
        </div>

        {/* Matrix table */}
        {isLoading ? (
          <div className="py-16 text-center text-forest-mid/40 text-sm">Memuat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-cream-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-forest-mid uppercase tracking-wide border-b border-cream-200 w-48 sticky left-0 bg-cream-50 z-10">
                    Menu
                  </th>
                  {ROLES.map((role) => (
                    <th
                      key={role.key}
                      className={`px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide border-b border-cream-200 min-w-[90px] ${
                        role.locked ? 'text-forest-mid/40' : 'text-forest-mid'
                      }`}
                    >
                      {role.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((group) => {
                  const groupMenus = MENUS.filter((m) => m.group === group);
                  return (
                    <>
                      {/* Group header row */}
                      <tr key={`group-${group}`} className="bg-earth-50/60">
                        <td
                          colSpan={ROLES.length + 1}
                          className="px-5 py-2 text-xs font-bold text-earth-700 uppercase tracking-widest sticky left-0 bg-earth-50/60"
                        >
                          {group}
                        </td>
                      </tr>

                      {/* Menu rows */}
                      {groupMenus.map((menu) => (
                        <tr
                          key={menu.key}
                          className="border-b border-cream-100 hover:bg-cream-50/60 transition-colors"
                        >
                          <td className="px-5 py-3 text-sm font-medium text-forest-deep sticky left-0 bg-white hover:bg-cream-50/60 z-10">
                            {menu.label}
                          </td>
                          {ROLES.map((role) => {
                            const checked = role.locked
                              ? true
                              : (matrix[menu.key]?.[role.key] ?? false);
                            return (
                              <td key={role.key} className="px-2 py-3 text-center">
                                <button
                                  onClick={() =>
                                    !role.locked && toggle(menu.key, role.key)
                                  }
                                  disabled={role.locked}
                                  title={role.locked ? 'Super Admin selalu punya akses penuh' : undefined}
                                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all ${
                                    role.locked
                                      ? 'bg-forest-bg/15 border-forest-bg/25 cursor-not-allowed'
                                      : checked
                                      ? 'bg-primary-500 border-primary-500 hover:bg-primary-600'
                                      : 'bg-white border-cream-300 hover:border-primary-300'
                                  }`}
                                >
                                  {checked && (
                                    <svg
                                      className={`w-3.5 h-3.5 ${role.locked ? 'text-forest-mid/50' : 'text-white'}`}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-cream-200 bg-cream-50">
          <p className="text-xs text-forest-mid/50">
            * Super Admin selalu memiliki akses ke seluruh menu dan tidak dapat diubah.
            Perubahan akan langsung berlaku setelah disimpan.
          </p>
        </div>
      </div>
    </div>
  );
}
