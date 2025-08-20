"use client";

import { motion } from "framer-motion";
import { TextShimmer } from "./text-shimmer";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import Image from "next/image";

interface EnhancedLoadingProps {
  stage: "reading" | "uploading" | "thinking" | "responding";
  className?: string;
  duration?: number;
  text?: string; // Allow custom text override
}

export function EnhancedLoading({ 
  stage, 
  className = "", 
  duration = 1.5,
  text 
}: EnhancedLoadingProps) {
  const { t } = useYellowBoxI18n();

  const getStageText = () => {
    switch (stage) {
      case "reading":
        return t("reading");
      case "uploading":
        return t("uploading");
      case "thinking":
        return t("thinking");
      case "responding":
        return t("responding");
      default:
        return t("loading");
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case "reading":
        return "👀";
      case "uploading":
        return "📤";
      case "thinking":
        return "🤔";
      case "responding":
        return "✍️";
      default:
        return "⏳";
    }
  };

  const stageText = text || getStageText();
  const isGenericLoading = stageText === "Loading..." || stageText.includes("Loading");

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      {isGenericLoading ? (
        // Show GIF for generic "Loading..." text
        <>
          <Image
            src="/loading.gif"
            alt="Loading..."
            width={32}
            height={32}
            className="pixelated"
            unoptimized // Important for GIFs to animate
          />
        </>
      ) : (
        // Show icon + text for specific states
        <>
          <motion.span
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {getStageIcon()}
          </motion.span>
          <TextShimmer className="font-medium text-base" duration={duration}>
            {(stageText || "Loading...") as string}
          </TextShimmer>
        </>
      )}
    </motion.div>
  );
}