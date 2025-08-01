"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LoadingWithPuppyProps {
  className?: string;
}

export function LoadingWithPuppy({ className = "" }: LoadingWithPuppyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <Image
        src="/loading.gif"
        alt="Loading..."
        width={48}
        height={48}
        className="pixelated"
        unoptimized // Important for GIFs to animate
      />
    </motion.div>
  );
}