"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontType = "serif" | "sans" | "mono";
type TimeOfDay = "morning" | "daytime" | "evening";

interface YellowBoxUIContextType {
  currentFont: FontType;
  setCurrentFont: (font: FontType) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  isMac: boolean;
  handleFontToggle: () => void;
  getFontClass: () => string;
}

const YellowBoxUIContext = createContext<YellowBoxUIContextType | null>(null);

interface YellowBoxUIProviderProps {
  children: ReactNode;
}

export function YellowBoxUIProvider({ children }: YellowBoxUIProviderProps) {
  const [currentFont, setCurrentFontState] = useState<FontType>("serif");
  const [timeOfDay, setTimeOfDayState] = useState<TimeOfDay>("daytime");
  const [isMac, setIsMac] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.includes("Mac"));
      
      const savedFont = localStorage.getItem('yellowbox-font') as FontType;
      if (savedFont && ['serif', 'sans', 'mono'].includes(savedFont)) {
        setCurrentFontState(savedFont);
      }

      // Initialize time of day based on current time
      const now = new Date();
      const hour = now.getHours();
      let currentTimeOfDay: TimeOfDay;
      
      if (hour < 9) {
        currentTimeOfDay = "morning";
      } else if (hour >= 9 && hour < 21) {
        currentTimeOfDay = "daytime";
      } else {
        currentTimeOfDay = "evening";
      }
      
      setTimeOfDayState(currentTimeOfDay);
      setIsInitialized(true);
    }
  }, []);

  const setCurrentFont = (font: FontType) => {
    setCurrentFontState(font);
    if (typeof window !== "undefined") {
      localStorage.setItem('yellowbox-font', font);
    }
  };

  const setTimeOfDay = (timeOfDay: TimeOfDay) => {
    setTimeOfDayState(timeOfDay);
  };

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

  if (!isInitialized) {
    return null;
  }

  const contextValue: YellowBoxUIContextType = {
    currentFont,
    setCurrentFont,
    timeOfDay,
    setTimeOfDay,
    isMac,
    handleFontToggle,
    getFontClass,
  };

  return (
    <YellowBoxUIContext.Provider value={contextValue}>
      {children}
    </YellowBoxUIContext.Provider>
  );
}

export function useYellowBoxUI() {
  const context = useContext(YellowBoxUIContext);
  if (!context) {
    throw new Error('useYellowBoxUI must be used within a YellowBoxUIProvider');
  }
  return context;
}