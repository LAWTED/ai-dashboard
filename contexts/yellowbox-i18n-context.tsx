"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useYellowboxTranslation, Language, YellowboxTranslations } from '@/lib/i18n/yellowbox';

interface YellowBoxI18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof YellowboxTranslations) => string | string[];
  translations: YellowboxTranslations;
  handleLanguageToggle: () => void;
  getLanguageTooltip: () => string;
}

const YellowBoxI18nContext = createContext<YellowBoxI18nContextType | null>(null);

interface YellowBoxI18nProviderProps {
  children: ReactNode;
}

export function YellowBoxI18nProvider({ children }: YellowBoxI18nProviderProps) {
  const { t, translations, lang, setLang } = useYellowboxTranslation();

  const handleLanguageToggle = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return t("switchLanguage") as string;
  };

  const contextValue: YellowBoxI18nContextType = {
    lang,
    setLang,
    t,
    translations,
    handleLanguageToggle,
    getLanguageTooltip,
  };

  return (
    <YellowBoxI18nContext.Provider value={contextValue}>
      {children}
    </YellowBoxI18nContext.Provider>
  );
}

export function useYellowBoxI18n() {
  const context = useContext(YellowBoxI18nContext);
  if (!context) {
    throw new Error('useYellowBoxI18n must be used within a YellowBoxI18nProvider');
  }
  return context;
}