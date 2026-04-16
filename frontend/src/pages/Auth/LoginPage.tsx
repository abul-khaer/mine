import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Globe, Eye, EyeOff, Mountain } from 'lucide-react';
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

  // Redirect if already logged in
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      {/* Language toggle */}
      <button
        onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
        className="fixed top-4 right-4 flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Globe size={15} />
        {i18n.language === 'id' ? 'EN' : 'ID'}
      </button>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt="logo"
                className="h-16 w-16 object-contain rounded-xl mx-auto mb-3"
              />
            ) : (
              <div className="h-16 w-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Mountain size={32} className="text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {company?.company_name ?? 'Mining Management'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('auth.loginSubtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="email@perusahaan.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full py-2.5 text-base mt-2"
            >
              {loginMutation.isPending ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} {company?.company_name ?? 'Mining Management System'}
        </p>
      </div>
    </div>
  );
}
