"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowBoxAuth } from "@/contexts/yellowbox-auth-context";
import { useYellowBoxUI } from "@/contexts/yellowbox-ui-context";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { EnhancedLoading } from "@/components/ui/enhanced-loading";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { useOptimizedYellowboxAnalytics } from "@/hooks/use-optimized-yellowbox-analytics";
import { useYellowBoxErrorHandler } from "@/hooks/use-yellowbox-error-handler";
import {
  useDiaryResponse,
  useGenerateSummary,
  useSaveEntries,
} from "@/hooks/use-yellowbox-queries";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ConversationView } from "@/components/yellowbox/ConversationView";
import { InputSection } from "@/components/yellowbox/InputSection";
import { SummaryDisplay } from "@/components/yellowbox/SummaryDisplay";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
  images?: string[];
};

type EnhancedSummary = {
  title: string;
  tags: string[];
  values?: string[];
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
  const [loadingStage, setLoadingStage] = useState<
    "reading" | "uploading" | "thinking" | "responding"
  >("reading");
  const [isComposing, setIsComposing] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const [showInput, setShowInput] = useState(true);
  const [summaryTitle, setSummaryTitle] = useState<string>("");
  const [enhancedSummary, setEnhancedSummary] = useState<EnhancedSummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [previousInput, setPreviousInput] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const router = useRouter();
  const { userId } = useYellowBoxAuth();
  const { currentFont, isMac, timeOfDay } = useYellowBoxUI();
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

  const { handleError } = useYellowBoxErrorHandler({ trackError });

  // React Query mutations
  const diaryResponseMutation = useDiaryResponse();
  const generateSummaryMutation = useGenerateSummary();
  const saveEntriesMutation = useSaveEntries();

  // Get questions from translations
  const questions = translations.questions;

  // Get window size for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateWindowSize();
    window.addEventListener("resize", updateWindowSize);
    return () => window.removeEventListener("resize", updateWindowSize);
  }, []);

  // Auto-save draft functionality
  useEffect(() => {
    const savedDraft = localStorage.getItem("yellowbox-draft");
    if (savedDraft && conversationHistory.length === 0) {
      setUserAnswer(savedDraft);
    }
  }, [conversationHistory.length]);

  useEffect(() => {
    const saveDraft = () => {
      if (userAnswer.trim()) {
        localStorage.setItem("yellowbox-draft", userAnswer);
      } else {
        localStorage.removeItem("yellowbox-draft");
      }
    };

    const timer = setTimeout(saveDraft, 2000); // Save after 2 seconds of inactivity
    return () => clearTimeout(timer);
  }, [userAnswer]);

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

    setIsLoading(true);
    setLoadingStage("reading");

    let finalImages: string[] | undefined = undefined;

    // Upload images to Supabase if there are any selected images
    if (selectedImages.length > 0) {
      setLoadingStage("uploading");
      try {
        const { uploadDataUrlsToSupabase } = await import(
          "@/lib/storage/image-upload"
        );
        const uploadResults = await uploadDataUrlsToSupabase(selectedImages);

        // Filter successful uploads and maintain order
        const successfulUploads: string[] = [];
        uploadResults.forEach((result, index) => {
          if (result.success && result.url) {
            successfulUploads[index] = result.url;
          } else {
            // Keep the data URL if upload failed to maintain layoutId consistency
            successfulUploads[index] = selectedImages[index];
          }
        });

        if (successfulUploads.length > 0) {
          finalImages = successfulUploads;
        } else {
          // If no uploads succeeded, still continue but log the issue
          console.warn("No images were successfully uploaded");
        }
      } catch (error) {
        console.error("Error uploading images:", error);
        // Continue without images if upload fails
      }
    }

    // Add user message to conversation history with final image URLs
    setConversationHistory((prev) => [
      ...prev,
      { type: "user", content: userMessage, images: finalImages },
    ]);
    setUserAnswer("");
    setSelectedImages([]);

    // Simulate reading stage
    setTimeout(() => setLoadingStage("thinking"), 500);
    setTimeout(() => setLoadingStage("responding"), 1500);

    try {
      const data = await diaryResponseMutation.mutateAsync({
        selectedQuestion,
        userEntry: userMessage,
        timeOfDay,
        conversationCount,
        images: finalImages,
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
  }, [
    conversationHistory,
    lang,
    selectedQuestion,
    timeOfDay,
    generateSummaryMutation,
  ]);

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

      // Show confetti for completed entry
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
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
    handleError,
    saveEntriesMutation,
  ]);

  // Keyboard shortcut handlers
  const handleCtrlN = useCallback(() => {
    // New conversation - reset everything
    if (
      window.confirm(
        "Start a new conversation? Any unsaved changes will be lost."
      )
    ) {
      setUserAnswer("");
      setConversationHistory([]);
      setShowInput(true);
      setShowSummary(false);
      setConversationCount(0);
      setSummaryTitle("");
      localStorage.removeItem("yellowbox-draft");

      // Set new random question
      if (timeOfDay === "daytime") {
        setSelectedQuestion("Write...");
      } else if (questions.length > 0) {
        const randomQuestion =
          questions[Math.floor(Math.random() * questions.length)];
        setSelectedQuestion(randomQuestion);
      }
    }
  }, [timeOfDay, questions]);

  const handleCtrlS = useCallback(() => {
    // Save draft manually and show toast
    if (userAnswer.trim()) {
      localStorage.setItem("yellowbox-draft", userAnswer);
      toast.success("Draft saved!");
    }
  }, [userAnswer]);

  const handleEscape = useCallback(() => {
    // Clear current input
    setPreviousInput(userAnswer);
    setUserAnswer("");
    localStorage.removeItem("yellowbox-draft");
  }, [userAnswer]);

  const handleCtrlZ = useCallback(() => {
    // Undo last input
    if (previousInput) {
      setUserAnswer(previousInput);
      setPreviousInput("");
    }
  }, [previousInput]);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    onCtrlEnter: resetDiary,
    onCtrlN: handleCtrlN,
    onCtrlS: handleCtrlS,
    onEscape: handleEscape,
    onCtrlZ: handleCtrlZ,
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
      {/* Confetti Effect */}
      {showConfetti && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={["#FFC107", "#FFB300", "#FFA000", "#FF8F00", "#FF6F00"]}
          gravity={0.3}
        />
      )}

      {/* Page Content */}
      {/* View Entries Link */}
      <Link href="/yellowbox/entries">
        <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-70 transition-opacity">
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.3,
            }}
          >
            <ArrowLeft className="w-3 h-3 text-[#3B3109]" />
          </motion.div>
          <motion.div
            layoutId="my-entries-title"
            className="text-[#3B3109] text-sm font-medium"
          >
            {t("myEntries")}
          </motion.div>
        </div>
      </Link>

      <div className="text-3xl md:text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight overflow-hidden">
        <SummaryDisplay
          showSummary={showSummary}
          isGeneratingSummary={isGeneratingSummary}
          summaryTitle={summaryTitle}
          timeOfDay={timeOfDay}
          t={t as (key: string) => string}
          valueTags={enhancedSummary?.values || []}
        />
      </div>

      {/* Top divider line */}
      <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

      {/* Conversation and Input Container */}
      <div className="space-y-3">
        {/* Conversation History with scroll */}
        <div className="max-h-[calc(100vh-350px)] md:max-h-[calc(100vh-400px)] overflow-y-auto">
          <ConversationView
            conversationHistory={conversationHistory}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {/* Input Section - fixed position */}
        {showInput ? (
          <InputSection
            userAnswer={userAnswer}
            conversationHistory={conversationHistory}
            selectedQuestion={selectedQuestion}
            isLoading={isLoading}
            selectedImages={selectedImages}
            onAnswerChange={setUserAnswer}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onVoiceTranscription={handleVoiceTranscription}
            onImageSelect={setSelectedImages}
            trackKeystroke={trackKeystroke}
            trackTextChange={trackTextChange}
          />
        ) : (
          <div className="h-[40px]"></div>
        )}
      </div>

      {/* Bottom divider line */}
      <motion.div layout className="w-full h-px bg-[#E4BE10] my-2"></motion.div>

      {/* Bottom Navigation */}
      <motion.div
        layout
        className="flex items-center gap-2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.4, // Start when height animation is nearly finished
          layout: {
            delay: 0,
          },
        }}
      >
        <Button
          onClick={handleAnswerSubmit}
          disabled={isLoading || !userAnswer.trim()}
          className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-2 md:px-4 py-2 text-[#3B3109] text-sm md:text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed group relative"
          variant="ghost"
          size="sm"
          title={`${t("sparkButton")} (Enter)`}
        >
          {isLoading ? (
            <EnhancedLoading stage={loadingStage} className="text-[#3B3109]" />
          ) : (
            <>
              <span>{t("sparkButton")}</span>
              <span className="ml-1 md:ml-2 text-xs opacity-60 group-hover:opacity-80 transition-opacity hidden sm:inline">
                ↵
              </span>
            </>
          )}
        </Button>
        <Button
          onClick={resetDiary}
          className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-2 md:px-4 py-2 text-[#3B3109] text-sm md:text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 group relative"
          variant="ghost"
          size="sm"
          title={`${t("doneButton")} (${isMac ? "Cmd" : "Ctrl"}+Enter)`}
        >
          <span>{t("doneButton")}</span>
          <span className="ml-1 md:ml-2 text-xs opacity-60 group-hover:opacity-80 transition-opacity hidden sm:inline">
            {isMac ? "⌘" : "Ctrl"}+↵
          </span>
        </Button>
      </motion.div>
    </>
  );
}
