"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useYellowboxTranslation, Language, YellowboxTranslations } from '@/lib/i18n/yellowbox';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type FontType = "serif" | "sans" | "mono";

interface YellowBoxContextType {
  // User state
  userId: string;
  isAuthenticated: boolean;
  
  // UI preferences
  currentFont: FontType;
  setCurrentFont: (font: FontType) => void;
  isMac: boolean;
  
  // Translation state
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof YellowboxTranslations) => string | string[];
  translations: YellowboxTranslations;
  
  // Actions
  handleLogout: () => Promise<void>;
  handleFontToggle: () => void;
  handleLanguageToggle: () => void;
  
  // Helper functions
  getFontClass: () => string;
  getLanguageTooltip: () => string;
}

const YellowBoxContext = createContext<YellowBoxContextType | null>(null);

interface YellowBoxProviderProps {
  children: ReactNode;
}

export function YellowBoxProvider({ children }: YellowBoxProviderProps) {
  const [userId, setUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentFont, setCurrentFontState] = useState<FontType>("serif");
  const [isMac, setIsMac] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();
  const { t, translations, lang, setLang } = useYellowboxTranslation();

  // Initialize user and platform detection
  useEffect(() => {
    const initializeContext = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setIsAuthenticated(true);
      }

      // Detect platform
      if (typeof window !== "undefined") {
        setIsMac(navigator.platform.includes("Mac"));
        
        // Load saved preferences
        const savedFont = localStorage.getItem('yellowbox-font') as FontType;
        if (savedFont && ['serif', 'sans', 'mono'].includes(savedFont)) {
          setCurrentFontState(savedFont);
        }
      }
      
      setIsInitialized(true);
    };

    initializeContext();
  }, [supabase]);

  // Persist font changes
  const setCurrentFont = (font: FontType) => {
    setCurrentFontState(font);
    if (typeof window !== "undefined") {
      localStorage.setItem('yellowbox-font', font);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserId("");
      setIsAuthenticated(false);
      toast.success(t("logoutSuccess") as string);
      router.push("/yellowbox/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("loginError") as string);
    }
  };

  // Handle font toggle
  const handleFontToggle = () => {
    let newFont: FontType;
    if (currentFont === "serif") {
      newFont = "sans";
    } else if (currentFont === "sans") {
      newFont = "mono";
    } else {
      newFont = "serif";
    }
    setCurrentFont(newFont);
  };

  // Handle language toggle
  const handleLanguageToggle = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  // Get font CSS class
  const getFontClass = () => {
    switch (currentFont) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
    }
  };

  // Get language tooltip
  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return null;
  }

  const contextValue: YellowBoxContextType = {
    userId,
    isAuthenticated,
    currentFont,
    setCurrentFont,
    isMac,
    lang,
    setLang,
    t,
    translations,
    handleLogout,
    handleFontToggle,
    handleLanguageToggle,
    getFontClass,
    getLanguageTooltip,
  };

  return (
    <YellowBoxContext.Provider value={contextValue}>
      {children}
    </YellowBoxContext.Provider>
  );
}

export function useYellowBoxContext() {
  const context = useContext(YellowBoxContext);
  if (!context) {
    throw new Error('useYellowBoxContext must be used within a YellowBoxProvider');
  }
  return context;
}