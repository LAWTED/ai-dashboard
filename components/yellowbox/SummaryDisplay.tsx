"use client";

import { AnimatePresence, motion } from "framer-motion";

interface SummaryDisplayProps {
  showSummary: boolean;
  isGeneratingSummary: boolean;
  summaryTitle: string;
  timeOfDay: "morning" | "daytime" | "evening";
  t: (key: string) => string | string[];
  valueTags?: string[];
}

export function SummaryDisplay({
  showSummary,
  isGeneratingSummary,
  summaryTitle,
  timeOfDay,
  t,
  valueTags,
}: SummaryDisplayProps) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.h1
        key={showSummary ? `summary-${summaryTitle}` : timeOfDay}
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
        {showSummary ? (
          <span className="text-[#C04635] italic">
            {isGeneratingSummary ? t("generatingSummary") : summaryTitle}
          </span>
        ) : timeOfDay === "morning" ? (
          t("morningReflection")
        ) : timeOfDay === "evening" ? (
          t("eveningReflection")
        ) : (
          <>
            {t("titlePart1")}
            <span className="italic font-semibold">{t("titlePart2")}</span>
            {t("titlePart3")}
          </>
        )}
      </motion.h1>
      
      {/* Value Tags - only show when summary is displayed and not generating */}
      {showSummary && !isGeneratingSummary && valueTags && valueTags.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {valueTags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-200 text-[#3B3109] border border-[#E4BE10]"
            >
              <span className="w-1.5 h-1.5 bg-[#C04635] rounded-full mr-1.5"></span>
              {tag}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}