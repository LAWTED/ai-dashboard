"use client";

import { AnimatePresence, motion } from "framer-motion";

interface SummaryDisplayProps {
  showSummary: boolean;
  isGeneratingSummary: boolean;
  summaryTitle: string;
  timeOfDay: "morning" | "daytime" | "evening";
  t: (key: string) => string | string[];
}

export function SummaryDisplay({
  showSummary,
  isGeneratingSummary,
  summaryTitle,
  timeOfDay,
  t,
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
    </AnimatePresence>
  );
}