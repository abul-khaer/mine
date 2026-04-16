import { useState } from 'react';
import { Gem, Briefcase, Building2, DollarSign, Activity } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import MasterDataTable from './MasterDataTable';

interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const tabs: Tab[] = [
  { key: 'mineral_type', label: 'Jenis Mineral', icon: <Gem size={16} />, category: 'mineral_type' },
  { key: 'position', label: 'Jabatan', icon: <Briefcase size={16} />, category: 'position' },
  { key: 'department', label: 'Departemen', icon: <Building2 size={16} />, category: 'department' },
  { key: 'financial_category', label: 'Kategori Keuangan', icon: <DollarSign size={16} />, category: 'financial_category' },
  { key: 'activity_category', label: 'Kategori Kegiatan', icon: <Activity size={16} />, category: 'activity_category' },
];

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState(tabs[0].key);

  const currentTab = tabs.find((t) => t.key === activeTab) ?? tabs[0];

  return (
    <div>
      <PageHeader title="Master Data" />

      {/* Tab bar */}
      <div className="flex gap-1 bg-cream-100 rounded-2xl p-1 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-forest-bg text-white shadow-sm'
                : 'text-forest-mid hover:text-forest-deep hover:bg-cream-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <MasterDataTable category={currentTab.category} label={currentTab.label} />
    </div>
  );
}
