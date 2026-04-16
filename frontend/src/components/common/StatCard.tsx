import { cn } from '../../utils/cn';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colors = {
  blue:   'bg-primary-100 text-primary-600',
  green:  'bg-forest-dark/15 text-forest-dark',
  yellow: 'bg-earth-100 text-earth-600',
  red:    'bg-red-50 text-red-500',
};

export default function StatCard({ title, value, icon, color = 'blue' }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-forest-mid font-medium">{title}</p>
        <p className="text-2xl font-extrabold text-forest-deep">{value}</p>
      </div>
    </div>
  );
}
