import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Mountain, Users, Activity, AlertTriangle, MapPin } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { useAuthStore } from '../../store/authStore';

interface DashboardStats {
  total_mines: number;
  total_employees: number;
  active_mines: number;
  open_issues: number;
  mines_summary: Array<{
    id: number;
    name: string;
    mineral_type: string;
    employee_count: number;
    location: string;
  }>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
  });

  return (
    <div>
      <PageHeader
        title={t('dashboard.title')}
        subtitle={`Selamat datang kembali, ${user?.name}`}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="h-10 w-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-forest-mid text-sm">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              title={t('dashboard.totalMines')}
              value={stats?.total_mines ?? 0}
              icon={<Mountain size={22} />}
              color="blue"
            />
            <StatCard
              title={t('dashboard.totalEmployees')}
              value={stats?.total_employees ?? 0}
              icon={<Users size={22} />}
              color="green"
            />
            <StatCard
              title={t('dashboard.activeMines')}
              value={stats?.active_mines ?? 0}
              icon={<Activity size={22} />}
              color="yellow"
            />
            <StatCard
              title="Masalah Terbuka"
              value={stats?.open_issues ?? 0}
              icon={<AlertTriangle size={22} />}
              color="red"
            />
          </div>

          {/* Mines Summary Table */}
          {stats?.mines_summary && stats.mines_summary.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-8 w-8 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Mountain size={16} className="text-primary-600" />
                </div>
                <h2 className="text-base font-bold text-forest-deep">Ringkasan Tambang</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header rounded-tl-xl">Nama Tambang</th>
                      <th className="table-header">Jenis Mineral</th>
                      <th className="table-header">Lokasi</th>
                      <th className="table-header rounded-tr-xl text-right">Karyawan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {stats.mines_summary.map((mine) => (
                      <tr key={mine.id} className="hover:bg-cream-100/60 transition-colors">
                        <td className="table-cell font-semibold text-forest-deep">{mine.name}</td>
                        <td className="table-cell">
                          <span className="badge bg-earth-100 text-earth-700">
                            {mine.mineral_type}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="flex items-center gap-1.5 text-forest-mid">
                            <MapPin size={12} className="text-earth-400 shrink-0" />
                            {mine.location}
                          </span>
                        </td>
                        <td className="table-cell text-right font-bold text-forest-deep">
                          {mine.employee_count.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
