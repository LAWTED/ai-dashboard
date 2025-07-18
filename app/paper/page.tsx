"use client";

import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";

// 时间选择器组件
const TimeSelector = () => {
  return (
    <div className="fixed top-4 right-4 z-50 ">
      <div className="rounded-[8px] bg-gray-100 p-[2px] dark:bg-zinc-800">
        <AnimatedBackground
          defaultValue="Week"
          className="rounded-lg bg-white dark:bg-zinc-700"
          transition={{
            ease: "easeInOut",
            duration: 0.2,
          }}
        >
          {["Week", "Month", "Year"].map((label, index) => {
            return (
              <button
                key={index}
                data-id={label}
                type="button"
                aria-label={`${label} view`}
                className="inline-flex w-20 items-center justify-center text-center text-zinc-800 transition-transform active:scale-[0.98] dark:text-zinc-50"
              >
                {label}
              </button>
            );
          })}
        </AnimatedBackground>
      </div>
    </div>
  );
};

const initialElements = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center",
    className: "w-52 h-52 rounded-lg overflow-hidden",
    initialX: 800,
    initialY: 280,
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop&crop=center",
    className: "w-52 h-52 rounded-lg overflow-hidden",
    initialX: 550,
    initialY: 150,
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop&crop=center",
    className: "w-52 h-52 rounded-lg overflow-hidden",
    initialX: 680,
    initialY: 150,
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=350&fit=crop&crop=center",
    className: "w-52 h-52 rounded-lg overflow-hidden",
    initialX: 820,
    initialY: 50,
  },
  {
    id: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=350&h=350&fit=crop&crop=center",
    className: "w-52 h-52 rounded-lg overflow-hidden",
    initialX: 600,
    initialY: 200,
  },
];

interface DraggableElementProps {
  element: (typeof initialElements)[0];
  index: number;
  resetTrigger: number;
  onOffScreen: (id: number) => void;
  onOnScreen: (id: number) => void;
}

function DraggableElement({
  element,
  index,
  resetTrigger,
  onOffScreen,
  onOnScreen,
}: DraggableElementProps) {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(elementRef, { amount: 0.1 });

  useEffect(() => {
    if (!isInView) {
      onOffScreen(element.id);
    } else {
      onOnScreen(element.id);
    }
  }, [isInView, element.id, onOffScreen, onOnScreen]);

  useEffect(() => {
    if (resetTrigger === 0) {
      // 初始动画：从屏幕外飞进来
      controls.start({
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          delay: index * 0.1,
          type: "spring",
          stiffness: 80,
          damping: 12,
        },
      });
    } else {
      // 重置动画：从当前位置回到初始位置
      const resetToInitial = async () => {
        await controls.start({
          x: 0,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 20,
            duration: 0.8,
            delay: index * 0.1,
          },
        });
      };
      resetToInitial();
    }
  }, [resetTrigger, controls, index]);

  // 计算初始位置（从屏幕外的四周）
  const getInitialPosition = () => {
    const positions = [
      { x: -300, y: 0 }, // 左侧
      { x: 300, y: 0 }, // 右侧
      { x: 0, y: -300 }, // 上方
      { x: 0, y: 300 }, // 下方
      { x: -300, y: -300 }, // 左上
      { x: 300, y: -300 }, // 右上
    ];
    return positions[index % positions.length];
  };

  const initialPos = getInitialPosition();

  return (
    <motion.div
      ref={elementRef}
      drag
      dragElastic={0.1}
      animate={controls}
      className={`${element.className} shadow-lg cursor-grab active:cursor-grabbing absolute relative z-20`}
      style={{
        left: `${element.initialX}px`,
        top: `${element.initialY}px`,
      }}
      whileDrag={{ scale: 1.1 }}
      initial={{
        x: initialPos.x,
        y: initialPos.y,
        opacity: 0,
      }}
    >
      <img
        src={element.imageUrl}
        alt={`Element ${element.id}`}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </motion.div>
  );
}

export default function PaperPage() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [offScreenElements, setOffScreenElements] = useState<Set<number>>(
    new Set()
  );
  const [showCallBack, setShowCallBack] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });

  // 获取屏幕尺寸
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
      setCenterPoint({ x: width / 2, y: height / 2 });
    };

    // 初始化
    updateScreenSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const handleOffScreen = useCallback((id: number) => {
    setOffScreenElements((prev) => {
      if (prev.has(id)) return prev;
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const handleOnScreen = useCallback((id: number) => {
    setOffScreenElements((prev) => {
      if (!prev.has(id)) return prev;
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  useEffect(() => {
    setShowCallBack(offScreenElements.size > 0);
  }, [offScreenElements]);

  const handleCallBack = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
    setOffScreenElements(new Set());
    setShowCallBack(false);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#F4F5F6] relative overflow-hidden">
      <div className="p-8">
        {/* 时间选择器 */}
        <TimeSelector />

        {initialElements.map((element, index) => (
          <DraggableElement
            key={element.id}
            element={element}
            index={index}
            resetTrigger={resetTrigger}
            onOffScreen={handleOffScreen}
            onOnScreen={handleOnScreen}
          />
        ))}

        {/* 屏幕中心红点 */}
        {centerPoint.x > 0 && centerPoint.y > 0 && (
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full z-50 transform -translate-x-2 -translate-y-2"
            style={{
              left: centerPoint.x,
              top: centerPoint.y,
            }}
          />
        )}

        {/* 显示屏幕尺寸信息 */}
        {screenSize.width > 0 && (
          <div className="fixed top-4 left-4 z-50 bg-black/70 text-white p-2 rounded text-sm">
            Screen: {screenSize.width} x {screenSize.height}
            <br />
            Center: ({Math.round(centerPoint.x)}, {Math.round(centerPoint.y)})
          </div>
        )}

        <AnimatePresence>
          {showCallBack && (
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <motion.div
                onClick={handleCallBack}
                className="text-4xl font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer pointer-events-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Call Them Back
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
