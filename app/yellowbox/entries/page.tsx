"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useYellowBoxContext } from "@/contexts/yellowbox-context";
import { Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

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
  created_at: string;
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<YellowboxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
  const router = useRouter();
  const { lang, t, getFontClass } = useYellowBoxContext();

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

  const handleGenerateQuote = async () => {
    if (entries.length === 0) {
      toast.error(lang === "zh" ? "没有找到任何条目" : "No entries found");
      return;
    }

    setIsGeneratingQuote(true);
    try {
      const response = await fetch("/api/yellowbox/generate-quote", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate quote");
      }

      const result = await response.json();

      if (result.success) {
        // 创建下载链接
        const svgBlob = new Blob([result.svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        // 创建一个临时的下载链接
        const link = document.createElement("a");
        link.href = url;
        link.download = `yellowbox-quote-${new Date().getTime()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(
          lang === "zh"
            ? `精彩瞬间已生成并下载！内容：${result.quote.slice(0, 30)}...`
            : `Quote generated and downloaded! Content: ${result.quote.slice(0, 30)}...`
        );
      } else {
        throw new Error(result.error || "Failed to generate quote");
      }
    } catch (error) {
      console.error("Error generating quote:", error);
      toast.error(
        lang === "zh"
          ? "生成精彩瞬间失败，请稍后重试"
          : "Failed to generate quote, please try again"
      );
    } finally {
      setIsGeneratingQuote(false);
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
    conversationHistory: Array<{ type: string; content: string }>,
    aiSummary?: string
  ) => {
    // If AI summary exists, use it as the title
    if (aiSummary && aiSummary.trim()) {
      return aiSummary;
    }

    // Fallback to original preview logic
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
                  {getPreviewText(entry.entries.conversationHistory, entry.metadata?.aiSummary) ||
                   'Untitled Entry'}
                </div>

                {/* Enhanced Summary Info */}
                {entry.metadata?.enhancedSummary && (
                  <div className="mb-2 space-y-1.5">
                    {/* Tags - show first 3 */}
                    {entry.metadata.enhancedSummary.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.metadata.enhancedSummary.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-1.5 py-0.5 text-xs rounded-full bg-[#E4BE10] text-[#3B3109] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                        {entry.metadata.enhancedSummary.tags.length > 3 && (
                          <span className="text-xs text-[#3B3109] opacity-50">
                            +{entry.metadata.enhancedSummary.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Emotion indicator */}
                    <div className="text-xs text-[#3B3109] opacity-60">
                      <span className="capitalize">{entry.metadata.enhancedSummary.emotion.primary}</span>
                      {entry.metadata.enhancedSummary.emotion.intensity !== 'medium' && (
                        <span className="ml-1 opacity-75">({entry.metadata.enhancedSummary.emotion.intensity})</span>
                      )}
                    </div>
                  </div>
                )}

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

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-4">
          {/* Generate Quote Button */}
          {entries.length > 0 && (
            <Button
              onClick={handleGenerateQuote}
              disabled={isGeneratingQuote}
              className="bg-[#C04635] hover:bg-[#A03B2A] text-white border-none px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isGeneratingQuote ? (
                <>
                  <Download className="w-4 h-4 animate-pulse" />
                  {lang === "zh" ? "生成中..." : "Generating..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {lang === "zh" ? "生成精彩瞬间" : "Generate Quote"}
                </>
              )}
            </Button>
          )}

          {/* Back Button */}
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

    </>
  );
}
