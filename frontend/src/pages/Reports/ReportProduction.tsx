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

interface ProductionRow {
  id: number; mine_name: string; date: string; target_volume: number;
  actual_volume: number; unit: string; achievement: string; notes: string;
}

export default function ReportProduction() {
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

  const { data, isLoading } = useQuery<PaginatedResponse<ProductionRow>>({
    queryKey: ['report-production', page, mineId, startDate, endDate, applied],
    queryFn: () =>
      api.get('/reports/production', {
        params: { page, limit: 15, mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    const all = await api.get('/reports/production', {
      params: { mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined, limit: 9999 },
    });
    const mine = mines?.find((m) => String(m.id) === mineId) ?? null;
    await exportToExcel({
      filename: `Laporan_Produksi_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Laporan Produksi',
      reportTitle: 'Laporan Produksi Tambang',
      filterInfo: [mineId ? `Tambang: ${mine?.name}` : '', startDate ? `Periode: ${startDate} s/d ${endDate}` : ''].filter(Boolean).join(' | '),
      columns: [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Tambang', key: 'mine_name', width: 20 },
        { header: 'Tanggal', key: 'date', width: 14 },
        { header: 'Target', key: 'target_volume', width: 14 },
        { header: 'Realisasi', key: 'actual_volume', width: 14 },
        { header: 'Satuan', key: 'unit', width: 10 },
        { header: 'Capaian (%)', key: 'achievement', width: 14 },
        { header: 'Catatan', key: 'notes', width: 30 },
      ],
      data: all.data.data.map((r: ProductionRow, i: number) => ({ ...r, no: i + 1 })),
      company, mine,
    });
  };

  return (
    <div>
      <PageHeader
        title={t('reports.production')}
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
              <tr>
                <th className="table-header">No</th>
                <th className="table-header">Tambang</th>
                <th className="table-header">Tanggal</th>
                <th className="table-header text-right">Target</th>
                <th className="table-header text-right">Realisasi</th>
                <th className="table-header">Satuan</th>
                <th className="table-header text-right">Capaian</th>
                <th className="table-header">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-forest-mid/40">{t('common.loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-forest-mid/40">{t('common.noData')}</td></tr>
              ) : (
                data?.data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-cream-100/60 transition-colors">
                    <td className="table-cell text-forest-mid/50 text-xs">{(page - 1) * 15 + idx + 1}</td>
                    <td className="table-cell">
                      <span className="badge bg-earth-100 text-earth-700">{row.mine_name}</span>
                    </td>
                    <td className="table-cell text-forest-mid">{row.date}</td>
                    <td className="table-cell text-right text-forest-mid">{row.target_volume.toLocaleString('id-ID')}</td>
                    <td className="table-cell text-right font-semibold text-forest-deep">{row.actual_volume.toLocaleString('id-ID')}</td>
                    <td className="table-cell text-forest-mid">{row.unit}</td>
                    <td className="table-cell text-right">
                      <span className={`badge ${parseFloat(row.achievement) >= 100 ? 'bg-primary-100 text-primary-700' : 'bg-earth-100 text-earth-700'}`}>
                        {row.achievement}%
                      </span>
                    </td>
                    <td className="table-cell text-forest-mid/60 max-w-xs truncate">{row.notes || '—'}</td>
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
