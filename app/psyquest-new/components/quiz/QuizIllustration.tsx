"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface QuizIllustrationProps {
  src: string;
  alt: string;
}

export default function QuizIllustration({ src, alt }: QuizIllustrationProps) {
  return (
    <motion.div
      className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* 占位符 - 后续会替换为真实的 3D 插图 */}
      <div className="text-center text-gray-500">
        <div className="text-4xl mb-2">🎨</div>
        <div className="text-sm">Illustration Placeholder</div>
        <div className="text-xs mt-1">{alt}</div>
      </div>
      
      {/* 如果有实际图片，则显示 */}
      {src && src !== '/psyquest-new/illustrations/campus.png' && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 534px) 100vw, 534px"
        />
      )}
    </motion.div>
  );
}