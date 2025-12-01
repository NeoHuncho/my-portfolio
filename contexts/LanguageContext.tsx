'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { type Locale, translations, type TranslationStrings } from '../config/translations';

type LanguageContextValue = {
  locale: Locale;
  toggleLocale: () => void;
  strings: TranslationStrings;
};

const defaultContext: LanguageContextValue = {
  locale: 'en',
  toggleLocale: () => {},
  strings: translations.en,
};

export const LanguageContext = createContext<LanguageContextValue>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    if (typeof navigator === 'undefined') {
      return;
    }
    const browserLang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
    setLocale(browserLang.startsWith('fr') ? 'fr' : 'en');
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'fr' : 'en'));
  }, []);

  const contextValue = useMemo(
    () => ({
      locale,
      toggleLocale,
      strings: translations[locale],
    }),
    [locale, toggleLocale]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}
