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

interface EmployeeRow {
  id: number; mine_name: string; nik: string; name: string;
  position: string; department: string; hire_date: string; status: string;
}

export default function ReportEmployee() {
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

  const { data, isLoading } = useQuery<PaginatedResponse<EmployeeRow>>({
    queryKey: ['report-employee', page, mineId, startDate, endDate, applied],
    queryFn: () =>
      api.get('/reports/employees', {
        params: { page, limit: 15, mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined },
      }).then((r) => r.data),
    enabled: true,
    placeholderData: (prev) => prev,
  });

  const handleExport = async () => {
    const all = await api.get('/reports/employees', {
      params: { mine_id: mineId || undefined, start_date: startDate || undefined, end_date: endDate || undefined, limit: 9999 },
    });
    const mine = mines?.find((m) => String(m.id) === mineId) ?? null;
    await exportToExcel({
      filename: `Laporan_Karyawan_${new Date().toISOString().slice(0, 10)}`,
      sheetName: 'Laporan Karyawan',
      reportTitle: 'Laporan Data Karyawan',
      filterInfo: [mineId ? `Tambang: ${mine?.name}` : '', startDate ? `Periode: ${startDate} s/d ${endDate}` : ''].filter(Boolean).join(' | '),
      columns: [
        { header: 'No', key: 'no', width: 6 },
        { header: 'Tambang', key: 'mine_name', width: 20 },
        { header: 'NIK', key: 'nik', width: 14 },
        { header: 'Nama', key: 'name', width: 25 },
        { header: 'Jabatan', key: 'position', width: 20 },
        { header: 'Departemen', key: 'department', width: 18 },
        { header: 'Tgl Bergabung', key: 'hire_date', width: 16 },
        { header: 'Status', key: 'status', width: 12 },
      ],
      data: all.data.data.map((r: EmployeeRow, i: number) => ({ ...r, no: i + 1 })),
      company,
      mine,
    });
  };

  return (
    <div>
      <PageHeader
        title={t('reports.employee')}
        action={
          <button onClick={handleExport} className="btn-primary flex items-center gap-2">
            <FileSpreadsheet size={16} /> {t('reports.exportExcel')}
          </button>
        }
      />
      <ReportFilter
        mines={mines ?? []}
        mineId={mineId} startDate={startDate} endDate={endDate}
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
                <th className="table-header">NIK</th>
                <th className="table-header">Nama</th>
                <th className="table-header">Jabatan</th>
                <th className="table-header">Departemen</th>
                <th className="table-header">Tgl Bergabung</th>
                <th className="table-header">Status</th>
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
                    <td className="table-cell font-mono text-xs">{row.nik}</td>
                    <td className="table-cell font-medium">{row.name}</td>
                    <td className="table-cell">{row.position}</td>
                    <td className="table-cell">{row.department}</td>
                    <td className="table-cell">{row.hire_date}</td>
                    <td className="table-cell">
                      <span className={`badge ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {row.status === 'active' ? t('common.active') : t('common.inactive')}
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
