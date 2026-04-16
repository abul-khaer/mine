import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Globe, Phone, MapPin, Mountain, LogIn, ChevronRight, Leaf, Users, BarChart3 } from 'lucide-react';
import api from '../../services/api';
import type { CompanySettings, Mine } from '../../types';
import { useCompanyStore } from '../../store/companyStore';
import { assetUrl } from '../../utils/assetUrl';

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
    <div className="min-h-screen bg-cream-100 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-forest-bg/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={assetUrl(company.logo_url)} alt="logo" className="h-9 w-9 object-contain rounded-xl ring-2 ring-white/20" />
            ) : (
              <div className="h-9 w-9 bg-primary-500/30 rounded-xl flex items-center justify-center ring-2 ring-white/20">
                <Leaf size={18} className="text-primary-300" />
              </div>
            )}
            <span className="font-bold text-white text-base">
              {company?.company_name ?? 'Mining Management'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 transition-all">
              <Globe size={13} />
              {i18n.language === 'id' ? 'EN' : 'ID'}
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
              <LogIn size={15} />
              {t('auth.login')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-screen flex items-center bg-forest-bg overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-earth-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-400/5 rounded-full blur-2xl" />
          {/* Leaf decorations */}
          <div className="absolute top-24 right-12 opacity-10">
            <Leaf size={120} className="text-primary-400 rotate-12" />
          </div>
          <div className="absolute bottom-24 right-1/4 opacity-5">
            <Leaf size={80} className="text-primary-300 -rotate-45" />
          </div>
          <div className="absolute top-1/3 left-8 opacity-5">
            <Leaf size={60} className="text-earth-400 rotate-90" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-1.5 text-sm text-primary-300 font-medium mb-8">
              <Mountain size={15} />
              Mining Management System
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              {company?.company_name ?? (
                <>Sistem Manajemen<br /><span className="text-primary-400">Tambang</span> Modern</>
              )}
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
              Platform terintegrasi untuk mengelola data tambang, karyawan, produksi,
              keuangan, dan laporan operasional secara efisien.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-primary-500/25 hover:shadow-xl active:scale-95"
              >
                Masuk ke Sistem <ChevronRight size={18} />
              </button>
              {mines && mines.length > 0 && (
                <a href="#mines" className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all border border-white/20">
                  Lihat Tambang <ChevronRight size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-cream-100 border border-cream-200">
              <div className="h-14 w-14 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
                <Mountain size={26} className="text-primary-600" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-forest-deep">{mines?.length ?? '—'}</p>
                <p className="text-sm text-forest-mid font-medium mt-0.5">Total Tambang</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-cream-100 border border-cream-200">
              <div className="h-14 w-14 bg-earth-100 rounded-2xl flex items-center justify-center shrink-0">
                <Users size={26} className="text-earth-600" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-forest-deep">
                  {mines?.reduce((s, m) => s + (m.employee_count ?? 0), 0).toLocaleString('id-ID') ?? '—'}
                </p>
                <p className="text-sm text-forest-mid font-medium mt-0.5">Total Karyawan</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-cream-100 border border-cream-200">
              <div className="h-14 w-14 bg-forest-dark/10 rounded-2xl flex items-center justify-center shrink-0">
                <BarChart3 size={26} className="text-forest-dark" />
              </div>
              <div>
                <p className="text-3xl font-extrabold text-forest-deep">
                  {mines?.reduce((s, m) => s + Number(m.area), 0).toLocaleString('id-ID') ?? '—'} Ha
                </p>
                <p className="text-sm text-forest-mid font-medium mt-0.5">Total Area</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mines */}
      {mines && mines.length > 0 && (
        <section id="mines" className="py-20 bg-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Leaf size={12} /> Lokasi Operasional
              </span>
              <h2 className="text-4xl font-extrabold text-forest-deep">Lokasi Tambang</h2>
              <p className="text-forest-mid mt-3 max-w-md mx-auto">
                Kami mengelola {mines.length} tambang di berbagai wilayah Indonesia
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mines.map((mine) => (
                <div key={mine.id} className="bg-white rounded-2xl border border-cream-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 bg-forest-bg rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                      <Mountain size={20} className="text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-forest-deep text-base">{mine.name}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-earth-100 text-earth-700 rounded-full text-xs font-medium">
                        {mine.mineral_type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-forest-mid">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-earth-400 shrink-0" />
                      {mine.location}
                    </div>
                    {mine.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-earth-400 shrink-0" />
                        {mine.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Mountain size={13} className="text-earth-400 shrink-0" />
                      {Number(mine.area).toLocaleString('id-ID')} Hektar
                    </div>
                  </div>
                  {mine.employee_count !== undefined && (
                    <div className="mt-4 pt-4 border-t border-cream-200 flex items-center justify-between">
                      <span className="text-xs text-forest-mid">Karyawan</span>
                      <span className="text-sm font-bold text-forest-deep">{mine.employee_count} orang</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-16 bg-forest-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-8">Hubungi Kami</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {company?.address && (
              <div className="flex items-center gap-2.5 text-white/60">
                <div className="h-9 w-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <MapPin size={16} className="text-primary-400" />
                </div>
                {company.address}
              </div>
            )}
            {company?.phone && (
              <div className="flex items-center gap-2.5 text-white/60">
                <div className="h-9 w-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Phone size={16} className="text-primary-400" />
                </div>
                {company.phone}
              </div>
            )}
            {company?.website && (
              <div className="flex items-center gap-2.5 text-white/60">
                <div className="h-9 w-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Globe size={16} className="text-primary-400" />
                </div>
                {company.website}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-deep text-white/40 text-center py-5 text-xs border-t border-white/10">
        © {new Date().getFullYear()} {company?.company_name ?? 'Mining Management System'}. All rights reserved.
      </footer>
    </div>
  );
}
