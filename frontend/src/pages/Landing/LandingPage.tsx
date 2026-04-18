import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Globe, Phone, MapPin, Mountain, LogIn, ChevronRight, Leaf, Users,
  BarChart3, Mail, Shield, TrendingUp, FileText, Pickaxe, HardHat,
  Menu, X, Building2, Target, Eye,
} from 'lucide-react';
import api from '../../services/api';
import type { CompanySettings, Mine } from '../../types';
import { useCompanyStore } from '../../store/companyStore';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setSettings = useCompanyStore((s) => s.setSettings);
  const [mobileMenu, setMobileMenu] = useState(false);

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

  const totalEmployees = mines?.reduce((s, m) => s + (m.employee_count ?? 0), 0) ?? 0;
  const totalArea = mines?.reduce((s, m) => s + Number(m.area), 0) ?? 0;
  const mineralTypes = [...new Set(mines?.map((m) => m.mineral_type) ?? [])];

  // Parse mission items
  let missionItems: string[] = [];
  if (company?.mission) {
    try {
      const parsed = JSON.parse(company.mission);
      if (Array.isArray(parsed)) missionItems = parsed;
      else missionItems = company.mission.split('\n').filter(Boolean);
    } catch {
      missionItems = company.mission.split('\n').filter(Boolean);
    }
  }

  const defaultVision = 'Menjadi perusahaan pertambangan terdepan yang menerapkan teknologi modern dan sistem manajemen terintegrasi untuk pengelolaan sumber daya alam yang efisien, transparan, dan berkelanjutan.';
  const defaultMission = [
    'Mengoptimalkan produksi tambang dengan teknologi digital terkini',
    'Meningkatkan keselamatan dan kesejahteraan karyawan',
    'Menerapkan praktik pertambangan yang ramah lingkungan',
    'Memberikan transparansi penuh dalam pelaporan operasional & keuangan',
  ];
  const displayMission = missionItems.length > 0 ? missionItems : defaultMission;

  const scrollTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream-100 font-sans">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-forest-bg/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt="logo" className="h-9 w-9 object-contain rounded-xl ring-2 ring-white/20" />
            ) : (
              <div className="h-9 w-9 bg-primary-500/30 rounded-xl flex items-center justify-center ring-2 ring-white/20">
                <Leaf size={18} className="text-primary-300" />
              </div>
            )}
            <span className="font-bold text-white text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
              {company?.company_name ?? 'Mining Management'}
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {['about', 'services', 'mines', 'contact'].map((id) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-sm text-white/60 hover:text-white font-medium transition-colors capitalize">
                {id === 'about' ? 'Tentang' : id === 'services' ? 'Layanan' : id === 'mines' ? 'Tambang' : 'Kontak'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 transition-all">
              <Globe size={13} />
              {i18n.language === 'id' ? 'EN' : 'ID'}
            </button>
            <button onClick={() => navigate('/login')} className="hidden sm:flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95">
              <LogIn size={15} />
              {t('auth.login')}
            </button>
            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10">
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-forest-bg border-t border-white/10 px-4 py-4 space-y-1">
            {[
              { id: 'about', label: 'Tentang' },
              { id: 'services', label: 'Layanan' },
              { id: 'mines', label: 'Tambang' },
              { id: 'contact', label: 'Kontak' },
            ].map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="block w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                {item.label}
              </button>
            ))}
            <button onClick={() => { setMobileMenu(false); navigate('/login'); }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-primary-300 hover:text-primary-200 hover:bg-white/10 rounded-xl transition-colors sm:hidden">
              <LogIn size={15} /> {t('auth.login')}
            </button>
          </div>
        )}
      </nav>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative pt-16 min-h-[90vh] sm:min-h-screen flex items-center bg-forest-bg overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-earth-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-primary-400/5 rounded-full blur-2xl" />
          <div className="absolute top-24 right-12 opacity-10 hidden sm:block">
            <Leaf size={120} className="text-primary-400 rotate-12" />
          </div>
          <div className="absolute bottom-24 right-1/4 opacity-5 hidden md:block">
            <Leaf size={80} className="text-primary-300 -rotate-45" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-primary-300 font-medium mb-6 sm:mb-8">
              <Mountain size={15} />
              Mining Management System
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
              {company?.company_name ?? (
                <>Sistem Manajemen<br /><span className="text-primary-400">Tambang</span> Modern</>
              )}
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-xl mb-8 sm:mb-10 leading-relaxed">
              Platform terintegrasi untuk mengelola data tambang, karyawan, produksi,
              keuangan, dan laporan operasional secara efisien.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-primary-500/25 hover:shadow-xl active:scale-95"
              >
                Masuk ke Sistem <ChevronRight size={18} />
              </button>
              {mines && mines.length > 0 && (
                <button onClick={() => scrollTo('mines')} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all border border-white/20">
                  Lihat Tambang <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="bg-white border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Mountain, color: 'primary', value: mines?.length ?? '—', label: 'Total Tambang' },
              { icon: Users, color: 'earth', value: totalEmployees.toLocaleString('id-ID'), label: 'Total Karyawan' },
              { icon: BarChart3, color: 'forest', value: `${totalArea.toLocaleString('id-ID')} Ha`, label: 'Total Area' },
              { icon: Pickaxe, color: 'primary', value: mineralTypes.length || '—', label: 'Jenis Mineral' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-cream-100 border border-cream-200">
                <div className={`h-11 w-11 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  stat.color === 'primary' ? 'bg-primary-100' : stat.color === 'earth' ? 'bg-earth-100' : 'bg-forest-dark/10'
                }`}>
                  <stat.icon size={22} className={
                    stat.color === 'primary' ? 'text-primary-600' : stat.color === 'earth' ? 'text-earth-600' : 'text-forest-dark'
                  } />
                </div>
                <div>
                  <p className="text-xl sm:text-3xl font-extrabold text-forest-deep">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-forest-mid font-medium mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ABOUT / COMPANY PROFILE ═══════════════════ */}
      <section id="about" className="py-16 sm:py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-earth-100 text-earth-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Building2 size={12} /> Profil Perusahaan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-deep">
              Tentang {company?.company_name ?? 'Kami'}
            </h2>
            <p className="text-forest-mid mt-3 max-w-2xl mx-auto text-sm sm:text-base">
              Kami adalah perusahaan yang bergerak di bidang pertambangan dengan komitmen
              terhadap pengelolaan sumber daya alam yang bertanggung jawab dan berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Company info card */}
            <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm">
              {/* Logo + name */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-cream-200">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt="logo" className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-2xl ring-2 ring-cream-200 bg-cream-50 p-1" />
                ) : (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-forest-bg rounded-2xl flex items-center justify-center">
                    <Leaf size={32} className="text-primary-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-forest-deep">
                    {company?.company_name ?? 'Mining Management'}
                  </h3>
                  <p className="text-sm text-forest-mid mt-1">Mining & Resource Management</p>
                </div>
              </div>

              {/* Company details */}
              <div className="space-y-4">
                {company?.address && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-earth-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin size={16} className="text-earth-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-forest-mid uppercase tracking-wider">Alamat</p>
                      <p className="text-sm text-forest-deep mt-0.5">{company.address}</p>
                    </div>
                  </div>
                )}
                {company?.phone && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Phone size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-forest-mid uppercase tracking-wider">Telepon</p>
                      <p className="text-sm text-forest-deep mt-0.5">{company.phone}</p>
                    </div>
                  </div>
                )}
                {company?.email && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-primary-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Mail size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-forest-mid uppercase tracking-wider">Email</p>
                      <p className="text-sm text-forest-deep mt-0.5">{company.email}</p>
                    </div>
                  </div>
                )}
                {company?.website && (
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-earth-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Globe size={16} className="text-earth-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-forest-mid uppercase tracking-wider">Website</p>
                      <p className="text-sm text-forest-deep mt-0.5">{company.website}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="space-y-6">
              <div className="bg-forest-bg rounded-3xl p-6 sm:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                    <Eye size={20} className="text-primary-400" />
                  </div>
                  <h3 className="text-lg font-bold">Visi</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {company?.vision || defaultVision}
                </p>
              </div>
              <div className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-earth-100 rounded-xl flex items-center justify-center">
                    <Target size={20} className="text-earth-600" />
                  </div>
                  <h3 className="text-lg font-bold text-forest-deep">Misi</h3>
                </div>
                <ul className="space-y-3">
                  {displayMission.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-forest-mid">
                      <div className="h-5 w-5 bg-primary-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <ChevronRight size={12} className="text-primary-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SERVICES / PORTFOLIO ═══════════════════ */}
      <section id="services" className="py-16 sm:py-24 bg-white border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Pickaxe size={12} /> Layanan & Portofolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-deep">Layanan Kami</h2>
            <p className="text-forest-mid mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Solusi lengkap untuk pengelolaan operasional pertambangan modern
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mountain,
                title: 'Manajemen Tambang',
                desc: 'Pengelolaan data lokasi, luas area, jenis mineral, dan informasi operasional setiap tambang secara terpusat.',
                color: 'primary',
              },
              {
                icon: HardHat,
                title: 'Manajemen Karyawan',
                desc: 'Pencatatan data karyawan, jabatan, departemen, dan status kepegawaian di setiap lokasi tambang.',
                color: 'earth',
              },
              {
                icon: TrendingUp,
                title: 'Laporan Produksi',
                desc: 'Monitoring target vs realisasi produksi harian, analisis capaian, dan tracking volume per tambang.',
                color: 'forest',
              },
              {
                icon: BarChart3,
                title: 'Laporan Keuangan',
                desc: 'Pencatatan pemasukan, pengeluaran, dan analisis laba rugi per kategori dan per lokasi tambang.',
                color: 'primary',
              },
              {
                icon: FileText,
                title: 'Laporan Aktivitas',
                desc: 'Tracking kegiatan operasional, progress, dan penanggung jawab setiap aktivitas di lapangan.',
                color: 'earth',
              },
              {
                icon: Shield,
                title: 'Pelaporan Masalah',
                desc: 'Sistem pelaporan insiden dan issue dengan tracking severity, status, dan resolusi penanganan.',
                color: 'forest',
              },
            ].map((svc, i) => (
              <div key={i} className="group bg-cream-50 hover:bg-forest-bg rounded-2xl border border-cream-200 hover:border-forest-bg p-6 sm:p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  svc.color === 'primary'
                    ? 'bg-primary-100 group-hover:bg-primary-500/20'
                    : svc.color === 'earth'
                    ? 'bg-earth-100 group-hover:bg-earth-500/20'
                    : 'bg-forest-dark/10 group-hover:bg-white/10'
                }`}>
                  <svc.icon size={22} className={`transition-colors ${
                    svc.color === 'primary'
                      ? 'text-primary-600 group-hover:text-primary-400'
                      : svc.color === 'earth'
                      ? 'text-earth-600 group-hover:text-earth-300'
                      : 'text-forest-dark group-hover:text-white/80'
                  }`} />
                </div>
                <h3 className="font-bold text-forest-deep group-hover:text-white text-base mb-2 transition-colors">{svc.title}</h3>
                <p className="text-sm text-forest-mid group-hover:text-white/60 leading-relaxed transition-colors">{svc.desc}</p>
              </div>
            ))}
          </div>

          {/* Mineral types showcase */}
          {mineralTypes.length > 0 && (
            <div className="mt-12 sm:mt-16 text-center">
              <p className="text-sm font-semibold text-forest-mid uppercase tracking-wider mb-4">Jenis Mineral yang Dikelola</p>
              <div className="flex flex-wrap justify-center gap-3">
                {mineralTypes.map((mineral) => (
                  <span key={mineral} className="inline-flex items-center gap-2 bg-earth-100 text-earth-700 font-semibold text-sm px-4 py-2 rounded-full border border-earth-200">
                    <Pickaxe size={14} />
                    {mineral}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ MINES ═══════════════════ */}
      {mines && mines.length > 0 && (
        <section id="mines" className="py-16 sm:py-24 bg-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Leaf size={12} /> Lokasi Operasional
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-deep">Lokasi Tambang</h2>
              <p className="text-forest-mid mt-3 max-w-md mx-auto text-sm sm:text-base">
                Kami mengelola {mines.length} tambang di berbagai wilayah Indonesia
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {mines.map((mine) => (
                <div key={mine.id} className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-11 w-11 bg-forest-bg rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-600 transition-colors">
                      <Mountain size={20} className="text-primary-300 group-hover:text-white transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-forest-deep text-sm sm:text-base truncate">{mine.name}</h3>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-earth-100 text-earth-700 rounded-full text-xs font-medium">
                        {mine.mineral_type}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-forest-mid">
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-earth-400 shrink-0" />
                      <span className="truncate">{mine.location}</span>
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

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section id="contact" className="py-16 sm:py-20 bg-forest-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Hubungi Kami</h2>
            <p className="text-white/50 text-sm">Jangan ragu untuk menghubungi kami untuk informasi lebih lanjut</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: MapPin, label: 'Alamat', value: company?.address },
              { icon: Phone, label: 'Telepon', value: company?.phone },
              { icon: Mail, label: 'Email', value: company?.email },
              { icon: Globe, label: 'Website', value: company?.website },
            ].filter((c) => c.value).map((contact, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition-colors">
                <div className="h-11 w-11 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <contact.icon size={18} className="text-primary-400" />
                </div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">{contact.label}</p>
                <p className="text-sm text-white/80 break-words">{contact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-forest-deep text-white/40 text-center py-5 text-xs border-t border-white/10">
        {company?.footer_text || `\u00A9 ${new Date().getFullYear()} ${company?.company_name ?? 'Mining Management System'}. All rights reserved.`}
      </footer>
    </div>
  );
}
