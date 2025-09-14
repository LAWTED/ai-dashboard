"use client";

import { motion } from "framer-motion";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function QuizProgress({ currentQuestion, totalQuestions }: QuizProgressProps) {
  return (
    <motion.div
      className="relative flex items-center justify-start px-6 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: 0.15,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* 问题编号圆形徽章 - 根据 Figma 精确尺寸 */}
      <motion.div
        className="flex flex-col items-center"
        style={{
          position: 'absolute',
          left: '45.64px', // Figma 设计中的精确位置
        }}
      >
        {/* 外层圆圈 */}
        <motion.div
          className="rounded-full bg-black flex items-center justify-center shadow-lg"
          style={{
            width: '54.192px',   // Figma 外圆直径
            height: '54.192px',
          }}
          animate={{
            scale: 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* 内层圆圈 */}
          <div
            className="rounded-full bg-white flex items-center justify-center"
            style={{
              width: '47.418px',   // Figma 内圆直径
              height: '47.418px',
            }}
          >
            <span 
              className="font-bold text-black"
              style={{ 
                fontSize: '24px', // 适配尺寸，原设计 42.783px
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {currentQuestion}
            </span>
          </div>
        </motion.div>

        {/* 进度点 - 根据 Figma 设计 */}
        <div className="mt-3 flex space-x-2">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={`rounded-full ${
                index < currentQuestion ? 'bg-black' : 'bg-gray-400'
              }`}
              style={{
                width: '2.852px',    // Figma 点直径
                height: '2.852px',
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}