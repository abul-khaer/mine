import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Mountain, Users, Activity, AlertTriangle } from 'lucide-react';
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
        subtitle={`Selamat datang, ${user?.name}`}
      />

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ringkasan Tambang
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="table-header rounded-tl-lg">Nama Tambang</th>
                      <th className="table-header">Jenis Mineral</th>
                      <th className="table-header">Lokasi</th>
                      <th className="table-header rounded-tr-lg text-right">Karyawan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.mines_summary.map((mine) => (
                      <tr key={mine.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-medium text-gray-900">{mine.name}</td>
                        <td className="table-cell">
                          <span className="badge bg-yellow-100 text-yellow-800">
                            {mine.mineral_type}
                          </span>
                        </td>
                        <td className="table-cell text-gray-500">{mine.location}</td>
                        <td className="table-cell text-right font-semibold">
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
