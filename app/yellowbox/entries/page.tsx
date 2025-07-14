"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface YellowboxEntry {
  id: string;
  entries: {
    selectedQuestion?: string;
    conversationHistory: Array<{
      type: "user" | "ai";
      content: string;
    }>;
    timeOfDay: "morning" | "daytime" | "evening";
    conversationCount: number;
    completedAt: string;
  };
  metadata: {
    currentFont?: string;
    language?: string;
    totalMessages: number;
  };
  created_at: string;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<YellowboxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">(
    "serif"
  );
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useYellowboxTranslation();

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/yellowbox/entries", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to load entries");
      }

      const result = await response.json();
      if (result.success) {
        setEntries(result.data || []);
      } else {
        setError(result.message || "Failed to load entries");
      }
    } catch (err) {
      console.error("Error loading entries:", err);
      setError("Failed to load entries");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t("logoutSuccess") as string);
      router.push("/yellowbox/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("loginError") as string);
    }
  };

  const handleLanguageToggle = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  const handleFontToggle = () => {
    if (currentFont === "serif") {
      setCurrentFont("sans");
    } else if (currentFont === "sans") {
      setCurrentFont("mono");
    } else {
      setCurrentFont("serif");
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeOfDayLabel = (timeOfDay: string) => {
    switch (timeOfDay) {
      case "morning":
        return "Morning";
      case "evening":
        return "Evening";
      case "daytime":
      default:
        return lang === "zh" ? "日间" : "Daytime";
    }
  };

  const getPreviewText = (
    conversationHistory: Array<{ type: string; content: string }>
  ) => {
    const userMessages = conversationHistory.filter(
      (msg) => msg.type === "user"
    );
    if (userMessages.length > 0) {
      return (
        userMessages[0].content.slice(0, 100) +
        (userMessages[0].content.length > 100 ? "..." : "")
      );
    }
    return "";
  };

  return (
    <>

      {/* Yellow Rounded Box */}
      <div
        className={`absolute left-4 top-4 w-[640px] bg-yellow-400 rounded-2xl p-4 max-h-[calc(100vh-32px)] overflow-y-auto ${getFontClass()}`}
      >
        {/* Title */}
        <div className="text-4xl font-bold px-2 text-[#3B3109] mb-4 leading-tight">
          {t("myEntries")}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E4BE10] mb-4"></div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8 text-[#3B3109]">
            {t("loadingEntries")}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#C04635]">
            {error === "Failed to load entries"
              ? t("errorLoadingEntries")
              : error}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-[#3B3109]">
            <p className="mb-4">{t("noEntries")}</p>
            <Link href="/yellowbox">
              <Button
                variant="ghost"
                className="bg-yellow-300 hover:bg-yellow-200 text-[#3B3109] border border-[#E4BE10]"
              >
                {t("backToWrite")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                className="cursor-pointer"
                onClick={() => router.push(`/yellowbox/entries/${entry.id}`)}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#3B3109] text-lg font-bold">
                    {formatDate(entry.created_at)}
                  </div>
                  <div className="text-[#3B3109] text-lg font-bold">
                    {new Date(entry.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false 
                    })}
                  </div>
                </div>

                {/* Entry Content */}
                <div className="text-[#3B3109] text-base leading-relaxed mb-1">
                  {getPreviewText(entry.entries.conversationHistory) ||
                   'Untitled Entry'}
                </div>

                {/* Subtitle with additional info */}
                <div className="text-[#3B3109] text-sm opacity-75 mb-4">
                  {getTimeOfDayLabel(entry.entries.timeOfDay)}, {new Date(entry.created_at).getFullYear()}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#E4BE10]"></div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center mt-4">
          <Link href="/yellowbox">
            <Button
              variant="ghost"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#3B3109] border border-[#E4BE10] px-6"
            >
              {t("backToWrite")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
        {/* Scroll indicator dots (static for entries page) */}
        <div className="flex flex-col items-center space-y-2 mb-4">
          <div className="size-1.5 rounded-full bg-black"></div>
          <div className="w-1 h-12 rounded-full bg-[#2AB186]"></div>
          <div className="size-1.5 rounded-full bg-black"></div>
        </div>

        {/* Font Switcher */}
        <Button
          onClick={handleFontToggle}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={`Current: ${
            currentFont === "serif"
              ? "Serif (Georgia)"
              : currentFont === "sans"
              ? "Sans (Inter)"
              : "Mono (Courier New)"
          }`}
          variant="ghost"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentFont}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span
                className={`text-lg font-medium ${
                  currentFont === "serif"
                    ? "font-serif"
                    : currentFont === "sans"
                    ? "font-sans"
                    : "font-mono"
                }`}
              >
                Aa
              </span>
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Language Switcher */}
        <Button
          onClick={handleLanguageToggle}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={getLanguageTooltip()}
          variant="ghost"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={lang}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span
                className={`text-lg font-medium ${
                  currentFont === "serif"
                    ? "font-serif"
                    : currentFont === "sans"
                    ? "font-sans"
                    : "font-mono"
                }`}
              >
                {lang === "zh" ? "中" : "En"}
              </span>
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Logout button */}
        <Button
          onClick={handleLogout}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
          title={t("logout") as string}
          variant="ghost"
        >
          <LogOut className="!w-5 !h-5" />
        </Button>
      </div>
    </>
  );
}
