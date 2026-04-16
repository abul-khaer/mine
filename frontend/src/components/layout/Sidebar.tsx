import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Mountain, Users, FileText, Settings,
  UserCog, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCompanyStore } from '../../store/companyStore';
import { canAccess } from '../../utils/roleAccess';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const settings = useCompanyStore((s) => s.settings);
  const role = user?.role as Role;
  const [reportsOpen, setReportsOpen] = useState(false);

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );

  const reportLinks = [
    { to: '/app/reports/employee', key: 'reports_employee', label: t('reports.employee') },
    { to: '/app/reports/production', key: 'reports_production', label: t('reports.production') },
    { to: '/app/reports/financial', key: 'reports_financial', label: t('reports.financial') },
    { to: '/app/reports/activity', key: 'reports_activity', label: t('reports.activity') },
    { to: '/app/reports/issue', key: 'reports_issue', label: t('reports.issue') },
  ].filter((r) => canAccess(r.key, role));

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200">
        {settings?.logo_url ? (
          <img src={settings.logo_url} alt="logo" className="h-9 w-9 object-contain rounded" />
        ) : (
          <div className="h-9 w-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {settings?.company_name?.charAt(0) ?? 'M'}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">
            {settings?.company_name ?? 'Mining System'}
          </p>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {canAccess('dashboard', role) &&
          navItem('/app/dashboard', <LayoutDashboard size={18} />, t('nav.dashboard'))}

        {canAccess('mines', role) &&
          navItem('/app/mines', <Mountain size={18} />, t('nav.mines'))}

        {canAccess('employees', role) &&
          navItem('/app/employees', <Users size={18} />, t('nav.employees'))}

        {/* Reports dropdown */}
        {reportLinks.length > 0 && (
          <div>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText size={18} />
                {t('nav.reports')}
              </span>
              {reportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {reportsOpen && (
              <div className="ml-6 mt-1 space-y-1">
                {reportLinks.map((r) => (
                  <NavLink
                    key={r.to}
                    to={r.to}
                    className={({ isActive }) =>
                      cn(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      )
                    }
                  >
                    {r.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        {canAccess('users', role) &&
          navItem('/app/users', <UserCog size={18} />, t('nav.users'))}

        {canAccess('settings', role) &&
          navItem('/app/settings', <Settings size={18} />, t('nav.settings'))}
      </nav>
    </aside>
  );
}
