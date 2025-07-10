"use client";

import { useLocale } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { Button } from "@/components/ui/button";

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
  const locale = useLocale();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh';
    router.replace('/', { locale: newLocale });
  };

  // Show the target language name
  const getDisplayText = () => {
    return locale === 'zh' ? 'English' : '中文';
  };

  const getTooltipText = () => {
    return locale === 'zh' ? 'Switch to English' : '切换到中文';
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant={variant}
      size={size}
      title={getTooltipText()}
      className={`flex items-center bg-white/20 backdrop-blur-sm text-gray-800 hover:bg-white/30 hover:text-gray-900 rounded-lg !h-fit transition-all duration-200 ${className}`}
    >
      {getDisplayText()}
    </Button>
  );
}