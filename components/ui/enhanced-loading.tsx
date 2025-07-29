"use client";

import { motion } from "framer-motion";
import { TextShimmer } from "./text-shimmer";

interface EnhancedLoadingProps {
  stage: "reading" | "thinking" | "responding";
  className?: string;
  duration?: number;
}

export function EnhancedLoading({ 
  stage, 
  className = "", 
  duration = 1.5 
}: EnhancedLoadingProps) {
  const getStageText = () => {
    switch (stage) {
      case "reading":
        return "Reading...";
      case "thinking":
        return "Thinking...";
      case "responding":
        return "Responding...";
      default:
        return "Processing...";
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case "reading":
        return "👀";
      case "thinking":
        return "🤔";
      case "responding":
        return "✍️";
      default:
        return "⏳";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
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
        {getStageText()}
      </TextShimmer>
    </motion.div>
  );
}