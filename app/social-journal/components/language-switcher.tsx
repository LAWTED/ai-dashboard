"use client";

import { Button } from "@/components/ui/button";
import { useTranslation, type Language } from "@/lib/i18n/social-journal";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
}

export default function LanguageSwitcher({
  className = "",
  variant = "ghost",
  size = "sm",
}: LanguageSwitcherProps) {
  const { lang, setLang, isInitialized } = useTranslation();

  const toggleLanguage = () => {
    const newLang: Language = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  // 显示当前语言
  const getCurrentLanguageDisplay = () => {
    if (!isInitialized) return "";
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
      className={`flex items-center bg-white/20 backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:text-gray-900  rounded-lg !h-fit transition-all duration-200 ${className} pointer-events-auto`}
    >
      {getCurrentLanguageDisplay()}
    </Button>
  );
}
