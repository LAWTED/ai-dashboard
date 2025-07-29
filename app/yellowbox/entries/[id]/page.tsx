"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { OptimizedAnalyticsDebug } from "@/components/optimized-yellowbox-analytics-debug";
import { MinimalYellowBoxAnalytics } from "@/types/yellowbox-analytics";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { useYellowboxEntry, useDeleteEntry } from "@/hooks/use-yellowbox-queries";
import { QuoteDesignDialog } from "@/components/yellowbox/quote-design-dialog";

export default function EntryDetailPage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const entryId = params.id as string;
  const isDebugMode = searchParams.get('debug') === 'true';
  const { lang, t } = useYellowBoxI18n();
  
  // Use React Query for data fetching
  const { data: entry, isLoading, error } = useYellowboxEntry(entryId);
  const deleteEntryMutation = useDeleteEntry();
  
  // Memoize entries array to prevent unnecessary re-renders
  const entriesArray = useMemo(() => entry ? [entry] : [], [entry]);




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
      await deleteEntryMutation.mutateAsync(entryId);
      router.push("/yellowbox/entries");
    } catch (error) {
      // Error handling is done in the hook
      console.error("Error deleting entry:", error);
    }
  };


  return (
    <>
      {/* Header - Back to Entries Link */}
      <Link href="/yellowbox/entries">
        <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-3 h-3 text-[#3B3109]" />
          <motion.span 
            layoutId="my-entries-title"
            className="text-[#3B3109] text-xs font-medium"
          >
            {t("backToEntries")}
          </motion.span>
        </div>
      </Link>

      {/* Content */}
      {isLoading ? (
          <div className="text-center py-8 text-[#3B3109]">
            {t("loadingEntry")}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#C04635]">
            {String(error)}
          </div>
        ) : entry ? (
          <>
          <div className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight overflow-hidden">
            <h1 className="text-5xl font-bold leading-tight">
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
            </h1>
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            {/* Design Quote Button */}
            <Button
              onClick={() => setIsQuoteDialogOpen(true)}
              className="bg-yellow-400 hover:bg-yellow-300 text-[#3B3109] border border-[#E4BE10] px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {lang === "zh" ? "设计精彩瞬间" : "Design Quote"}
            </Button>
            
            {/* Delete Button */}
            <Button
              onClick={handleDelete}
              disabled={deleteEntryMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              title={lang === "zh" ? "删除条目" : "Delete entry"}
            >
              <Trash2 className="w-4 h-4" />
              {deleteEntryMutation.isPending
                ? (lang === "zh" ? "删除中..." : "Deleting...")
                : (lang === "zh" ? "删除" : "Delete")
              }
            </Button>
          </div>
          </>
        ) : null}

      {/* Analytics Debug Information */}
      {isDebugMode && entry && (
        <div className="absolute right-4 top-[0px] w-[640px]">
          <OptimizedAnalyticsDebug
            analytics={(entry as { analytics?: MinimalYellowBoxAnalytics }).analytics || null}
            language={lang}
          />
        </div>
      )}

      {/* Quote Design Dialog */}
      {entry && (
        <QuoteDesignDialog
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          entries={entriesArray}
        />
      )}
    </>
  );
}