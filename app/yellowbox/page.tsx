"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowBoxAuth } from "@/contexts/yellowbox-auth-context";
import { useYellowBoxUI } from "@/contexts/yellowbox-ui-context";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Button } from "@/components/ui/button";
import useMeasure from "react-use-measure";
import { motion } from "framer-motion";
import Link from "next/link";
import { useOptimizedYellowboxAnalytics } from "@/hooks/use-optimized-yellowbox-analytics";
import { useYellowBoxErrorHandler } from "@/hooks/use-yellowbox-error-handler";
import { useDiaryResponse, useGenerateSummary, useSaveEntries } from "@/hooks/use-yellowbox-queries";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ConversationView } from "@/components/yellowbox/ConversationView";
import { InputSection } from "@/components/yellowbox/InputSection";
import { SummaryDisplay } from "@/components/yellowbox/SummaryDisplay";

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


export default function Component() {
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [contentRef, bounds] = useMeasure();
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [, setEnhancedSummary] = useState<EnhancedSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const router = useRouter();
  const { userId } = useYellowBoxAuth();
  const { currentFont, isMac, getFontClass, timeOfDay } = useYellowBoxUI();
  const { lang, t, translations } = useYellowBoxI18n();

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

  const { handleError, createError } = useYellowBoxErrorHandler({ trackError });

  // React Query mutations
  const diaryResponseMutation = useDiaryResponse();
  const generateSummaryMutation = useGenerateSummary();
  const saveEntriesMutation = useSaveEntries();

  // Get questions from translations
  const questions = translations.questions;


  // Initialize with a question based on time of day
  useEffect(() => {
    // Set question based on time of day from context
    if (timeOfDay === "daytime") {
      setSelectedQuestion("Write...");
    } else if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }
  }, [questions, timeOfDay]);

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
      const data = await diaryResponseMutation.mutateAsync({
        selectedQuestion,
        userEntry: userMessage,
        timeOfDay,
        conversationCount,
      });

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
      handleError(error as Error);
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
      const result = await generateSummaryMutation.mutateAsync({
        conversationHistory,
        language: lang,
        selectedQuestion,
        timeOfDay,
      });
      
      return result.success
        ? { title: result.summary, enhanced: result.enhanced }
        : { title: "" };
    } catch (error) {
      console.error("Error generating summary:", error);
      return { title: "" };
    }
  }, [conversationHistory, lang, selectedQuestion, timeOfDay, generateSummaryMutation]);

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

        saveResult = await saveEntriesMutation.mutateAsync(entriesData);
      } catch (error) {
        handleError(error as Error);
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
    createError,
    handleError,
    saveEntriesMutation,
  ]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    onCtrlEnter: resetDiary,
    conversationHistoryLength: conversationHistory.length,
    isGeneratingSummary,
  });

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

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);



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
            <SummaryDisplay
              showSummary={showSummary}
              isGeneratingSummary={isGeneratingSummary}
              summaryTitle={summaryTitle}
              timeOfDay={timeOfDay}
              t={t}
            />
          </div>

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

          {/* Conversation and Input Container */}
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto space-y-3">
            {/* Conversation History */}
            <ConversationView
              conversationHistory={conversationHistory}
              onAnimationComplete={handleAnimationComplete}
            />

            {/* Input Section */}
            {showInput ? (
              <InputSection
                userAnswer={userAnswer}
                conversationHistory={conversationHistory}
                selectedQuestion={selectedQuestion}
                isLoading={isLoading}
                isComposing={isComposing}
                onAnswerChange={setUserAnswer}
                onKeyDown={handleKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                onVoiceTranscription={handleVoiceTranscription}
                trackKeystroke={trackKeystroke}
                trackTextChange={trackTextChange}
              />
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
