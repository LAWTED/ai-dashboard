"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import {
  useYellowboxEntries,
  usePrefetchYellowboxData,
} from "@/hooks/use-yellowbox-queries";
import { Download, Search, X } from "lucide-react";
import { ExportDialog } from "@/components/yellowbox/ExportDialog";
import { LoadingWithPuppy } from "@/components/ui/loading-with-puppy";

export default function EntriesPage() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const router = useRouter();
  const { lang, t } = useYellowBoxI18n();

  // Use React Query for data fetching
  const { data: entries = [], isLoading, error } = useYellowboxEntries();
  const { prefetchEntry } = usePrefetchYellowboxData();

  // Filter entries based on search criteria
  const filteredEntries = entries.filter((entry) => {
    // Text search in conversation content and AI summary
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const aiSummary = entry.metadata?.aiSummary?.toLowerCase() || "";
      const conversationText = entry.entries.conversationHistory
        .map((msg) => msg.content.toLowerCase())
        .join(" ");

      if (!aiSummary.includes(query) && !conversationText.includes(query)) {
        return false;
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const entryTags = entry.metadata?.enhancedSummary?.tags || [];
      if (!selectedTags.some((tag) => entryTags.includes(tag))) {
        return false;
      }
    }

    // Emotion filter
    if (selectedEmotion) {
      const entryEmotion = entry.metadata?.enhancedSummary?.emotion?.primary;
      if (entryEmotion !== selectedEmotion) {
        return false;
      }
    }

    return true;
  });

  // Get all available tags and emotions for filter options
  const allTags = Array.from(
    new Set(
      entries.flatMap((entry) => entry.metadata?.enhancedSummary?.tags || [])
    )
  ).sort();

  const allEmotions = Array.from(
    new Set(
      entries
        .map((entry) => entry.metadata?.enhancedSummary?.emotion?.primary)
        .filter((emotion): emotion is string => Boolean(emotion))
    )
  ).sort();

  // Prefetch entry data on hover for better UX
  const handleEntryHover = useCallback(
    (entryId: string) => {
      prefetchEntry(entryId);
    },
    [prefetchEntry]
  );


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
        return t("daytime") as string;
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
      {/* Header with Title and Export Button - Fixed */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          layoutId="my-entries-title"
          className="text-2xl md:text-3xl font-bold px-2 text-[#3B3109] leading-tight"
        >
          {t("myEntries")}
        </motion.div>

        {/* Export Button */}
        {entries.length > 0 && (
          <Button
            onClick={() => setIsExportDialogOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-300 text-[#3B3109] border border-[#E4BE10] px-2 md:px-3 py-2 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t("export")}</span>
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#E4BE10] mb-4"></div>

      {/* Search and Filters - Fixed */}
      {entries.length > 0 && (
        <div className="mb-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#3B3109] opacity-60" />
            <input
              type="text"
              placeholder={t("searchEntries") as string}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-yellow-300 text-[#3B3109] placeholder-[#3B3109] placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[#E4BE10]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#3B3109] opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

            {/* Quick Filter Tags - Hidden */}
            {false && (allTags.length > 0 || allEmotions.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {/* Tag filters */}
                {allTags.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-[#E4BE10] text-[#3B3109]"
                        : "bg-yellow-300 text-[#3B3109] hover:bg-[#E4BE10]"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}

                {/* Emotion filters */}
                {allEmotions.slice(0, 3).map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => {
                      setSelectedEmotion(
                        selectedEmotion === emotion ? null : emotion
                      );
                    }}
                    className={`px-2 py-1 text-xs rounded-full transition-colors capitalize ${
                      selectedEmotion === emotion
                        ? "bg-[#E4BE10] text-[#3B3109]"
                        : "bg-yellow-300 text-[#3B3109] hover:bg-[#E4BE10]"
                    }`}
                  >
                    {emotion}
                  </button>
                ))}

                {/* Clear filters */}
                {(searchQuery ||
                  selectedTags.length > 0 ||
                  selectedEmotion) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedTags([]);
                      setSelectedEmotion(null);
                    }}
                    className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800 hover:bg-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}

            {/* Results count */}
            {(searchQuery || selectedTags.length > 0 || selectedEmotion) && (
              <div className="text-xs text-[#3B3109] opacity-60">
                {filteredEntries.length === entries.length
                  ? `Showing all ${entries.length} entries`
                  : `Showing ${filteredEntries.length} of ${entries.length} entries`}
              </div>
            )}
          </div>
        )}

      {/* Scrollable Content Area */}
      <div className="max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-280px)] overflow-y-auto overflow-hidden">
        {/* Content */}
        {isLoading ? (
          <div className="text-center py-8">
            <LoadingWithPuppy className="text-[#3B3109]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-[#C04635]">
            {t("errorLoadingEntries")}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-[#3B3109]">
            {entries.length === 0 ? (
              <>
                <p className="mb-4">{t("noEntries")}</p>
                <Link href="/yellowbox">
                  <Button
                    variant="ghost"
                    className="bg-yellow-300 hover:bg-yellow-200 text-[#3B3109] border border-[#E4BE10]"
                  >
                    {t("backToWrite")}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mb-4">
                  {t("noMatchingEntries")}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTags([]);
                    setSelectedEmotion(null);
                  }}
                  variant="ghost"
                  className="bg-yellow-300 hover:bg-yellow-200 text-[#3B3109] border border-[#E4BE10]"
                >
                  {t("clearSearch")}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                className="cursor-pointer"
                onClick={() => router.push(`/yellowbox/entries/${entry.id}`)}
                onMouseEnter={() => handleEntryHover(entry.id)}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#3B3109] text-lg font-bold">
                    {formatDate(entry.created_at)}
                  </div>
                  <div className="text-[#3B3109] text-lg font-bold">
                    {new Date(entry.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>

                {/* Entry Content */}
                <div className="text-[#3B3109] text-base leading-relaxed mb-1">
                  {getPreviewText(
                    entry.entries.conversationHistory,
                    entry.metadata?.aiSummary
                  ) || "Untitled Entry"}
                </div>

                {/* Enhanced Summary Info */}
                {entry.metadata?.enhancedSummary && (
                  <div className="mb-2 space-y-1.5">
                    {/* Values - only show if values field exists */}
                    {entry.metadata.enhancedSummary.values && entry.metadata.enhancedSummary.values.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.metadata.enhancedSummary.values
                          .slice(0, 3)
                          .map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-yellow-200 text-[#3B3109] border border-[#E4BE10] font-medium"
                            >
                              <span className="w-1 h-1 bg-[#C04635] rounded-full mr-1"></span>
                              {value}
                            </span>
                          ))}
                        {entry.metadata.enhancedSummary.values.length > 3 && (
                          <span className="text-xs text-[#3B3109] opacity-50">
                            +{entry.metadata.enhancedSummary.values.length - 3}{" "}
                            more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Emotion indicator - hidden */}
                    {false && (
                      <div className="text-xs text-[#3B3109] opacity-60">
                        <span className="capitalize">
                          {entry.metadata.enhancedSummary.emotion.primary}
                        </span>
                        {entry.metadata.enhancedSummary.emotion.intensity !==
                          "medium" && (
                          <span className="ml-1 opacity-75">
                            ({entry.metadata.enhancedSummary.emotion.intensity})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Subtitle with additional info */}
                <div className="text-[#3B3109] text-sm opacity-75 mb-4">
                  {getTimeOfDayLabel(entry.entries.timeOfDay)},{" "}
                  {new Date(entry.created_at).getFullYear()}
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#E4BE10]"></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons - positioned to slide up from container bottom */}
      <div className="relative mt-4 overflow-hidden">
        <motion.div
          className="flex justify-center gap-3"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.4,
            layout: {
              delay: 0,
            },
          }}
        >

          {/* Back Button */}
          <Link href="/yellowbox">
            <Button
              variant="ghost"
              className="bg-yellow-400 hover:bg-yellow-300 text-[#3B3109] border border-[#E4BE10] px-4 md:px-6 text-sm md:text-base"
            >
              {t("backToWrite")}
            </Button>
          </Link>
        </motion.div>
      </div>


      {/* Export Dialog */}
      <ExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        entries={entries}
      />
    </>
  );
}
