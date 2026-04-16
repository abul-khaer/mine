import { create } from 'zustand';

export interface RoleAccessItem {
  menu_key: string;
  role: string;
  has_access: boolean;
}

// Static fallback — matches roleAccess.ts defaults
const DEFAULT_ACCESS: Record<string, string[]> = {
  dashboard:          ['super_admin', 'admin_tambang', 'finance', 'accounting', 'kepala_tambang', 'manager_produksi', 'staff', 'hr', 'manager_hr', 'manager_finance', 'procurement'],
  mines:              ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi'],
  employees:          ['super_admin', 'admin_tambang', 'hr', 'manager_hr'],
  master_data:        ['super_admin', 'admin_tambang'],
  reports_employee:   ['super_admin', 'admin_tambang', 'hr', 'manager_hr'],
  reports_production: ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff'],
  reports_financial:  ['super_admin', 'finance', 'accounting', 'manager_finance'],
  reports_activity:   ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff'],
  reports_issue:      ['super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi'],
  users:              ['super_admin'],
  settings:           ['super_admin'],
  role_access:        ['super_admin'],
};

interface RoleAccessStore {
  accessMap: Record<string, string[]>;
  loaded: boolean;
  setFromApi: (items: RoleAccessItem[]) => void;
}

export const useRoleAccessStore = create<RoleAccessStore>((set) => ({
  accessMap: DEFAULT_ACCESS,
  loaded: false,
  setFromApi: (items: RoleAccessItem[]) => {
    const map: Record<string, string[]> = {};
    for (const item of items) {
      if (item.has_access) {
        if (!map[item.menu_key]) map[item.menu_key] = [];
        map[item.menu_key].push(item.role);
      }
    }
    set({ accessMap: map, loaded: true });
  },
}));
