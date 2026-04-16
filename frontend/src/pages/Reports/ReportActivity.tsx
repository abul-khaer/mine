import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet } from 'lucide-react';
import api from '../../services/api';
import type { Mine, PaginatedResponse } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import ReportFilter from '../../components/reports/ReportFilter';
import { exportToExcel } from '../../utils/exportExcel';
import { useCompanyStore } from '../../store/companyStore';

interface ActivityRow {
  id: number; mine_name: string; date: string; activity: string;
  description: string; pic: string; status: string;
}

const statusColor: Record<string, string> = {
  planned:   'bg-blue-100 text-blue-700',
  ongoing:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
};

export default function ReportActivity() {
  const { t } = useTranslation();
  const company = useCompanyStore((s) => s.settings);
  const [page, setPage] = useState(1);
  const [mineId, setMineId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applied, setApplied] = useState(false);

  const { data: mines } = useQuery<Mine[]>({
    queryKey: ['mines-select'],
    queryFn: () => api.get('/mines/all').then((r) => r.data),
  });

  const { data, isLoading } = useQuery<PaginatedResponse<ActivityRow>>({
    queryKey: ['report-activity', page, mineId, startDate, endDate, applied],
    queryFn: () =>
      api.get('/reports/activities', {
        params: { page, limit: 15, mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    const all = await api.get('/reports/activities', {
      params: { mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined, limit: 9999 },
    });
    const mine = mines?.find((m) => String(m.id) === mineId) ?? null;
    await exportToExcel({
      filename: `Laporan_Kegiatan_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Laporan Kegiatan',
      reportTitle: 'Laporan Kegiatan Tambang',
      filterInfo: [mineId ? `Tambang: ${mine?.name}` : '', startDate ? `Periode: ${startDate} s/d ${endDate}` : ''].filter(Boolean).join(' | '),
      columns: [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Tambang', key: 'mine_name', width: 20 },
        { header: 'Tanggal', key: 'date', width: 14 },
        { header: 'Kegiatan', key: 'activity', width: 25 },
        { header: 'Deskripsi', key: 'description', width: 35 },
        { header: 'PIC', key: 'pic', width: 20 },
        { header: 'Status', key: 'status', width: 14 },
      ],
      data: all.data.data.map((r: ActivityRow, i: number) => ({ ...r, no: i + 1 })),
      company, mine,
    });
  };

  return (
    <div>
      <PageHeader
        title={t('reports.activity')}
        action={
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <FileSpreadsheet size={16} /> {t('reports.exportExcel')}
          </button>
        }
      />
      <ReportFilter
        mines={mines ?? []} mineId={mineId} startDate={startDate} endDate={endDate}
        onMineChange={setMineId} onStartDateChange={setStartDate} onEndDateChange={setEndDate}
        onApply={() => { setPage(1); setApplied(!applied); }}
      />
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="table-header">No</th>
                <th className="table-header">Tambang</th>
                <th className="table-header">Tanggal</th>
                <th className="table-header">Kegiatan</th>
                <th className="table-header">Deskripsi</th>
                <th className="table-header">PIC</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('common.loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                data?.data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-400">{(page - 1) * 15 + idx + 1}</td>
                    <td className="table-cell">{row.mine_name}</td>
                    <td className="table-cell">{row.date}</td>
                    <td className="table-cell font-medium">{row.activity}</td>
                    <td className="table-cell text-gray-600 max-w-xs truncate">{row.description}</td>
                    <td className="table-cell">{row.pic}</td>
                    <td className="table-cell">
                      <span className={`badge ${statusColor[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && data.total_pages > 1 && (
          <Pagination page={page} totalPages={data.total_pages} total={data.total} limit={15} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
}
