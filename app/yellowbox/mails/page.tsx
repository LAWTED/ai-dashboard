"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, ArrowLeft, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { toast } from "sonner";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Link from "next/link";

// Sample email data
const sampleEmails = [
  {
    id: 1,
    from: "alice@stanford.edu",
    subject: "Welcome to Graduate School Journey",
    preview: "Congratulations on taking the first step towards your graduate studies...",
    date: "2 hours ago",
    color: "bg-blue-100 border-blue-300",
    textColor: "text-blue-900"
  },
  {
    id: 2,
    from: "advisor@university.edu",
    subject: "Research Opportunities Available",
    preview: "I wanted to reach out about some exciting research opportunities...",
    date: "1 day ago",
    color: "bg-green-100 border-green-300",
    textColor: "text-green-900"
  },
  {
    id: 3,
    from: "fellowship@grants.org",
    subject: "Fellowship Application Deadline",
    preview: "This is a reminder that the fellowship application deadline is approaching...",
    date: "3 days ago",
    color: "bg-purple-100 border-purple-300",
    textColor: "text-purple-900"
  },
  {
    id: 4,
    from: "journal@research.com",
    subject: "Paper Submission Confirmation",
    preview: "Thank you for submitting your paper to our journal...",
    date: "1 week ago",
    color: "bg-pink-100 border-pink-300",
    textColor: "text-pink-900"
  },
  {
    id: 5,
    from: "conference@academic.org",
    subject: "Conference Registration Open",
    preview: "Registration is now open for the upcoming academic conference...",
    date: "2 weeks ago",
    color: "bg-orange-100 border-orange-300",
    textColor: "text-orange-900"
  },
  {
    id: 6,
    from: "library@university.edu",
    subject: "New Database Access Available",
    preview: "We're excited to announce access to new research databases...",
    date: "3 weeks ago",
    color: "bg-teal-100 border-teal-300",
    textColor: "text-teal-900"
  }
];

interface EmailCardProps {
  email: typeof sampleEmails[0];
  index: number;
  resetTrigger: number;
}

// 计算统一的拖拽约束，确保所有邮件都有相同的活动范围
function calculateDragConstraints(index: number) {
  const emailWidth = 320; // 80 * 4 = 320px (w-80)
  const emailHeight = 128; // 32 * 4 = 128px (h-32)

  // 计算邮件的初始位置
  const initialLeft = 700 + (index % 3) * 320;
  const initialTop = 150 + Math.floor(index / 3) * 160;

  // 定义统一的活动范围边界
  const minX = 50; // 距离屏幕左边缘最小距离
  const maxX = 1600; // 距离屏幕右边缘最大位置
  const minY = 50; // 距离屏幕顶部最小距离
  const maxY = 800; // 距离屏幕底部最大位置

  // 计算相对于初始位置的约束，确保所有邮件都能到达相同的边界
  const constraints = {
    left: minX - initialLeft,
    right: maxX - initialLeft - emailWidth,
    top: minY - initialTop,
    bottom: maxY - initialTop - emailHeight
  };

  return constraints;
}

function EmailCard({ email, index, resetTrigger }: EmailCardProps) {
  const dragConstraints = calculateDragConstraints(index);
  const controls = useAnimation();

  // 计算初始旋转角度
  const initialRotation = (index % 2 === 0 ? 1 : -1) * (1 + index * 0.5);

  // 初始动画 + 监听resetTrigger的变化，触发重置动画
  useEffect(() => {
    if (resetTrigger === 0) {
      // 初始加载动画
      const initialAnimation = async () => {
        await controls.start({
          x: 0,
          y: 0,
          rotateZ: initialRotation,
          opacity: 1,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
            type: "spring",
            stiffness: 100,
            damping: 15
          }
        });
      };

      initialAnimation();
    } else {
      // 重置动画
      const resetToInitial = async () => {
        await controls.start({
          x: 0,
          y: 0,
          rotateZ: initialRotation,
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 20,
            duration: 0.8,
            delay: index * 0.1, // 依次重置动画
          }
        });
      };

      resetToInitial();
    }
  }, [resetTrigger, controls, initialRotation, index]);

  return (
    <motion.div
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      animate={controls}
      whileDrag={{
        scale: 1.08,
        rotateZ: (index % 2 === 0 ? 8 : -8),
        zIndex: 1000,
        cursor: "grabbing",
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      whileHover={{
        scale: 1.02,
        cursor: "grab",
        boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
      }}
      onDragEnd={() => {
        // 确保拖拽结束后邮件保持正确的大小和旋转
        controls.start({
          rotateZ: initialRotation,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3
          }
        });
      }}
      initial={{
        x: 0,
        y: 0,
        rotateZ: initialRotation,
        opacity: 0
      }}
      className={`absolute w-80 h-32 ${email.color} border-2 rounded-lg shadow-lg p-4 cursor-grab active:cursor-grabbing pointer-events-auto`}
      style={{
        left: `${700 + (index % 3) * 320}px`,
        top: `${150 + Math.floor(index / 3) * 160}px`
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Mail className={`w-4 h-4 ${email.textColor}`} />
          <span className={`text-sm font-medium ${email.textColor}`}>
            {email.from}
          </span>
        </div>
        <span className={`text-xs ${email.textColor} opacity-70`}>
          {email.date}
        </span>
      </div>

      <h3 className={`font-semibold text-sm mb-1 ${email.textColor} line-clamp-1`}>
        {email.subject}
      </h3>

      <p className={`text-xs ${email.textColor} opacity-80 line-clamp-2`}>
        {email.preview}
      </p>

      {/* Drag handle indicator */}
      <div className={`absolute top-2 right-2 w-4 h-4 ${email.textColor} opacity-30`}>
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MailsPage() {
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">("serif");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useYellowboxTranslation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(t("logoutSuccess") as string);
      router.push("/yellowbox/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error(t("loginError") as string);
    }
  };

  const handleLanguageToggle = () => {
    const newLang = lang === "zh" ? "en" : "zh";
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  const getFontClass = () => {
    switch (currentFont) {
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      case "mono":
        return "font-mono";
      default:
        return "font-serif";
    }
  };

  const handleFontToggle = () => {
    if (currentFont === "serif") {
      setCurrentFont("sans");
    } else if (currentFont === "sans") {
      setCurrentFont("mono");
    } else {
      setCurrentFont("serif");
    }
  };

  const handleResetPositions = async () => {
    if (isResetting) return; // 防止重复点击

    setIsResetting(true);
    setResetTrigger(prev => prev + 1);

    toast.success(
      lang === "zh"
        ? "正在重置邮件位置..."
        : "Resetting email positions..."
    );

    // 等待动画完成（大约1秒）
    setTimeout(() => {
      setIsResetting(false);
      toast.success(
        lang === "zh"
          ? "邮件位置已重置"
          : "Email positions reset"
      );
    }, 1000);
  };

  return (
    <>
      {/* Yellow Rounded Box */}
      <div
        className={`absolute left-4 top-4 w-[640px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
      >
        <div>
          {/* Header - Back to Main Link */}
          <Link href="/yellowbox">
            <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-3 h-3 text-[#3B3109]" />
              <span className="text-[#3B3109] text-xs font-medium">
                {lang === "zh" ? "返回主页" : "Back to Main"}
              </span>
            </div>
          </Link>

          {/* Title */}
          <div className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight">
            <motion.h1
              initial={{
                x: -100,
                opacity: 0,
                filter: "blur(4px)",
                scale: 0.8,
              }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              className="text-5xl font-bold leading-tight"
            >
              <span className="italic font-semibold">
                {lang === "zh" ? "邮件" : "Mail"}
              </span>{" "}
              {lang === "zh" ? "收件箱" : "Inbox"}
            </motion.h1>
          </div>

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-4"></div>

          {/* Instructions */}
          <div className="text-[#C04635] text-lg font-medium mb-4">
            {lang === "zh"
              ? "拖动邮件到任意位置 - 所有邮件现在有相同的活动范围"
              : "Drag emails anywhere - All emails now have equal movement range"
            }
          </div>

          {/* Reset Button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleResetPositions}
              disabled={isResetting}
              className="bg-[#C04635] hover:bg-[#A03B2A] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting
                ? (lang === "zh" ? "重置中..." : "Resetting...")
                : (lang === "zh" ? "重置位置" : "Reset Positions")
              }
            </Button>
          </div>

          {/* Bottom divider line */}
          <div className="w-full h-px bg-[#E4BE10] mt-4"></div>
        </div>
      </div>

      {/* Email Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {sampleEmails.map((email, index) => (
            <EmailCard key={email.id} email={email} index={index} resetTrigger={resetTrigger} />
          ))}
        </AnimatePresence>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
        {/* Scroll indicator dots */}
        <div className="flex flex-col items-center space-y-2 mb-4">
          <div className="size-1.5 rounded-full bg-black"></div>
          <div className="w-1 h-12 rounded-full bg-[#2AB186]"></div>
          <div className="size-1.5 rounded-full bg-black"></div>
        </div>

        {/* Font Switcher */}
        <Button
          onClick={handleFontToggle}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={`Current: ${
            currentFont === "serif"
              ? "Serif (Georgia)"
              : currentFont === "sans"
              ? "Sans (Inter)"
              : "Mono (Courier New)"
          }`}
          variant="ghost"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentFont}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span
                className={`text-lg font-medium ${
                  currentFont === "serif"
                    ? "font-serif"
                    : currentFont === "sans"
                    ? "font-sans"
                    : "font-mono"
                }`}
              >
                Aa
              </span>
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Language Switcher */}
        <Button
          onClick={handleLanguageToggle}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={getLanguageTooltip()}
          variant="ghost"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={lang}
              initial={{ x: -10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ x: 10, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <span
                className={`text-lg font-medium ${
                  currentFont === "serif"
                    ? "font-serif"
                    : currentFont === "sans"
                    ? "font-sans"
                    : "font-mono"
                }`}
              >
                {lang === "zh" ? "中" : "En"}
              </span>
            </motion.div>
          </AnimatePresence>
        </Button>

        {/* Logout button */}
        <Button
          onClick={handleLogout}
          className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
          title={t("logout") as string}
          variant="ghost"
        >
          <LogOut className="!w-5 !h-5" />
        </Button>
      </div>
    </>
  );
}