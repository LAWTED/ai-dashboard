"use client";

import { motion } from "framer-motion";
import useMeasure from "react-use-measure";
import { useYellowBoxUI } from "@/contexts/yellowbox-ui-context";
import { useState, useEffect } from "react";

interface YellowBoxContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function YellowBoxContainer({ children, className = "" }: YellowBoxContainerProps) {
  const [contentRef, bounds] = useMeasure();
  const { getFontClass } = useYellowBoxUI();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <motion.div
      className={`absolute left-2 md:left-4 top-2 md:top-4 bottom-4 w-[calc(100vw-16px)] md:w-[640px] max-w-[640px] bg-yellow-400 rounded-2xl p-3 md:p-4 overflow-hidden ${getFontClass()} ${className}`}
      animate={{
        height: bounds.height ? bounds.height + (isMobile ? 24 : 32) : undefined,
      }}
      style={{
        maxHeight: 'calc(100vh - 32px)'
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </motion.div>
  );
}