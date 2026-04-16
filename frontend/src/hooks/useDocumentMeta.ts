import { useEffect } from 'react';
import { useCompanyStore } from '../store/companyStore';
import { assetUrl } from '../utils/assetUrl';

/**
 * Dynamically updates browser tab title and favicon
 * based on company settings from the store.
 */
export function useDocumentMeta() {
  const settings = useCompanyStore((s) => s.settings);

  useEffect(() => {
    // Update tab title
    document.title = settings?.company_name
      ? `${settings.company_name}`
      : 'Mining Management System';

    // Update favicon
    const logoUrl = assetUrl(settings?.logo_url);
    if (logoUrl) {
      setFavicon(logoUrl);
    }
  }, [settings?.company_name, settings?.logo_url]);
}

function setFavicon(url: string) {
  // Remove all existing favicon links
  document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());

  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = url;
  document.head.appendChild(link);
}
