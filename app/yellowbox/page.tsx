"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { VoiceInput } from "@/components/voice-input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowBoxContext } from "@/contexts/yellowbox-context";
import { TextEffect } from "@/components/ui/text-effect";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Button } from "@/components/ui/button";
import useMeasure from "react-use-measure";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useOptimizedYellowboxAnalytics } from "@/hooks/use-optimized-yellowbox-analytics";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
};

type EnhancedSummary = {
  title: string;
  tags: string[];
  emotion: {
    primary: string;
    intensity: "low" | "medium" | "high";
    confidence: number;
  };
  themes: string[];
};

type SummaryAPIResponse = {
  success: boolean;
  summary: string; // backward compatibility
  enhanced: EnhancedSummary;
  language: string;
};

export default function Component() {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "daytime" | "evening">(
    "daytime"
  );
  const [conversationCount, setConversationCount] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [contentRef, bounds] = useMeasure();
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [, setEnhancedSummary] = useState<EnhancedSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const router = useRouter();
  const { userId, currentFont, isMac, lang, t, translations, getFontClass } = useYellowBoxContext();
  const previousAnswer = useRef<string>("");

  // Initialize analytics with session ID
  const sessionId = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}`;
  const {
    analytics,
    trackKeystroke,
    trackTextChange,
    trackVoiceUsage,
    trackError,
    forceEndCurrentSegment,
    finalizeSession,
  } = useOptimizedYellowboxAnalytics(sessionId, userId);

  // Get questions from translations
  const questions = translations.questions;


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

    // Force end current writing segment before submission
    forceEndCurrentSegment(userMessage);

    // Add user message to conversation history
    setConversationHistory((prev) => [
      ...prev,
      { type: "user", content: userMessage },
    ]);
    setUserAnswer("");
    setIsLoading(true);

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

      if (!response.ok) {
        trackError();
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
      trackError();
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

  const generateSummary = useCallback(async (): Promise<{
    title: string;
    enhanced?: EnhancedSummary;
  }> => {
    if (conversationHistory.length === 0) {
      return { title: "" };
    }

    try {
      const response = await fetch("/api/yellowbox/generate-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationHistory,
          language: lang,
          selectedQuestion,
          timeOfDay,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const result: SummaryAPIResponse = await response.json();
      return result.success
        ? { title: result.summary, enhanced: result.enhanced }
        : { title: "" };
    } catch (error) {
      console.error("Error generating summary:", error);
      return { title: "" };
    }
  }, [conversationHistory, lang, selectedQuestion, timeOfDay]);

  const resetDiary = useCallback(async () => {
    // Only generate summary if there's conversation history
    if (conversationHistory.length === 0) {
      setUserAnswer("");
      setConversationHistory([]);
      setShowInput(true);
      setConversationCount(0);

      if (timeOfDay === "daytime") {
        setSelectedQuestion("Write...");
      } else if (questions.length > 0) {
        const randomQuestion =
          questions[Math.floor(Math.random() * questions.length)];
        setSelectedQuestion(randomQuestion);
      }
      return;
    }

    // Step 1: Generate AI summary and show it
    setIsGeneratingSummary(true);
    setShowSummary(true);
    setShowInput(false);

    const summaryResult = await generateSummary();

    if (summaryResult.title) {
      setIsGeneratingSummary(false);
      setSummaryTitle(summaryResult.title);
      setEnhancedSummary(summaryResult.enhanced || null);
    } else {
      setIsGeneratingSummary(false);
      setSummaryTitle(t("summaryError") as string);
      setEnhancedSummary(null);
    }

    // Step 2: Save entries with enhanced summary inline
    let saveResult: { success: boolean; error?: string } = { success: true };
    if (conversationHistory.length > 0) {
      finalizeSession();

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
            aiSummary: summaryResult.title,
            enhancedSummary: summaryResult.enhanced,
          },
          analytics: analytics,
        };

        const response = await fetch("/api/yellowbox/entries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entriesData),
        });

        if (!response.ok) {
          trackError();
          throw new Error("Failed to save entries");
        }

        const result = await response.json();
        saveResult = result;
      } catch (error) {
        console.error("Error saving entries:", error);
        trackError();
        saveResult = { success: false, error: String(error) };
      }
    }

    if (saveResult.success) {
      toast.success(
        (t("entriesSaved") as string) || "Entries saved successfully!"
      );
    } else {
      toast.error((t("saveError") as string) || "Failed to save entries");
    }

    // Step 3: Wait 2 seconds then navigate to entries page
    setTimeout(() => {
      router.push("/yellowbox/entries");
    }, 2000);
  }, [
    conversationHistory,
    generateSummary,
    t,
    timeOfDay,
    questions,
    router,
    finalizeSession,
    selectedQuestion,
    conversationCount,
    sessionId,
    currentFont,
    lang,
    analytics,
    trackError,
  ]);

  // Global keyboard shortcut handler (defined after resetDiary)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+Enter triggers Done functionality globally
        e.preventDefault();
        if (conversationHistory.length > 0 && !isGeneratingSummary) {
          resetDiary();
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleGlobalKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [conversationHistory.length, isGeneratingSummary, resetDiary]);

  const handleVoiceTranscription = (text: string) => {
    // Track voice input usage
    trackVoiceUsage();

    // Track text change from voice input
    trackTextChange(text, userAnswer);

    setUserAnswer(text);
  };

  const handleAnimationComplete = () => {
    setShowInput(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+Enter triggers Done functionality
        e.preventDefault();
        if (conversationHistory.length > 0 && !isGeneratingSummary) {
          resetDiary();
        }
        return;
      } else if (e.ctrlKey || e.shiftKey) {
        // Allow Ctrl+Enter (handled above) or Shift+Enter for new line
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
                key={showSummary ? `summary-${summaryTitle}` : timeOfDay}
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
                {showSummary ? (
                  <span className="text-[#C04635] italic">
                    {isGeneratingSummary
                      ? t("generatingSummary")
                      : summaryTitle}
                  </span>
                ) : timeOfDay === "morning" ? (
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
                  <VoiceInput
                    onTranscriptionComplete={handleVoiceTranscription}
                    disabled={isLoading}
                  />
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
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-[#3B3109] text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed group relative"
              variant="ghost"
              size="sm"
              title={`${t("sparkButton")} (Enter)`}
            >
              {isLoading ? (
                <>
                  <TextShimmer className="font-medium text-base" duration={1.5}>
                    {t("thinking") as string}
                  </TextShimmer>
                </>
              ) : (
                <>
                  <span>{t("sparkButton")}</span>
                  <span className="ml-2 text-xs opacity-60 group-hover:opacity-80 transition-opacity">
                    ↵
                  </span>
                </>
              )}
            </Button>
            <Button
              onClick={resetDiary}
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-[#3B3109] text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 group relative"
              variant="ghost"
              size="sm"
              title={`${t("doneButton")} (${isMac ? "Cmd" : "Ctrl"}+Enter)`}
            >
              <span>{t("doneButton")}</span>
              <span className="ml-2 text-xs opacity-60 group-hover:opacity-80 transition-opacity">
                {isMac ? "⌘" : "Ctrl"}+↵
              </span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

    </>
  );
}
