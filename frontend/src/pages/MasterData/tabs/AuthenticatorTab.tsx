import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, QrCode, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

const labelClass = 'block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5';

export default function AuthenticatorTab() {
  const user = useAuthStore((s) => s.user);

  const [show2faSetup, setShow2faSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [disableOtp, setDisableOtp] = useState('');
  const [copied, setCopied] = useState(false);

  const generate2faMutation = useMutation({
    mutationFn: () => api.post('/auth/2fa/generate').then((r) => r.data),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShow2faSetup(true);
    },
    onError: () => toast.error('Gagal generate QR code'),
  });

  const enable2faMutation = useMutation({
    mutationFn: (token: string) => api.post('/auth/2fa/enable', { token }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Google Authenticator berhasil diaktifkan!');
      setShow2faSetup(false);
      setOtpCode('');
      setQrCode('');
      setSecret('');
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setAuth({ ...authStore.user, totp_enabled: true } as any, authStore.token!);
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Kode OTP tidak valid'),
  });

  const disable2faMutation = useMutation({
    mutationFn: (token: string) => api.post('/auth/2fa/disable', { token }).then((r) => r.data),
    onSuccess: () => {
      toast.success('Google Authenticator berhasil dinonaktifkan');
      setDisableOtp('');
      const authStore = useAuthStore.getState();
      if (authStore.user) {
        authStore.setAuth({ ...authStore.user, totp_enabled: false } as any, authStore.token!);
      }
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? 'Kode OTP tidak valid'),
  });

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const is2faEnabled = (user as any)?.totp_enabled;

  return (
    <div className="max-w-2xl">
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
            <ShieldCheck size={16} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-forest-deep">Google Authenticator</h2>
            <p className="text-xs text-forest-mid">Untuk reset password mandiri tanpa admin</p>
          </div>
        </div>

        {is2faEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl p-4">
              <ShieldCheck size={20} className="text-primary-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-primary-800">Google Authenticator Aktif</p>
                <p className="text-xs text-primary-600 mt-0.5">Anda bisa reset password menggunakan kode OTP dari Google Authenticator</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Masukkan kode OTP untuk menonaktifkan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={disableOtp}
                  onChange={(e) => setDisableOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="input-field text-center tracking-[0.3em] font-mono max-w-[200px]"
                />
                <button
                  type="button"
                  onClick={() => disable2faMutation.mutate(disableOtp)}
                  disabled={disableOtp.length !== 6 || disable2faMutation.isPending}
                  className="btn-danger flex items-center gap-2 text-sm"
                >
                  <ShieldOff size={14} />
                  {disable2faMutation.isPending ? 'Memproses...' : 'Nonaktifkan'}
                </button>
              </div>
            </div>
          </div>
        ) : show2faSetup ? (
          <div className="space-y-5">
            <div className="bg-cream-100 border border-cream-200 rounded-xl p-4">
              <p className="text-sm text-forest-mid mb-3">
                <strong className="text-forest-deep">1.</strong> Scan QR code di bawah dengan aplikasi <strong>Google Authenticator</strong>
              </p>
              <div className="flex justify-center mb-3">
                {qrCode && <img src={qrCode} alt="QR Code" className="h-48 w-48 rounded-xl border border-cream-300 bg-white p-2" />}
              </div>
              <p className="text-sm text-forest-mid mb-2">
                <strong className="text-forest-deep">2.</strong> Atau masukkan kode manual:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-cream-300 rounded-lg px-3 py-2 text-xs font-mono text-forest-deep break-all select-all">
                  {secret}
                </code>
                <button type="button" onClick={copySecret} className="btn-secondary p-2 shrink-0">
                  {copied ? <Check size={14} className="text-primary-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <strong>3.</strong> Masukkan kode 6 digit dari Google Authenticator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="input-field text-center tracking-[0.3em] font-mono max-w-[200px]"
                />
                <button
                  type="button"
                  onClick={() => enable2faMutation.mutate(otpCode)}
                  disabled={otpCode.length !== 6 || enable2faMutation.isPending}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <ShieldCheck size={14} />
                  {enable2faMutation.isPending ? 'Memverifikasi...' : 'Aktifkan'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setShow2faSetup(false); setQrCode(''); setSecret(''); setOtpCode(''); }}
              className="text-sm text-forest-mid hover:text-forest-deep transition-colors"
            >
              Batalkan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-cream-100 border border-cream-200 rounded-xl p-4">
              <ShieldOff size={20} className="text-forest-mid/50 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-forest-deep">Google Authenticator Belum Aktif</p>
                <p className="text-xs text-forest-mid mt-0.5">Aktifkan untuk bisa reset password secara mandiri</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => generate2faMutation.mutate()}
              disabled={generate2faMutation.isPending}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <QrCode size={15} />
              {generate2faMutation.isPending ? 'Generating...' : 'Setup Google Authenticator'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
