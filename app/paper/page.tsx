"use client";

import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatedBackground } from "@/components/ui/animated-background";

// 时间选择器组件
const TimeSelector = ({
  onTimeSelect,
}: {
  onTimeSelect: (type: "Week" | "Month" | "Year") => void;
}) => {
  return (
    <div className="fixed top-4 right-4 md:top-8 md:right-8 z-50 ">
      <div className="rounded-[8px] bg-gray-100 p-[2px] dark:bg-zinc-800">
        <AnimatedBackground
          defaultValue="Week"
          className="rounded-lg bg-white dark:bg-zinc-700"
          transition={{
            ease: "easeInOut",
            duration: 0.2,
          }}
          onValueChange={(value) => {
            onTimeSelect(value as "Week" | "Month" | "Year");
          }}
        >
          {["Week", "Month", "Year"].map((label, index) => {
            return (
              <button
                key={index}
                data-id={label}
                type="button"
                aria-label={`${label} view`}
                className="inline-flex w-16 md:w-20 items-center justify-center text-center text-gray-400 text-base md:text-lg font-bold transition-transform active:scale-[0.98] dark:text-zinc-50"
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

// 生成随机屏幕外位置
const generateOffscreenPosition = () => {
  const isXOutside = Math.random() < 0.5;

  if (isXOutside) {
    // X轴在屏幕外，Y轴可以在任意位置
    const xPercent =
      Math.random() < 0.5
        ? -50 + Math.random() * 30 // (-50, -20)
        : 120 + Math.random() * 30; // (120, 150)
    const yPercent = -50 + Math.random() * 200; // (-50, 150)
    return { xPercent, yPercent };
  } else {
    // Y轴在屏幕外，X轴可以在任意位置
    const yPercent =
      Math.random() < 0.5
        ? -50 + Math.random() * 30 // (-50, -20)
        : 120 + Math.random() * 30; // (120, 150)
    const xPercent = -50 + Math.random() * 200; // (-50, 150)
    return { xPercent, yPercent };
  }
};

// 生成随机屏幕内位置
const generateOnscreenPosition = () => {
  const xPercent = 20 + Math.random() * 60; // (20, 80)
  const yPercent = 20 + Math.random() * 60; // (20, 80)
  return { xPercent, yPercent };
};

// 使用随机位置定义照片 - 默认都在屏幕外
const initialElementsTemplate = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 0, 15), // 2025年1月15日
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 1, 8), // 2025年2月8日
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 2, 22), // 2025年3月22日
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=350&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 3, 12), // 2025年4月12日
  },
  {
    id: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=350&h=350&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 4, 5), // 2025年5月5日
  },
  {
    id: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 5, 20), // 2025年6月20日
  },
  {
    id: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 18), // 2025年7月18日 (第1张)
  },
  {
    id: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 18), // 2025年7月18日 (第2张)
  },
  {
    id: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 18), // 2025年7月18日 (第3张)
  },
  {
    id: 10,
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 18), // 2025年7月18日 (第4张)
  },
  {
    id: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 28), // 2025年7月28日
  },
  {
    id: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 4), // 2025年7月4日
  },
  {
    id: 13,
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 25), // 2025年7月25日
  },
  {
    id: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 5, 10), // 2025年6月10日
  },
  {
    id: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=center",
    className: "w-32 h-32 md:w-52 md:h-52 rounded-lg overflow-hidden",
    date: new Date(2025, 6, 8), // 2025年7月8日
  },
];

// 从 localStorage 获取保存的位置
const getSavedPositions = () => {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("paper-element-positions");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Failed to load saved positions:", error);
    return null;
  }
};

// 保存位置到 localStorage
const savePositions = (
  elements: Array<{
    id: number;
    onscreenX: number;
    onscreenY: number;
  }>
) => {
  if (typeof window === "undefined") return;

  try {
    const positions = elements.reduce((acc, element) => {
      acc[element.id] = {
        onscreenX: element.onscreenX,
        onscreenY: element.onscreenY,
      };
      return acc;
    }, {} as Record<number, { onscreenX: number; onscreenY: number }>);

    localStorage.setItem("paper-element-positions", JSON.stringify(positions));
  } catch (error) {
    console.error("Failed to save positions:", error);
  }
};

// 根据屏幕尺寸计算实际像素位置 - 优先使用保存的位置，否则生成随机位置
const getInitialElements = (screenWidth: number, screenHeight: number) => {
  const savedPositions = getSavedPositions();

  return initialElementsTemplate.map((element) => {
    const offscreenPos = generateOffscreenPosition();

    let onscreenPos;
    if (savedPositions && savedPositions[element.id]) {
      // 使用保存的位置
      onscreenPos = {
        xPercent: (savedPositions[element.id].onscreenX / screenWidth) * 100,
        yPercent: (savedPositions[element.id].onscreenY / screenHeight) * 100,
      };
    } else {
      // 使用随机位置
      onscreenPos = generateOnscreenPosition();
    }

    return {
      ...element,
      // 屏幕外的初始位置
      offscreenX: (screenWidth * offscreenPos.xPercent) / 100,
      offscreenY: (screenHeight * offscreenPos.yPercent) / 100,
      offscreenXPercent: offscreenPos.xPercent,
      offscreenYPercent: offscreenPos.yPercent,
      // 屏幕内的目标位置
      onscreenX: (screenWidth * onscreenPos.xPercent) / 100,
      onscreenY: (screenHeight * onscreenPos.yPercent) / 100,
      onscreenXPercent: onscreenPos.xPercent,
      onscreenYPercent: onscreenPos.yPercent,
    };
  });
};

interface DraggableElementProps {
  element: {
    id: number;
    imageUrl: string;
    className: string;
    offscreenX: number;
    offscreenY: number;
    offscreenXPercent: number;
    offscreenYPercent: number;
    onscreenX: number;
    onscreenY: number;
    onscreenXPercent: number;
    onscreenYPercent: number;
    date: Date;
  };
  index: number;
  resetTrigger: number;
  onOffScreen: (id: number) => void;
  onOnScreen: (id: number) => void;
  shuffledPosition?: { x: number; y: number } | null;
  isInTimeRange: boolean;
  onPositionUpdate: (id: number, x: number, y: number) => void;
  isEditMode: boolean;
}

function DraggableElement({
  element,
  index,
  resetTrigger,
  onOffScreen,
  onOnScreen,
  shuffledPosition,
  isInTimeRange,
  onPositionUpdate,
  isEditMode,
}: DraggableElementProps) {
  const controls = useAnimation();
  const elementRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(elementRef, { amount: 0.1 });

  // 计算屏幕外的初始位置（基于随机生成的屏幕外位置）
  const getInitialPosition = () => {
    // 计算从屏幕外位置到屏幕内位置的偏移量
    const xOffset = element.offscreenX - element.onscreenX;
    const yOffset = element.offscreenY - element.onscreenY;

    return {
      x: xOffset,
      y: yOffset,
    };
  };

  const initialPos = getInitialPosition();

  useEffect(() => {
    // 只有在时间范围内的图片才参与屏幕内外状态追踪
    if (isInTimeRange) {
      if (!isInView) {
        onOffScreen(element.id);
      } else {
        onOnScreen(element.id);
      }
    } else {
      // 不在时间范围内的图片，从追踪列表中移除
      onOnScreen(element.id);
    }
  }, [isInView, element.id, onOffScreen, onOnScreen, isInTimeRange]);

  useEffect(() => {
    if (resetTrigger === 0) {
      // 根据时间范围决定初始状态
      if (isInTimeRange) {
        // 在时间范围内：从屏幕外飞进来
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
        // 不在时间范围内：保持在屏幕外
        controls.set({
          x: initialPos.x,
          y: initialPos.y,
        });
      }
    } else {
      // 重置动画：只重置在时间范围内的图片
      if (isInTimeRange) {
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
      // 不在时间范围内的图片保持当前状态，不参与重置
    }
  }, [
    resetTrigger,
    controls,
    index,
    isInTimeRange,
    initialPos.x,
    initialPos.y,
  ]);

  // 处理时间范围变化
  useEffect(() => {

    if (isInTimeRange) {
      // 进入时间范围：飞入屏幕
      controls.start({
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          delay: index * 0.05,
          type: "spring",
          stiffness: 80,
          damping: 12,
        },
      });
    } else {
      // 离开时间范围：从当前位置飞出屏幕
      // 获取当前实际位置
      const getCurrentPosition = () => {
        if (!elementRef.current) return { x: 0, y: 0 };

        const rect = elementRef.current.getBoundingClientRect();
        const currentX = rect.left + rect.width / 2;
        const currentY = rect.top + rect.height / 2;

        // 计算相对于存储位置的偏移
        const deltaX = currentX - element.onscreenX;
        const deltaY = currentY - element.onscreenY;

        return { x: deltaX, y: deltaY };
      };

      const currentPos = getCurrentPosition();

      // 先设置到当前位置，确保连续性
      controls.set({ x: currentPos.x, y: currentPos.y, opacity: 1 });

      // 然后执行飞出动画
      setTimeout(() => {
        controls.start({
          x: initialPos.x,
          y: initialPos.y,
          transition: {
            duration: 0.8,
            delay: index * 0.03,
            type: "spring",
            stiffness: 100,
            damping: 20,
          },
        });
      }, 16); // 一帧的时间，减少闪烁
    }
  }, [
    isInTimeRange,
    controls,
    index,
    initialPos.x,
    initialPos.y,
    resetTrigger,
    element.onscreenX,
    element.onscreenY,
  ]);

  // 处理shuffle动画
  useEffect(() => {
    if (shuffledPosition) {
      // 计算需要移动的距离（从屏幕内位置到shuffle位置）
      const deltaX = shuffledPosition.x - element.onscreenX;
      const deltaY = shuffledPosition.y - element.onscreenY;

      controls.start({
        x: deltaX,
        y: deltaY,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 25,
          duration: 1.2,
          delay: index * 0.05, // 错开动画时间
        },
      });
    } else if (shuffledPosition === null) {
      // 当shuffle被清除时，回到原始位置 (但不要和resetTrigger冲突)
      // 这个逻辑已经在resetTrigger的useEffect中处理了
    }
  }, [shuffledPosition, controls, element.onscreenX, element.onscreenY, index]);

  // 处理拖拽结束，只在Edit模式下更新位置
  const handleDragEnd = (
    _event: unknown,
    info: { offset: { x: number; y: number } }
  ) => {
    if (!elementRef.current || !isEditMode) return;

    // 获取元素的边界矩形
    const rect = elementRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // 检查元素是否至少有一部分在屏幕内
    const isElementVisible =
      rect.left < windowWidth &&
      rect.right > 0 &&
      rect.top < windowHeight &&
      rect.bottom > 0;

    // 只有当元素还在屏幕内时才更新屏幕位置
    if (isElementVisible) {
      const newX = element.onscreenX + info.offset.x;
      const newY = element.onscreenY + info.offset.y;

      // 先更新位置，然后在下一帧重置偏移，避免抽搐
      onPositionUpdate(element.id, newX, newY);

      // 使用 requestAnimationFrame 确保位置更新后再重置偏移
      requestAnimationFrame(() => {
        controls.set({ x: 0, y: 0 });
      });
    }
  };

  return (
    <motion.div
      ref={elementRef}
      drag
      dragElastic={isEditMode ? 0 : 0.1}
      dragMomentum={isEditMode ? false : true}
      animate={controls}
      onDragEnd={handleDragEnd}
      className={`${element.className} shadow-lg cursor-grab active:cursor-grabbing absolute z-20 -translate-x-1/2 -translate-y-1/2`}
      style={{
        left: `${element.onscreenX}px`,
        top: `${element.onscreenY}px`,
      }}
      whileDrag={isEditMode ? {} : { scale: 1.1 }}
      initial={{
        x: initialPos.x,
        y: initialPos.y,
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
  const [shuffledPositions, setShuffledPositions] = useState<{
    [key: number]: { x: number; y: number };
  } | null>(null);
  const [selectedTimeType, setSelectedTimeType] = useState<
    "Week" | "Month" | "Year"
  >("Week");
  const [currentTimeInfo, setCurrentTimeInfo] = useState<string>("");
  const [elements, setElements] = useState<
    Array<{
      id: number;
      imageUrl: string;
      className: string;
      offscreenX: number;
      offscreenY: number;
      offscreenXPercent: number;
      offscreenYPercent: number;
      onscreenX: number;
      onscreenY: number;
      onscreenXPercent: number;
      onscreenYPercent: number;
      date: Date;
    }>
  >([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // 根据当前屏幕尺寸计算照片位置 - 使用useMemo避免每次渲染都重新生成随机位置
  const initialElements = useMemo(() => {
    if (screenSize.width === 0 || screenSize.height === 0) {
      return [];
    }
    return getInitialElements(screenSize.width, screenSize.height);
  }, [screenSize.width, screenSize.height]);

  // 当initialElements改变时，更新elements状态
  useEffect(() => {
    if (initialElements.length > 0) {
      setElements(initialElements);
    }
  }, [initialElements]);

  // 获取屏幕尺寸
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
    };

    // 初始化
    updateScreenSize();

    // 监听窗口大小变化
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
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

  // 处理位置更新
  const handlePositionUpdate = useCallback(
    (id: number, newX: number, newY: number) => {
      setElements((prev) => {
        const updated = prev.map((element) =>
          element.id === id
            ? { ...element, onscreenX: newX, onscreenY: newY }
            : element
        );

        // 保存更新后的位置到 localStorage
        savePositions(updated);

        return updated;
      });
    },
    []
  );

  useEffect(() => {
    setShowCallBack(offScreenElements.size > 0);
  }, [offScreenElements]);

  const handleCallBack = useCallback(() => {
    setResetTrigger((prev) => prev + 1);
    setOffScreenElements(new Set());
    setShowCallBack(false);
    setShuffledPositions(null); // 重置shuffle状态
  }, []);

  // 获取当前时间信息
  const getCurrentTimeInfo = useCallback((type: "Week" | "Month" | "Year") => {
    const now = new Date();

    switch (type) {
      case "Week":
        // 计算当前是第几周
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor(
          (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
        );
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `Week ${weekNumber}`;
      case "Month":
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return monthNames[now.getMonth()];
      case "Year":
        return now.getFullYear().toString();
      default:
        return "";
    }
  }, []);

  // 处理时间选择器点击
  const handleTimeSelect = useCallback(
    (type: "Week" | "Month" | "Year") => {
      console.log("type", type);
      setSelectedTimeType(type);
      setCurrentTimeInfo(getCurrentTimeInfo(type));
      // 切换时间时自动切换到 View Mode
      setIsEditMode(false);
    },
    [getCurrentTimeInfo]
  );

  // 初始化当前时间信息
  useEffect(() => {
    setCurrentTimeInfo(getCurrentTimeInfo(selectedTimeType));
  }, [selectedTimeType, getCurrentTimeInfo]);

  // 判断照片是否在当前时间范围内
  const isPhotoInTimeRange = useCallback(
    (photoDate: Date, timeType: "Week" | "Month" | "Year") => {
      const now = new Date();

      switch (timeType) {
        case "Week":
          // 获取当前周的开始和结束日期
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return photoDate >= startOfWeek && photoDate <= endOfWeek;

        case "Month":
          return (
            photoDate.getMonth() === now.getMonth() &&
            photoDate.getFullYear() === now.getFullYear()
          );

        case "Year":
          return photoDate.getFullYear() === now.getFullYear();

        default:
          return false;
      }
    },
    []
  );

  // 随机重新分布照片位置 - 只处理时间范围内的图片
  const handleShuffle = useCallback(() => {
    const newPositions: { [key: number]: { x: number; y: number } } = {};

    elements.forEach((element) => {
      // 只对在时间范围内的图片进行shuffle
      if (isPhotoInTimeRange(element.date, selectedTimeType)) {
        // 在 20%-80% 范围内生成随机位置
        const randomX = 20 + Math.random() * 60; // 20% to 80%
        const randomY = 20 + Math.random() * 60; // 20% to 80%

        newPositions[element.id] = {
          x: (screenSize.width * randomX) / 100,
          y: (screenSize.height * randomY) / 100,
        };
      }
      // 不在时间范围内的图片保持原状态，不加入newPositions
    });

    setShuffledPositions(newPositions);
  }, [elements, screenSize, isPhotoInTimeRange, selectedTimeType]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#F4F5F6]">
      {/* Edit Mode 背景点点动画 */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={{ clipPath: "inset(0 100% 0 0)" }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `radial-gradient(circle, #C0C0C0 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          />
        )}
      </AnimatePresence>
      <div className="p-8">
        {/* 时间选择器 */}
        <TimeSelector onTimeSelect={handleTimeSelect} />

        {/* 时间信息显示 - 左上角 */}
        <AnimatePresence>
          {currentTimeInfo && (
            <motion.div
              initial={{ opacity: 0, y: -40, filter: "blur(4px)", scale: 0.9 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, y: -40, filter: "blur(4px)", scale: 0.9 }}
              key={currentTimeInfo}
              transition={{
                bounce: 0.2,
              }}
              className="fixed top-4 left-4 md:top-8 md:left-8 z-50 text-2xl md:text-4xl font-bold text-gray-400 transition-colors pointer-events-auto"
            >
              {currentTimeInfo}
            </motion.div>
          )}
        </AnimatePresence>

        {elements.map((element, index: number) => (
          <DraggableElement
            key={element.id}
            element={element}
            index={index}
            resetTrigger={resetTrigger}
            onOffScreen={handleOffScreen}
            onOnScreen={handleOnScreen}
            shuffledPosition={shuffledPositions?.[element.id]}
            isInTimeRange={isPhotoInTimeRange(element.date, selectedTimeType)}
            onPositionUpdate={handlePositionUpdate}
            isEditMode={isEditMode}
          />
        ))}

        {/* 模式切换按钮 - 固定在左下角 */}
        <motion.div
          onClick={() => setIsEditMode(!isEditMode)}
          className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 text-2xl md:text-4xl font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer pointer-events-auto"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isEditMode ? "Edit Mode" : "View Mode"}
        </motion.div>

        {/* Shuffle Button - 固定在右下角 */}
        <motion.div
          onClick={handleShuffle}
          className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 text-2xl md:text-4xl font-bold text-gray-400 transition-colors cursor-pointer pointer-events-auto ${
            isEditMode ? "" : "hover:text-gray-600"
          }`}
          whileHover={isEditMode ? {} : { scale: 1.02 }}
          whileTap={isEditMode ? {} : { scale: 0.98 }}
        >
          Shuffle
        </motion.div>

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
                className={`text-2xl md:text-4xl font-bold text-gray-400 transition-colors cursor-pointer pointer-events-auto ${
                  isEditMode ? "" : "hover:text-gray-600"
                }`}
                whileHover={isEditMode ? {} : { scale: 1.02 }}
                whileTap={isEditMode ? {} : { scale: 0.98 }}
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
