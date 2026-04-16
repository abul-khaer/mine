import { cn } from '../../utils/cn';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colors = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red:    'bg-red-50 text-red-600',
};

export default function StatCard({ title, value, icon, color = 'blue' }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className={cn('p-3 rounded-xl', colors[color])}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
