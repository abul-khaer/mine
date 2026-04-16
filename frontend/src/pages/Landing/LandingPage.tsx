import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Globe, Phone, MapPin, Mountain, LogIn, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import type { CompanySettings, Mine } from '../../types';
import { useCompanyStore } from '../../store/companyStore';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setSettings = useCompanyStore((s) => s.setSettings);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
    retry: false,
  });

  const { data: mines } = useQuery<Mine[]>({
    queryKey: ['mines-public'],
    queryFn: () => api.get('/mines/public').then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (company) setSettings(company);
  }, [company, setSettings]);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id');

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="logo" className="h-9 w-9 object-contain rounded" />
            ) : (
              <div className="h-9 w-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {company?.company_name?.charAt(0) ?? 'M'}
              </div>
            )}
            <span className="font-bold text-gray-900 text-lg">
              {company?.company_name ?? 'Mining Management'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded"
            >
              <Globe size={15} />
              {i18n.language === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 btn-primary text-sm"
            >
              <LogIn size={15} />
              {t('auth.login')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <Mountain size={16} />
            <span>Mining Management System</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {company?.company_name ?? 'Sistem Manajemen Tambang'}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-10">
            Platform terintegrasi untuk mengelola data tambang, karyawan, produksi,
            keuangan, dan laporan operasional secara efisien.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors"
          >
            Masuk ke Sistem <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary-600">{mines?.length ?? '—'}</p>
              <p className="text-gray-500 mt-1">{t('mines.title')}</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">
                {mines?.reduce((s, m) => s + (m.employee_count ?? 0), 0) ?? '—'}
              </p>
              <p className="text-gray-500 mt-1">{t('dashboard.totalEmployees')}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-4xl font-bold text-primary-600">
                {mines?.reduce((s, m) => s + m.area, 0).toLocaleString('id-ID') ?? '—'} Ha
              </p>
              <p className="text-gray-500 mt-1">Total Area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mines list */}
      {mines && mines.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Lokasi Tambang</h2>
            <p className="text-gray-500 text-center mb-10">
              Kami mengelola {mines.length} tambang di berbagai wilayah
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mines.map((mine) => (
                <div key={mine.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Mountain size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mine.name}</h3>
                      <span className="badge bg-mining-gold/10 text-yellow-700 text-xs">
                        {mine.mineral_type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      {mine.location}
                    </div>
                    {mine.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        {mine.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mountain size={14} className="text-gray-400 shrink-0" />
                      {mine.area.toLocaleString('id-ID')} Hektar
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Hubungi Kami</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            {company?.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={18} className="text-primary-600" />
                {company.address}
              </div>
            )}
            {company?.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={18} className="text-primary-600" />
                {company.phone}
              </div>
            )}
            {company?.website && (
              <div className="flex items-center gap-2 text-gray-600">
                <Globe size={18} className="text-primary-600" />
                {company.website}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        © {new Date().getFullYear()} {company?.company_name ?? 'Mining Management System'}.
        All rights reserved.
      </footer>
    </div>
  );
}
