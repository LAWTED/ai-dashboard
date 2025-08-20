"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { OptimizedAnalyticsDebug } from "@/components/optimized-yellowbox-analytics-debug";
import { MinimalYellowBoxAnalytics } from "@/types/yellowbox-analytics";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { useYellowboxEntry, useDeleteEntry } from "@/hooks/use-yellowbox-queries";
import QuoteDesignCanvas from "@/components/yellowbox/quote-design-canvas";
import { LoadingWithPuppy } from "@/components/ui/loading-with-puppy";

export default function EntryDetailPage() {
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const entryId = params.id as string;
  const isDebugMode = searchParams.get('debug') === 'true';
  const { lang, t, translations } = useYellowBoxI18n();

  // Use React Query for data fetching
  const { data: entry, isLoading, error } = useYellowboxEntry(entryId);
  const deleteEntryMutation = useDeleteEntry();

  // Memoize entries array to prevent unnecessary re-renders (kept for potential future use)
  // const entriesArray = useMemo(() => entry ? [entry] : [], [entry]);

  const handleDelete = async () => {
    if (!entry) return;

    // Show confirmation dialog
    const confirmed = window.confirm(t("confirmDelete") as string);

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
        <div className="text-center py-8">
          <LoadingWithPuppy className="text-[#3B3109]" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[#C04635]">
          {String(error)}
        </div>
      ) : entry ? (
        <div className="flex flex-col h-full">
          <div className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight overflow-hidden flex-shrink-0">
            <h1 className="text-5xl font-bold leading-tight">
              {entry.metadata?.aiSummary ? (
                <span className="text-[#C04635] italic">
                  {entry.metadata.aiSummary}
                </span>
              ) : entry.entries.timeOfDay === "morning" ? (
                t("morningReflection")
              ) : entry.entries.timeOfDay === "evening" ? (
                t("eveningReflection")
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

          {/* Enhanced Summary Values and Emotion */}
          {entry.metadata?.enhancedSummary && (
            <div className="mb-3 space-y-2 flex-shrink-0">
              {/* Values - only show if values field exists */}
              {entry.metadata.enhancedSummary.values && entry.metadata.enhancedSummary.values.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {entry.metadata.enhancedSummary.values.map((value, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-200 text-[#3B3109] border border-[#E4BE10]"
                    >
                      <span className="w-1.5 h-1.5 bg-[#C04635] rounded-full mr-1.5"></span>
                      {value}
                    </span>
                  ))}
                </div>
              )}

              {/* Emotion - hidden for now */}
            </div>
          )}

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-2 flex-shrink-0"></div>

          {/* Conversation and Content Container */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
            {/* Selected Question */}
            {entry.entries.selectedQuestion && 
             entry.entries.selectedQuestion !== translations.placeholder && 
             entry.entries.selectedQuestion !== "Write..." && (
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
                      <div className="py-1">
                        {/* User images */}
                        {message.images && message.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {message.images.map((imageUrl, imgIndex) => {
                              // Generate the same layoutId as in InputSection based on image content
                              const imageHash = btoa(imageUrl.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                              const layoutId = `image-${imageHash}-${imgIndex}`;

                              return (
                                <motion.div
                                  key={imgIndex}
                                  layoutId={layoutId}
                                  drag
                                  dragConstraints={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                  }}
                                  dragElastic={0.2}
                                  whileDrag={{ scale: 1.1, zIndex: 10 }}
                                  className="cursor-grab active:cursor-grabbing"
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`User uploaded image ${imgIndex + 1}`}
                                    width={192}
                                    height={192}
                                    className="max-w-48 max-h-48 object-cover rounded-lg border-2 border-yellow-600 pointer-events-none"
                                  />
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
                        {/* User text */}
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
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
            className="w-full h-px bg-[#E4BE10] my-2 flex-shrink-0"
          ></motion.div>

          {/* Action Buttons - positioned to slide up from container bottom */}
          <div className="relative mt-4 overflow-hidden flex-shrink-0">
            <motion.div
              className="flex justify-center gap-3"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.4, // Start when height animation is nearly finished
                duration: 0.4,
                ease: "easeOut"
              }}
              layout
            >
              {/* Design Quote Button */}
              <Button
                onClick={() => setIsQuoteDialogOpen(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-[#3B3109] border border-[#E4BE10] px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t("designQuote")}
              </Button>

              {/* Delete Button */}
              <Button
                onClick={handleDelete}
                disabled={deleteEntryMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-none px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                title={t("deleteEntry") as string}
              >
                <Trash2 className="w-4 h-4" />
                {deleteEntryMutation.isPending
                  ? t("deleting")
                  : t("delete")
                }
              </Button>
            </motion.div>
          </div>
        </div>
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

      {/* Quote Design Canvas */}
      {entry && (
        <QuoteDesignCanvas
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          entry={entry}
          language={lang}
        />
      )}
    </>
  );
}