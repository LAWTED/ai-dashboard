"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OptimizedAnalyticsDebug } from "@/components/optimized-yellowbox-analytics-debug";
import { MinimalYellowBoxAnalytics } from "@/types/yellowbox-analytics";

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
    aiSummary?: string;
    enhancedSummary?: {
      title: string;
      tags: string[];
      emotion: {
        primary: string;
        intensity: 'low' | 'medium' | 'high';
        confidence: number;
      };
      themes: string[];
    };
  };
  analytics?: MinimalYellowBoxAnalytics;
  created_at: string;
}

export default function EntryDetailPage() {
  const [entry, setEntry] = useState<YellowboxEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">("serif");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const entryId = params.id as string;
  const isDebugMode = searchParams.get('debug') === 'true';
  const supabase = createClient();
  const { t, lang, setLang } = useYellowboxTranslation();

  const loadEntry = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/yellowbox/entries?id=${entryId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to load entry");
      }

      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        setEntry(result.data[0]);
      } else {
        setError("Entry not found");
      }
    } catch (err) {
      console.error("Error loading entry:", err);
      setError("Failed to load entry");
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
  }, [entryId, loadEntry]);

  useEffect(() => {
    if (entry?.metadata?.currentFont) {
      setCurrentFont(entry.metadata.currentFont as "serif" | "sans" | "mono");
    }
  }, [entry]);

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

  const handleFontToggle = () => {
    if (currentFont === "serif") {
      setCurrentFont("sans");
    } else if (currentFont === "sans") {
      setCurrentFont("mono");
    } else {
      setCurrentFont("serif");
    }
  };

  const handleDelete = async () => {
    if (!entry) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      lang === "zh"
        ? "确定要删除这个条目吗？此操作无法撤销。"
        : "Are you sure you want to delete this entry? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/yellowbox/entries?id=${entryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          lang === "zh"
            ? "条目已成功删除"
            : "Entry deleted successfully"
        );
        router.push("/yellowbox/entries");
      } else {
        throw new Error(result.message || "Failed to delete entry");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error(
        lang === "zh"
          ? "删除条目失败"
          : "Failed to delete entry"
      );
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>

      {/* Yellow Rounded Box */}
      <div
        className={`absolute left-4 top-4 w-[640px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
      >
        <div>
          {/* Header - Back to Entries Link */}
          <Link href="/yellowbox/entries">
            <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-3 h-3 text-[#3B3109]" />
              <span className="text-[#3B3109] text-xs font-medium">
                {t("backToEntries")}
              </span>
            </div>
          </Link>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8 text-[#3B3109]">
            {t("loadingEntry")}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#C04635]">
            {error === "Entry not found" ? t("entryNotFound") : error === "Failed to load entry" ? t("errorLoadingEntry") : error}
          </div>
        ) : entry ? (
          <>
          <div className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h1
                key={entry.id}
                initial={{
                  x: -100,
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 0.8,
                }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ x: 100, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                className="text-5xl font-bold leading-tight"
              >
                {entry.metadata?.aiSummary ? (
                  <span className="text-[#C04635] italic">
                    {entry.metadata.aiSummary}
                  </span>
                ) : entry.entries.timeOfDay === "morning" ? (
                  <>
                    <span className="italic font-semibold">Morning</span>{" "}
                    Reflection
                  </>
                ) : entry.entries.timeOfDay === "evening" ? (
                  <>
                    <span className="italic font-semibold">Evening</span>{" "}
                    Reflection
                  </>
                ) : (
                  <>
                    {t("titlePart1")}
                    <span className="italic font-semibold">
                      {t("titlePart2")}
                    </span>
                    {t("titlePart3")}
                  </>
                )}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Enhanced Summary Tags and Emotion */}
          {entry.metadata?.enhancedSummary && (
            <div className="mb-3 space-y-2">
              {/* Tags */}
              {entry.metadata.enhancedSummary.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.metadata.enhancedSummary.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-2 py-0.5 text-xs rounded-full bg-[#E4BE10] text-[#3B3109] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Emotion */}
              <div className="flex items-center gap-2 text-sm text-[#3B3109] opacity-75">
                <span className="capitalize">{entry.metadata.enhancedSummary.emotion.primary}</span>
                <span className="text-xs">•</span>
                <span className="capitalize">{entry.metadata.enhancedSummary.emotion.intensity} intensity</span>
                {entry.metadata.enhancedSummary.themes.length > 0 && (
                  <>
                    <span className="text-xs">•</span>
                    <span className="text-xs">{entry.metadata.enhancedSummary.themes.join(", ")}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

          {/* Conversation and Content Container */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-3">
            {/* Selected Question */}
            {entry.entries.selectedQuestion && entry.entries.selectedQuestion !== "Write..." && (
              <div className="text-[#C04635] text-lg font-medium mb-3">
                {entry.entries.selectedQuestion}
              </div>
            )}

            {/* Conversation History */}
            {entry.entries.conversationHistory.length > 0 && (
              <div className="space-y-3">
                {entry.entries.conversationHistory.map((message, index) => (
                  <div key={index} className={`text-[#3B3109] text-base`}>
                    {message.type === "ai" ? (
                      <div className="text-[#C04635] text-base ">
                        {message.content}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap py-1">
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom divider line */}
          <motion.div
            layout
            className="w-full h-px bg-[#E4BE10] my-2"
          ></motion.div>

          {/* Delete Button */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              title={lang === "zh" ? "删除条目" : "Delete entry"}
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting
                ? (lang === "zh" ? "删除中..." : "Deleting...")
                : (lang === "zh" ? "删除" : "Delete")
              }
            </Button>
          </div>
          </>
        ) : null}
        </div>
      </div>

      {/* Analytics Debug Information */}
      {isDebugMode && entry && (
        <div className="absolute right-4 top-[0px] w-[640px]">
          <OptimizedAnalyticsDebug
            analytics={entry.analytics || null}
            language={lang}
          />
        </div>
      )}

      {/* Right Side Controls */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
        {/* Scroll indicator dots (static for detail page) */}
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