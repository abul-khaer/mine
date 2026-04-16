import type { Role } from '../types';

// Menu visibility per role
export const menuAccess: Record<string, Role[]> = {
  dashboard: [
    'super_admin', 'admin_tambang', 'finance', 'accounting',
    'kepala_tambang', 'manager_produksi', 'staff', 'hr',
    'manager_hr', 'manager_finance', 'procurement',
  ],
  mines: [
    'super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi',
  ],
  employees: [
    'super_admin', 'admin_tambang', 'hr', 'manager_hr',
  ],
  reports_employee: [
    'super_admin', 'admin_tambang', 'hr', 'manager_hr',
  ],
  reports_production: [
    'super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff',
  ],
  reports_financial: [
    'super_admin', 'finance', 'accounting', 'manager_finance',
  ],
  reports_activity: [
    'super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi', 'staff',
  ],
  reports_issue: [
    'super_admin', 'admin_tambang', 'kepala_tambang', 'manager_produksi',
  ],
  settings: ['super_admin'],
  users: ['super_admin'],
};

export function canAccess(module: string, role: Role): boolean {
  return menuAccess[module]?.includes(role) ?? false;
}
