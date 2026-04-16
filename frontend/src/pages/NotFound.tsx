import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <p className="text-8xl font-bold text-primary-200">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mt-4">Halaman tidak ditemukan</h1>
      <p className="text-gray-500 mt-2">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-6">
        Kembali ke Beranda
      </button>
    </div>
  );
}
