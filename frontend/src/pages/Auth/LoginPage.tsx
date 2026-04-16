import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Globe, Eye, EyeOff, Leaf, LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useCompanyStore } from '../../store/companyStore';
import type { CompanySettings } from '../../types';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, token } = useAuthStore();
  const setSettings = useCompanyStore((s) => s.setSettings);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) navigate('/app/dashboard', { replace: true });
  }, [token, navigate]);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
    retry: false,
  });

  useEffect(() => {
    if (company) setSettings(company);
  }, [company, setSettings]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      navigate('/app/dashboard', { replace: true });
    },
    onError: () => {
      toast.error(t('auth.loginFailed'));
    },
  });

  return (
    <div className="min-h-screen bg-forest-bg flex overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-earth-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        {/* Leaf decorations */}
        <div className="absolute top-16 right-16 opacity-10">
          <Leaf size={140} className="text-primary-400 rotate-12" />
        </div>
        <div className="absolute bottom-20 left-12 opacity-8">
          <Leaf size={90} className="text-primary-300 -rotate-30" />
        </div>
        <div className="absolute top-1/2 right-8 opacity-5">
          <Leaf size={60} className="text-earth-400 rotate-90" />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-1.5 text-xs text-primary-300 font-semibold mb-8 uppercase tracking-wider">
            <Leaf size={12} /> Mining Management System
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Kelola Tambang<br />
            <span className="text-primary-400">Lebih Efisien</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Platform terintegrasi untuk mengelola data tambang, karyawan, produksi, dan laporan operasional.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['Data Tambang', 'Laporan Excel', 'Multi Peran', 'Real-time'].map((f) => (
              <span key={f} className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Language toggle */}
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
          className="absolute top-6 right-6 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
        >
          <Globe size={13} />
          {i18n.language === 'id' ? 'EN' : 'ID'}
        </button>

        <div className="w-full max-w-sm">
          {/* Logo & title */}
          <div className="text-center mb-10">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt="logo"
                className="h-16 w-16 object-contain rounded-2xl mx-auto mb-4 ring-2 ring-white/20"
              />
            ) : (
              <div className="h-16 w-16 bg-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-2 ring-white/20">
                <Leaf size={30} className="text-primary-300" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {company?.company_name ?? 'Mining Management'}
            </h1>
            <p className="text-sm text-white/40 mt-1.5">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  {t('auth.email')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="email@perusahaan.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30
                             focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent
                             transition-all text-sm"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30
                               focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent
                               transition-all text-sm pr-11"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400
                           disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl
                           transition-all shadow-lg hover:shadow-primary-500/30 hover:shadow-xl active:scale-95 mt-2"
              >
                <LogIn size={16} />
                {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
              </button>
            </form>
          </div>

          <p className="text-center text-white/30 text-xs mt-8">
            © {new Date().getFullYear()} {company?.company_name ?? 'Mining Management System'}
          </p>
        </div>
      </div>
    </div>
  );
}
