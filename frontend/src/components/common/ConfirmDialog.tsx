import { useTranslation } from 'react-i18next';
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
      <p className="text-gray-600 mb-6">{message}</p>
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
