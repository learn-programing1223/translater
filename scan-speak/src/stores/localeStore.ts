import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocaleState } from '@/types';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { getBrowserLanguage } from '@/lib/utils';

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      currentLocale: typeof window !== 'undefined' ? getBrowserLanguage() : 'en',
      supportedLocales: SUPPORTED_LANGUAGES,
      setLocale: (locale) => set({ currentLocale: locale }),
    }),
    {
      name: 'locale-storage',
    }
  )
);