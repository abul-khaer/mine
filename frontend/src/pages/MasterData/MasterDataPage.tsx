import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, FileText, ShieldCheck, Building2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import GeneralTab from './tabs/GeneralTab';
import AuthenticatorTab from './tabs/AuthenticatorTab';
import CompanyTab from './tabs/CompanyTab';

const tabs = [
  { key: 'general', icon: FileText, label: 'General' },
  { key: 'authenticator', icon: ShieldCheck, label: 'Google Authenticator' },
  { key: 'company', icon: Building2, label: 'Company Info & Logo' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function MasterDataPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('general');

  return (
    <div>
      <PageHeader title="Master Data" />

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white border border-cream-200 rounded-2xl p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-forest-bg text-white shadow-sm'
                : 'text-forest-mid hover:bg-cream-100 hover:text-forest-deep'
            }`}
          >
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'general' && <GeneralTab />}
      {activeTab === 'authenticator' && <AuthenticatorTab />}
      {activeTab === 'company' && <CompanyTab />}
    </div>
  );
}
