"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useYellowboxEntries } from "@/hooks/use-yellowbox-queries";
import { StatsCards } from "./StatsCards";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";

export function RightSidePanel() {
  const { data: entries = [], isLoading } = useYellowboxEntries();
  const { t } = useYellowBoxI18n();
  const pathname = usePathname();

  // Only show on specific pages
  const shouldShow = pathname === "/yellowbox/entries";



  return (
    <AnimatePresence>
      {!shouldShow || isLoading || entries.length === 0 ? null :(

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: [0.165, 0.84, 0.44, 1] }}
        className="fixed right-4 top-4 w-80 bg-yellow-400 rounded-2xl p-4 max-h-[calc(100vh-32px)] overflow-y-auto z-20"
      >
        {/* Panel Title */}
        <div className="text-2xl font-bold text-[#3B3109] mb-4">
          {t("writingStats")}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#E4BE10] mb-4"></div>

        {/* Stats Cards */}
        <StatsCards entries={entries} className="grid-cols-1" />
      </motion.div>

      )}
    </AnimatePresence>
  );
}
