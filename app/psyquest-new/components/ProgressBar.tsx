"use client";

import { motion } from "framer-motion";
import { useDialogueStore } from "../stores/dialogueStore";

interface ProgressBarProps {
  className?: string;
}

export default function ProgressBar({
  className = "",
}: ProgressBarProps) {
  const currentStep = useDialogueStore(state => state.getCurrentStep());
  const totalSteps = useDialogueStore(state => state.getTotalSteps());
  
  const progress = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);
  const fillWidth = `${progress}%`;
  // Visual tuning constants to match the mock
  const insetX = 7; // px left/right gap between track and fill
  const insetY = 6; // px top/bottom gap

  return (
    <motion.div
      className={`h-[43px] bg-white border border-black rounded-full overflow-hidden relative ${className}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      <motion.div
        className="absolute rounded-full overflow-hidden border border-black"
        initial={{ width: 0 }}
        animate={{ width: `calc(${fillWidth} - ${insetX * 2}px)` }}
        transition={{
          duration: 0.5,
          delay: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        style={{
          top: `${insetY}px`,
          left: `${insetX}px`,
          height: `calc(100% - ${insetY * 2}px)`,
          maxWidth: `calc(100% - ${insetX * 2}px)`,
          minWidth: progress > 0 ? "12px" : "0px",
          backgroundImage:
            "url('/psyquest-new/60be46d7751be104eb395972bf22a38fbac4e258.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "80px 80px",
        }}
      >
        {/* subtle highlight to keep paper texture lively */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 40%, rgba(0,0,0,0.06) 100%)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
