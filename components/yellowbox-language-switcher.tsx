"use client";

import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useYellowboxTranslation, type Language } from "@/lib/i18n/yellowbox";

interface YellowboxLanguageSwitcherProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  showIcon?: boolean;
}

export default function YellowboxLanguageSwitcher({
  className = "",
  variant = "ghost",
  size = "sm",
  showIcon = true,
}: YellowboxLanguageSwitcherProps) {
  const { lang, setLang, isInitialized } = useYellowboxTranslation();

  const toggleLanguage = () => {
    const newLang: Language = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  // Show current language icon
  const getLanguageIcon = () => {
    if (!isInitialized) return <Languages className="w-5 h-5" />;
    if (showIcon) {
      return <Languages className="w-5 h-5" />;
    }
    return lang === "zh" ? "English" : "中文";
  };

  const getTooltipText = () => {
    if (!isInitialized) return "";
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant={variant}
      size={size}
      title={getTooltipText()}
      className={`flex items-center justify-center transition-all duration-200 ${className} pointer-events-auto`}
    >
      {getLanguageIcon()}
    </Button>
  );
}