import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  loading?: boolean;
}

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message, loading }: Props) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('common.confirm')} size="sm">
      <div className="flex gap-4 mb-6">
        <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <p className="text-forest-mid text-sm leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">
          {t('common.cancel')}
        </button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? t('common.loading') : t('common.yes')}
        </button>
      </div>
    </Modal>
  );
}
