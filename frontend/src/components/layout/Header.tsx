import { useTranslation } from 'react-i18next';
import { LogOut, Globe, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    // ═══ ISO 27001: Log logout event ═══
    api.post('/auth/logout').catch(() => {});
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-cream-200 flex items-center justify-between px-3 sm:px-6 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-1 rounded-xl hover:bg-cream-100 text-forest-mid lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
          <span className="text-sm text-forest-mid font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-forest-mid
                     hover:text-forest-deep hover:bg-cream-100 rounded-xl transition-colors border border-cream-200"
        >
          <Globe size={14} />
          <span className="hidden xs:inline">{i18n.language === 'id' ? 'ID' : 'EN'}</span>
        </button>

        {/* Notification bell */}
        <button className="relative p-2 hover:bg-cream-100 rounded-xl transition-colors text-forest-mid">
          <Bell size={18} />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-cream-300 mx-0.5 sm:mx-1 hidden sm:block" />

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 sm:h-9 sm:w-9 bg-forest-gradient rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-xs sm:text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-forest-deep leading-tight">{user?.name}</p>
            <p className="text-xs text-forest-mid">{t(`roles.${user?.role}` as any)}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={t('nav.logout')}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
