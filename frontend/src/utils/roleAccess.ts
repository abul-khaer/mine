import type { Role } from '../types';
import { useAuthStore } from '../store/authStore';

// All available menus for checkbox assignment
export const ALL_MENUS = [
  { key: 'dashboard',          label: 'Dashboard',           group: 'Menu' },
  { key: 'mines',              label: 'Data Tambang',        group: 'Menu' },
  { key: 'employees',          label: 'Karyawan',            group: 'Menu' },
  { key: 'reports_employee',   label: 'Laporan Karyawan',    group: 'Laporan' },
  { key: 'reports_production', label: 'Laporan Produksi',    group: 'Laporan' },
  { key: 'reports_financial',  label: 'Laporan Keuangan',    group: 'Laporan' },
  { key: 'reports_activity',   label: 'Laporan Aktivitas',   group: 'Laporan' },
  { key: 'reports_issue',      label: 'Laporan Masalah',     group: 'Laporan' },
  { key: 'master_data',        label: 'Master Data',         group: 'Admin' },
  { key: 'users',              label: 'User Management',     group: 'Admin' },
  { key: 'audit_logs',         label: 'Audit Log',           group: 'Admin' },
  { key: 'settings',           label: 'Settings',            group: 'Admin' },
] as const;

export type MenuKey = (typeof ALL_MENUS)[number]['key'];

// Parse the user's menu_access JSON string into an array
function getUserMenuAccess(): string[] {
  const user = useAuthStore.getState().user;
  if (!user) return [];
  if (!user.menu_access) return [];
  try {
    const parsed = JSON.parse(user.menu_access);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function canAccess(module: string, role: Role): boolean {
  // super_admin always has full access
  if (role === 'super_admin') return true;

  // Check user's dynamic menu_access
  const menus = getUserMenuAccess();
  return menus.includes(module);
}
