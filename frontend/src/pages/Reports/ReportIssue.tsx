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

interface IssueRow {
  id: number; mine_name: string; date: string; issue_title: string;
  description: string; severity: string; status: string; resolution: string;
}

const severityColor: Record<string, string> = {
  low:      'bg-green-100 text-green-700',
  medium:   'bg-yellow-100 text-yellow-700',
  high:     'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};
const statusColor: Record<string, string> = {
  open:        'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved:    'bg-green-100 text-green-700',
};

export default function ReportIssue() {
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

  const { data, isLoading } = useQuery<PaginatedResponse<IssueRow>>({
    queryKey: ['report-issue', page, mineId, startDate, endDate, applied],
    queryFn: () =>
      api.get('/reports/issues', {
        params: { page, limit: 15, mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    const all = await api.get('/reports/issues', {
      params: { mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined, limit: 9999 },
    });
    const mine = mines?.find((m) => String(m.id) === mineId) ?? null;
    await exportToExcel({
      filename: `Laporan_Masalah_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Laporan Masalah',
      reportTitle: 'Laporan Masalah Tambang',
      filterInfo: [mineId ? `Tambang: ${mine?.name}` : '', startDate ? `Periode: ${startDate} s/d ${endDate}` : ''].filter(Boolean).join(' | '),
      columns: [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Tambang', key: 'mine_name', width: 20 },
        { header: 'Tanggal', key: 'date', width: 14 },
        { header: 'Judul Masalah', key: 'issue_title', width: 25 },
        { header: 'Deskripsi', key: 'description', width: 35 },
        { header: 'Tingkat', key: 'severity', width: 12 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Resolusi', key: 'resolution', width: 35 },
      ],
      data: all.data.data.map((r: IssueRow, i: number) => ({ ...r, no: i + 1 })),
      company, mine,
    });
  };

  return (
    <div>
      <PageHeader
        title={t('reports.issue')}
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
                <th className="table-header">Judul Masalah</th>
                <th className="table-header">Tingkat</th>
                <th className="table-header">Status</th>
                <th className="table-header">Resolusi</th>
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
                    <td className="table-cell font-medium">{row.issue_title}</td>
                    <td className="table-cell">
                      <span className={`badge ${severityColor[row.severity] ?? 'bg-gray-100'}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${statusColor[row.status] ?? 'bg-gray-100'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{row.resolution || '—'}</td>
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
