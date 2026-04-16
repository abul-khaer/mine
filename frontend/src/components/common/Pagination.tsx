import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, total, limit, onPageChange }: Props) {
  const { t } = useTranslation();
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        {t('common.page')} <span className="font-medium">{page}</span>{' '}
        {t('common.of')} <span className="font-medium">{totalPages}</span>
        {' · '}{from}–{to} {t('common.of')} {total} {t('common.rows')}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-1.5 rounded-lg border border-gray-300 transition-colors',
            page <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-100'
          )}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 text-sm rounded-lg border transition-colors',
                p === page
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-300 hover:bg-gray-100'
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'p-1.5 rounded-lg border border-gray-300 transition-colors',
            page >= totalPages
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-gray-100'
          )}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
