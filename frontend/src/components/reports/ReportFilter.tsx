import { useTranslation } from 'react-i18next';
import { Filter } from 'lucide-react';
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
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 bg-earth-100 rounded-lg flex items-center justify-center">
          <Filter size={13} className="text-earth-600" />
        </div>
        <h3 className="text-sm font-bold text-forest-deep">{t('common.filter')}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5">
            {t('reports.filterMine')}
          </label>
          <select value={mineId} onChange={(e) => onMineChange(e.target.value)} className="input-field">
            <option value="">{t('common.all')} Tambang</option>
            {mines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5">
            {t('reports.startDate')}
          </label>
          <input type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-forest-mid uppercase tracking-wide mb-1.5">
            {t('reports.endDate')}
          </label>
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
