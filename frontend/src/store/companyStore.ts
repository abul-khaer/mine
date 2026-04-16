import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CompanySettings } from '../types';

interface CompanyStore {
  settings: CompanySettings | null;
  setSettings: (settings: CompanySettings) => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      settings: null,
      setSettings: (settings) => set({ settings }),
    }),
    { name: 'company-storage' }
  )
);
