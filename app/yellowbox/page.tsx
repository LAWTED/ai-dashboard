"use client";

import { LogOut, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { VoiceInput } from "@/components/voice-input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { TextEffect } from "@/components/ui/text-effect";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Button } from "@/components/ui/button";
import useMeasure from "react-use-measure";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useYellowboxAnalytics } from "@/hooks/use-yellowbox-analytics";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
};

export default function Component() {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFont, setCurrentFont] = useState<"serif" | "sans" | "mono">(
    "serif"
  );
  const [isComposing, setIsComposing] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "daytime" | "evening">(
    "daytime"
  );
  const [conversationCount, setConversationCount] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [contentRef, bounds] = useMeasure();
  const [userId, setUserId] = useState<string>("");
  const router = useRouter();
  const supabase = createClient();
  const { t, translations, lang, setLang } = useYellowboxTranslation();
  const previousAnswer = useRef<string>("");

  // Initialize analytics with session ID
  const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const {
    analytics,
    trackKeystroke,
    trackTextChange,
    trackInteraction,
    trackApiCall,
    trackError,
    finalizeSession
  } = useYellowboxAnalytics(sessionId, userId);

  // Get questions from translations
  const questions = translations.questions;

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase]);

  // Initialize with a question and set default time of day
  useEffect(() => {
    // Set default time of day based on current time
    const now = new Date();
    const hour = now.getHours();
    let currentTimeOfDay: "morning" | "daytime" | "evening";

    if (hour < 9) {
      currentTimeOfDay = "morning";
    } else if (hour >= 9 && hour < 21) {
      currentTimeOfDay = "daytime";
    } else {
      currentTimeOfDay = "evening";
    }

    setTimeOfDay(currentTimeOfDay);

    // Set question based on time of day
    if (currentTimeOfDay === "daytime") {
      setSelectedQuestion("Write...");
    } else if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }
  }, [questions]);

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    const userMessage = userAnswer.trim();
    
    // Track submit attempt
    trackInteraction('submitAttempts');

    // Add user message to conversation history
    setConversationHistory((prev) => [
      ...prev,
      { type: "user", content: userMessage },
    ]);
    setUserAnswer("");
    setIsLoading(true);

    const apiStartTime = Date.now();
    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedQuestion,
          userEntry: userMessage,
          timeOfDay,
          conversationCount,
        }),
      });
      
      trackApiCall('/api/diary', apiStartTime, response.ok);

      if (!response.ok) {
        trackError('aiResponseErrors');
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      // Add AI response to conversation history
      setConversationHistory((prev) => [
        ...prev,
        { type: "ai", content: data.response },
      ]);

      // Hide input when AI response starts showing
      setShowInput(false);

      // Increment conversation count for daytime mode
      if (timeOfDay === "daytime") {
        setConversationCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error:", error);
      trackError('aiResponseErrors');
      const errorMessage = t("somethingWentWrong") as string;
      setConversationHistory((prev) => [
        ...prev,
        { type: "ai", content: errorMessage },
      ]);

      // Hide input when error message starts showing
      setShowInput(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEntries = async () => {
    // Only save if there's conversation history
    if (conversationHistory.length === 0) {
      return { success: true };
    }

    // Finalize analytics before saving
    finalizeSession();

    const apiStartTime = Date.now();
    try {
      const entriesData = {
        entries: {
          selectedQuestion,
          conversationHistory,
          timeOfDay,
          conversationCount,
          completedAt: new Date().toISOString(),
        },
        session_id: sessionId,
        metadata: {
          currentFont,
          language: lang,
          totalMessages: conversationHistory.length,
        },
        analytics: analytics
      };

      const response = await fetch("/api/yellowbox/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entriesData),
      });
      
      trackApiCall('/api/yellowbox/entries', apiStartTime, response.ok);

      if (!response.ok) {
        trackError('savingErrors');
        throw new Error("Failed to save entries");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error saving entries:", error);
      trackError('savingErrors');
      return { success: false, error: String(error) };
    }
  };

  const resetDiary = async () => {
    // Track reset button click
    trackInteraction('resetButtonClicks');
    
    // Save entries before resetting
    const saveResult = await saveEntries();
    
    if (saveResult.success) {
      toast.success(t("entriesSaved") as string || "Entries saved successfully!");
    } else {
      toast.error(t("saveError") as string || "Failed to save entries");
    }

    setUserAnswer("");
    setConversationHistory([]);
    setShowInput(true);

    // Reset conversation count
    setConversationCount(0);

    // Set appropriate question based on time of day
    if (timeOfDay === "daytime") {
      setSelectedQuestion("Write...");
    } else if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    // Track voice input usage
    trackInteraction('voiceInputUsage');
    
    // Track text change from voice input
    trackTextChange(text, userAnswer);
    
    setUserAnswer(text);
  };

  const handleAnimationComplete = () => {
    setShowInput(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.shiftKey) {
        // Allow Ctrl+Enter or Shift+Enter for new line
        return;
      } else if (!isComposing) {
        // Plain Enter submits the form only when not composing (not using IME)
        e.preventDefault();
        if (userAnswer.trim() && !isLoading) {
          handleAnswerSubmit();
        }
      }
      // If composing, let the IME handle the Enter key normally
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

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
    
    // Track language switch
    trackInteraction('languageSwitches', {
      from: lang,
      to: newLang
    });
    
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  const handleFontToggle = () => {
    let newFont: "serif" | "sans" | "mono";
    if (currentFont === "serif") {
      newFont = "sans";
    } else if (currentFont === "sans") {
      newFont = "mono";
    } else {
      newFont = "serif";
    }
    
    // Track font switch
    trackInteraction('fontSwitches', {
      from: currentFont,
      to: newFont
    });
    
    setCurrentFont(newFont);
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

  const handleTimeOfDayClick = (period: "morning" | "daytime" | "evening") => {
    setTimeOfDay(period);

    // Set question based on selected time of day
    if (period === "daytime") {
      setSelectedQuestion("Write...");
    } else if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }

    // Reset conversation count when switching time periods
    setConversationCount(0);

    // Clear conversation history and reset input state
    setConversationHistory([]);
    setUserAnswer("");
    setShowInput(true);
  };

  return (
    <>

      {/* Yellow Rounded Box */}
      <motion.div
        className={`absolute flex flex-col justify-between  left-4 top-4 w-[640px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
        animate={{
          height: bounds.height ? bounds.height + 32 : undefined,
        }}
      >
        <div ref={contentRef}>
          {/* View Entries Link */}
          <Link href="/yellowbox/entries">
            <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-3 h-3 text-[#3B3109]" />
              <span className="text-[#3B3109] text-xs font-medium">
                {t("myEntries")}
              </span>
            </div>
          </Link>

          <div className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.h1
                key={timeOfDay}
                initial={{
                  x: -100,
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 0.8,
                }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{ x: 100, opacity: 0, filter: "blur(4px)", scale: 0.8 }}
                className="text-5xl font-bold leading-tight"
              >
                {timeOfDay === "morning" ? (
                  <>
                    <span className="italic font-semibold">Morning</span>{" "}
                    Reflection
                  </>
                ) : timeOfDay === "evening" ? (
                  <>
                    <span className="italic font-semibold">Evening</span>{" "}
                    Reflection
                  </>
                ) : (
                  <>
                    {t("titlePart1")}
                    <span className="italic font-semibold">
                      {t("titlePart2")}
                    </span>
                    {t("titlePart3")}
                  </>
                )}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

          {/* Conversation and Input Container */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-3">
            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-3">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`text-[#3B3109] text-base`}>
                    {message.type === "ai" ? (
                      index === conversationHistory.length - 1 ? (
                        <TextEffect
                          key={`ai-${index}`}
                          preset="fade-in-blur"
                          speedReveal={1.1}
                          speedSegment={0.3}
                          className="text-[#C04635] text-base "
                          onAnimationComplete={handleAnimationComplete}
                        >
                          {message.content}
                        </TextEffect>
                      ) : (
                        <div className="text-[#C04635] text-base ">
                          {message.content}
                        </div>
                      )
                    ) : (
                      <div className="whitespace-pre-wrap py-1">
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Input Section */}
            {showInput ? (
              <motion.div
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="space-y-4"
              >
                <motion.textarea
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  value={userAnswer}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    trackTextChange(newValue, previousAnswer.current);
                    previousAnswer.current = newValue;
                    setUserAnswer(newValue);
                  }}
                  onKeyDown={(e) => {
                    trackKeystroke(e.nativeEvent, userAnswer.length);
                    handleKeyDown(e);
                  }}
                  onKeyUp={(e) => {
                    trackKeystroke(e.nativeEvent, userAnswer.length);
                  }}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder={
                    conversationHistory.length === 0
                      ? selectedQuestion
                      : "Continue your thoughts..."
                  }
                  className="w-full py-1 h-32 rounded-lg bg-yellow-400 text-[#3B3109] text-base resize-none focus:outline-none"
                />

                <motion.div
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  className="flex gap-2 items-center h-10"
                >
                  <div onClick={() => trackInteraction('voiceButtonClicks')}>
                    <VoiceInput
                      onTranscriptionComplete={handleVoiceTranscription}
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="h-[40px]"></div>
            )}
          </div>

          {/* Bottom divider line */}
          <motion.div
            layout
            className="w-full h-px bg-[#E4BE10] my-2"
          ></motion.div>

          {/* Bottom Navigation */}
          <motion.div layout className="flex items-center gap-2">
            <Button
              onClick={handleAnswerSubmit}
              disabled={isLoading || !userAnswer.trim()}
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-[#3B3109] text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              variant="ghost"
              size="sm"
            >
              {isLoading ? (
                <TextShimmer className="font-medium text-base" duration={1.5}>
                  {t("thinking") as string}
                </TextShimmer>
              ) : (
                t("sparkButton")
              )}
            </Button>
            <Button
              onClick={resetDiary}
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-[#3B3109] text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1"
              variant="ghost"
              size="sm"
            >
              {t("doneButton")}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side Scroll Indicator */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
        {/* Scroll indicator dots */}
        <div className="flex flex-col items-center space-y-2 mb-4">
          <motion.div
            className={`size-1.5 rounded-full cursor-pointer ${
              timeOfDay === "morning" ? "bg-[#2AB186]" : "bg-black"
            }`}
            whileTap={{ scale: 1.5 }}
            transition={{ duration: 0.1 }}
            onClick={() => handleTimeOfDayClick("morning")}
          ></motion.div>
          <motion.div
            className={`w-1 h-12 rounded-full cursor-pointer ${
              timeOfDay === "daytime" ? "bg-[#2AB186]" : "bg-black"
            }`}
            whileTap={{ scaleX: 1.5 }}
            transition={{ duration: 0.1 }}
            onClick={() => handleTimeOfDayClick("daytime")}
          ></motion.div>
          <motion.div
            className={`size-1.5 rounded-full cursor-pointer ${
              timeOfDay === "evening" ? "bg-[#2AB186]" : "bg-black"
            }`}
            whileTap={{ scale: 1.5 }}
            transition={{ duration: 0.1 }}
            onClick={() => handleTimeOfDayClick("evening")}
          ></motion.div>
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
