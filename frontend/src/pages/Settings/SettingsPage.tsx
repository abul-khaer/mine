import { useTranslation } from 'react-i18next';
import { Globe, Palette, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <PageHeader title={t('settings.title')} />

      <div className="max-w-2xl space-y-6">
        {/* Language */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
              <Globe size={16} className="text-primary-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">Bahasa / Language</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => i18n.changeLanguage('id')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                i18n.language === 'id'
                  ? 'bg-forest-bg text-white border-forest-bg'
                  : 'bg-white text-forest-mid border-cream-300 hover:bg-cream-100'
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                i18n.language === 'en'
                  ? 'bg-forest-bg text-white border-forest-bg'
                  : 'bg-white text-forest-mid border-cream-300 hover:bg-cream-100'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-earth-100 rounded-xl flex items-center justify-center">
              <Info size={16} className="text-earth-600" />
            </div>
            <h2 className="text-base font-bold text-forest-deep">Informasi</h2>
          </div>
          <div className="space-y-2 text-sm text-forest-mid">
            <p>Untuk mengelola <strong>data perusahaan</strong>, <strong>logo</strong>, <strong>visi & misi</strong>, dan <strong>Google Authenticator</strong>, gunakan menu <strong className="text-primary-600">Master Data</strong> di sidebar.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
