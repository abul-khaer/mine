import { useTranslation } from 'react-i18next';
import type { Mine } from '../../types';

interface Props {
  mines: Mine[];
  mineId: string;
  startDate: string;
  endDate: string;
  onMineChange: (v: string) => void;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onApply: () => void;
}

export default function ReportFilter({
  mines, mineId, startDate, endDate,
  onMineChange, onStartDateChange, onEndDateChange, onApply,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('common.filter')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('reports.filterMine')}</label>
          <select value={mineId} onChange={(e) => onMineChange(e.target.value)} className="input-field">
            <option value="">{t('common.all')} Tambang</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('reports.startDate')}</label>
          <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">{t('reports.endDate')}</label>
          <input type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} className="input-field" />
        </div>
        <div className="flex items-end">
          <button onClick={onApply} className="btn-primary w-full">
            {t('common.filter')}
          </button>
        </div>
      </div>
    </div>
  );
}
