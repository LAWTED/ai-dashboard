"use client";

import { LogOut, ArrowLeft, Languages, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceInput } from "@/components/voice-input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";
import { TextEffect } from "@/components/ui/text-effect";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Button } from "@/components/ui/button";
import useMeasure from "react-use-measure";
import { motion } from "framer-motion";

type DiaryStep = "answer" | "response";

export default function Component() {
  const [currentStep, setCurrentStep] = useState<DiaryStep>("answer");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentFont, setCurrentFont] = useState<"ibm" | "geist">("ibm");
  const [isComposing, setIsComposing] = useState(false);
  const [contentRef, bounds] = useMeasure();
  const router = useRouter();
  const supabase = createClient();
  const { t, translations, lang, setLang } = useYellowboxTranslation();

  // Get questions from translations
  const questions = translations.questions;

  // Initialize with a random question
  useEffect(() => {
    if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }
  }, [questions]);

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedQuestion,
          userEntry: userAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setAiResponse(data.response);
      setCurrentStep("response");
    } catch (error) {
      console.error("Error:", error);
      setAiResponse(t("somethingWentWrong") as string);
      setCurrentStep("response");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDiary = () => {
    setCurrentStep("answer");
    setUserAnswer("");
    setAiResponse("");
    // Get a new random question
    if (questions.length > 0) {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setSelectedQuestion(randomQuestion);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setUserAnswer(text);
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
    setLang(newLang);
  };

  const getLanguageTooltip = () => {
    return lang === "zh" ? "Switch to English" : "切换到中文";
  };

  const handleFontToggle = () => {
    setCurrentFont(currentFont === "ibm" ? "geist" : "ibm");
  };

  const getFontClass = () => {
    return currentFont === "ibm" ? "font-['IBM_Plex_Serif']" : "font-sans";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Yellow Rounded Box */}
      <motion.div
        className={`absolute left-4 top-4 w-[540px] bg-yellow-400 rounded-2xl p-4 ${getFontClass()}`}
        animate={{ height: bounds.height ? bounds.height + 32 : undefined }}
      >
        <div ref={contentRef}>
          {/* New entry indicator */}
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft className="w-3 h-3 text-black" />
            <span className="text-[#3B3109] text-xs font-medium">
              {t("newEntry")}
            </span>
          </div>

          <h1 className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight">
            {t("titlePart1")}
            <span className="italic font-semibold">{t("titlePart2")}</span>
            {t("titlePart3")}
          </h1>

          {/* Top divider line */}
          <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

          <div className="space-y-6">
            {/* Answer Input Step */}
            {currentStep === "answer" && (
              <div className="space-y-4">
                <motion.textarea
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  placeholder={selectedQuestion}
                  className="w-full h-96 p-1 rounded-lg bg-yellow-400 text-black text-base resize-none focus:outline-none"
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
              </div>
            )}

            {/* AI Response Step */}
            {currentStep === "response" && (
              <div className="space-y-4">
                <div className="text-black text-base mb-3">{userAnswer}</div>
                <TextEffect
                  // per="word"
                  preset="fade-in-blur"
                  speedReveal={1.1}
                  speedSegment={0.3}
                  className="text-black text-base whitespace-pre-wrap"
                >
                  {aiResponse}
                </TextEffect>
              </div>
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
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-black text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={currentStep === "response" ? resetDiary : undefined}
              className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-black text-base font-medium cursor-pointer hover:bg-yellow-300 flex-1"
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
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-12 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>

        {/* Font Switcher */}
        <Button
          onClick={handleFontToggle}
          className="text-black hover:opacity-70 hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={`Switch to ${
            currentFont === "ibm" ? "Sans" : "IBM Plex Serif"
          } font`}
          variant="ghost"
        >
          <Type className="!w-5 !h-5" />
        </Button>

        {/* Language Switcher */}
        <Button
          onClick={handleLanguageToggle}
          className="text-black hover:opacity-70  hover:bg-transparent transition-opacity mb-3 p-0 h-auto bg-transparent border-none"
          title={getLanguageTooltip()}
          variant="ghost"
        >
          <Languages className="!w-5 !h-5" />
        </Button>

        {/* Logout button */}
        <Button
          onClick={handleLogout}
          className="text-black hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
          title={t("logout") as string}
          variant="ghost"
        >
          <LogOut className="!w-5 !h-5" />
        </Button>
      </div>
    </div>
  );
}
