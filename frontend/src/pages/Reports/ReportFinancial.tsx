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

interface FinancialRow {
  id: number; mine_name: string; date: string; category: string;
  income: number; expense: number; profit: number; notes: string;
}

const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function ReportFinancial() {
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

  const { data, isLoading } = useQuery<PaginatedResponse<FinancialRow>>({
    queryKey: ['report-financial', page, mineId, startDate, endDate, applied],
    queryFn: () =>
      api.get('/reports/financial', {
        params: { page, limit: 15, mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    const all = await api.get('/reports/financial', {
      params: { mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined, limit: 9999 },
    });
    const mine = mines?.find((m) => String(m.id) === mineId) ?? null;
    await exportToExcel({
      filename: `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Laporan Keuangan',
      reportTitle: 'Laporan Keuangan Tambang',
      filterInfo: [mineId ? `Tambang: ${mine?.name}` : '', startDate ? `Periode: ${startDate} s/d ${endDate}` : ''].filter(Boolean).join(' | '),
      columns: [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Tambang', key: 'mine_name', width: 20 },
        { header: 'Tanggal', key: 'date', width: 14 },
        { header: 'Kategori', key: 'category', width: 18 },
        { header: 'Pemasukan (Rp)', key: 'income_fmt', width: 22 },
        { header: 'Pengeluaran (Rp)', key: 'expense_fmt', width: 22 },
        { header: 'Laba/Rugi (Rp)', key: 'profit_fmt', width: 22 },
        { header: 'Catatan', key: 'notes', width: 30 },
      ],
      data: all.data.data.map((r: FinancialRow, i: number) => ({
        ...r, no: i + 1,
        income_fmt: fmt(r.income), expense_fmt: fmt(r.expense), profit_fmt: fmt(r.profit),
      })),
      company, mine,
    });
  };

  return (
    <div>
      <PageHeader
        title={t('reports.financial')}
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
                <th className="table-header">Kategori</th>
                <th className="table-header text-right">Pemasukan</th>
                <th className="table-header text-right">Pengeluaran</th>
                <th className="table-header text-right">Laba/Rugi</th>
                <th className="table-header">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">{t('common.noData')}</td></tr>
              ) : (
                data?.data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="table-cell text-gray-400">{(page - 1) * 15 + idx + 1}</td>
                    <td className="table-cell">{row.mine_name}</td>
                    <td className="table-cell">{row.date}</td>
                    <td className="table-cell">
                      <span className="badge bg-blue-100 text-blue-700">{row.category}</span>
                    </td>
                    <td className="table-cell text-right text-green-700 font-medium">{fmt(row.income)}</td>
                    <td className="table-cell text-right text-red-600 font-medium">{fmt(row.expense)}</td>
                    <td className="table-cell text-right font-bold">
                      <span className={row.profit >= 0 ? 'text-green-700' : 'text-red-600'}>
                        {fmt(row.profit)}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 max-w-xs truncate">{row.notes || '—'}</td>
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
