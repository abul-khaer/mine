import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Globe, Leaf, ArrowLeft, KeyRound, Mail, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useCompanyStore } from '../../store/companyStore';
import type { CompanySettings } from '../../types';

type Step = 'email' | 'otp' | 'success';

export default function ResetPasswordPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const setSettings = useCompanyStore((s) => s.setSettings);

  const { data: company } = useQuery<CompanySettings>({
    queryKey: ['company-settings'],
    queryFn: () => api.get('/settings/company').then((r) => r.data),
    retry: false,
  });

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Check if email has 2FA
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/check-2fa', { email });
      if (!data.has_2fa) {
        setError('Akun ini belum mengaktifkan Google Authenticator. Hubungi admin untuk reset password.');
      } else {
        setStep('otp');
      }
    } catch {
      setError('Email tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }
    if (otpCode.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token: otpCode,
        new_password: newPassword,
      });
      setStep('success');
      toast.success('Password berhasil direset!');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Gagal reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-earth-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
        >
          <ArrowLeft size={13} />
          <span className="hidden sm:inline">Kembali</span>
        </button>
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 transition-all"
        >
          <Globe size={13} />
          {i18n.language === 'id' ? 'EN' : 'ID'}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="logo" className="h-14 w-14 object-contain rounded-2xl mx-auto mb-4 ring-2 ring-white/20" />
          ) : (
            <div className="h-14 w-14 bg-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-2 ring-white/20">
              <Leaf size={28} className="text-primary-300" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1.5">
            Gunakan Google Authenticator untuk verifikasi
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { key: 'email', icon: Mail, label: 'Email' },
            { key: 'otp', icon: ShieldCheck, label: 'Verifikasi' },
            { key: 'success', icon: CheckCircle2, label: 'Selesai' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${['otp', 'success'].indexOf(step) >= i ? 'bg-primary-400' : 'bg-white/20'}`} />}
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                step === s.key
                  ? 'bg-primary-500/20 border-primary-500/30 text-primary-300'
                  : ['otp', 'success'].indexOf(step) > ['email', 'otp', 'success'].indexOf(s.key)
                  ? 'bg-primary-500/10 border-primary-500/20 text-primary-400/60'
                  : 'bg-white/5 border-white/10 text-white/30'
              }`}>
                <s.icon size={12} />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleCheckEmail} className="space-y-5">
              <div className="text-center mb-2">
                <div className="h-12 w-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Mail size={22} className="text-primary-400" />
                </div>
                <p className="text-sm text-white/50">Masukkan email akun Anda</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@perusahaan.com"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                {loading ? 'Memeriksa...' : 'Lanjutkan'}
              </button>
            </form>
          )}

          {/* Step 2: OTP + New Password */}
          {step === 'otp' && (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="text-center mb-2">
                <div className="h-12 w-12 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={22} className="text-primary-400" />
                </div>
                <p className="text-sm text-white/50">
                  Buka aplikasi <strong className="text-white/70">Google Authenticator</strong> dan masukkan kode 6 digit
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Kode OTP</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all text-sm text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  <Lock size={11} className="inline mr-1" />Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-400/60 focus:border-transparent transition-all text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                <KeyRound size={16} />
                {loading ? 'Memproses...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="w-full text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Kembali ke input email
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-4">
              <div className="h-16 w-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Password Berhasil Direset!</h3>
                <p className="text-sm text-white/50">Silakan login dengan password baru Anda</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Ke Halaman Login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          &copy; {new Date().getFullYear()} {company?.company_name ?? 'Mining Management System'}
        </p>
      </div>
    </div>
  );
}
