import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Mountain, Users, FileText, Settings,
  UserCog, ChevronDown, ChevronRight, Leaf, Database, ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCompanyStore } from '../../store/companyStore';
import { useRoleAccessStore } from '../../store/roleAccessStore';
import { canAccess } from '../../utils/roleAccess';
import { assetUrl } from '../../utils/assetUrl';
import { cn } from '../../utils/cn';
import type { Role } from '../../types';

export default function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const settings = useCompanyStore((s) => s.settings);
  // Subscribe to accessMap so sidebar re-renders when role access is saved
  useRoleAccessStore((s) => s.accessMap);
  const role = user?.role as Role;
  const [reportsOpen, setReportsOpen] = useState(false);

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('sidebar-item', isActive && 'sidebar-item-active')
      }
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  const reportLinks = [
    { to: '/app/reports/employee',   key: 'reports_employee',   label: t('reports.employee') },
    { to: '/app/reports/production', key: 'reports_production', label: t('reports.production') },
    { to: '/app/reports/financial',  key: 'reports_financial',  label: t('reports.financial') },
    { to: '/app/reports/activity',   key: 'reports_activity',   label: t('reports.activity') },
    { to: '/app/reports/issue',      key: 'reports_issue',      label: t('reports.issue') },
  ].filter((r) => canAccess(r.key, role));

  return (
    <aside className="w-64 flex flex-col h-full bg-forest-bg">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 w-64 h-32 bg-gradient-to-br from-primary-600/20 to-transparent pointer-events-none rounded-tr-3xl" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/10">
        {settings?.logo_url ? (
          <img
            src={`${assetUrl(settings.logo_url)}?v=${settings.updated_at}`}
            alt="logo"
            className="h-10 w-10 object-contain rounded-xl ring-2 ring-white/20"
          />
        ) : (
          <div className="h-10 w-10 bg-primary-500/30 rounded-xl flex items-center justify-center ring-2 ring-white/20">
            <Leaf size={20} className="text-primary-300" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate leading-tight">
            {settings?.company_name ?? 'Mining System'}
          </p>
          <p className="text-xs text-primary-300 mt-0.5">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {/* Label section */}
        <p className="px-3 pb-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Menu</p>

        {canAccess('dashboard', role) &&
          navItem('/app/dashboard', <LayoutDashboard size={17} />, t('nav.dashboard'))}

        {canAccess('mines', role) &&
          navItem('/app/mines', <Mountain size={17} />, t('nav.mines'))}

        {canAccess('employees', role) &&
          navItem('/app/employees', <Users size={17} />, t('nav.employees'))}

        {canAccess('master_data', role) &&
          navItem('/app/master-data', <Database size={17} />, 'Master Data')}

        {/* Reports dropdown */}
        {reportLinks.length > 0 && (
          <div>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className="sidebar-item w-full justify-between"
            >
              <span className="flex items-center gap-3">
                <FileText size={17} />
                {t('nav.reports')}
              </span>
              {reportsOpen
                ? <ChevronDown size={15} className="text-white/50" />
                : <ChevronRight size={15} className="text-white/50" />}
            </button>
            {reportsOpen && (
              <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                {reportLinks.map((r) => (
                  <NavLink
                    key={r.to}
                    to={r.to}
                    className={({ isActive }) =>
                      cn(
                        'block px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        isActive
                          ? 'text-primary-300 bg-white/10'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
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

        {/* Divider */}
        {(canAccess('users', role) || canAccess('settings', role)) && (
          <div className="pt-3 pb-1">
            <p className="px-3 pb-2 text-xs font-semibold text-white/30 uppercase tracking-widest">Admin</p>
          </div>
        )}

        {canAccess('users', role) &&
          navItem('/app/users', <UserCog size={17} />, t('nav.users'))}

        {canAccess('settings', role) &&
          navItem('/app/settings', <Settings size={17} />, t('nav.settings'))}

        {canAccess('role_access', role) &&
          navItem('/app/role-access', <ShieldCheck size={17} />, 'Hak Akses')}
      </nav>

      {/* User info bottom */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-primary-500/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-300">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{t(`roles.${user?.role}` as any)}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
