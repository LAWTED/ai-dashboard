"use client";

import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { useYellowBoxUI } from "@/contexts/yellowbox-ui-context";

interface YellowBoxContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function YellowBoxContainer({ children, className = "" }: YellowBoxContainerProps) {
  const [contentRef, bounds] = useMeasure();
  const { getFontClass } = useYellowBoxUI();

  return (
    <motion.div
      className={`absolute left-4 top-4 w-[640px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()} ${className}`}
      animate={{
        height: bounds.height ? bounds.height + 32 : undefined,
      }}
      transition={{
        height: {
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }
      }}
      layout
    >
      <div ref={contentRef}>
        {children}
      </div>
    </motion.div>
  );
}