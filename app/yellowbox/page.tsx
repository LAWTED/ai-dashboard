"use client";

import { LogOut, ArrowLeft, Languages } from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceInput } from "@/components/voice-input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useYellowboxTranslation } from "@/lib/i18n/yellowbox";

type DiaryStep = "answer" | "response";

export default function Component() {
  const [currentStep, setCurrentStep] = useState<DiaryStep>("answer");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
      />

      {/* Yellow Rounded Box */}
      <div className="absolute left-4 top-4 w-[520px] bg-yellow-400 rounded-2xl p-4 font-mono">
        {/* New entry indicator */}
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft className="w-3 h-3 text-black" />
          <span className="text-[#3B3109] text-xs font-medium">
            {t("newEntry")}
          </span>
        </div>

        <h1 className="text-5xl font-bold px-2 text-[#3B3109] mb-1 leading-tight font-['IBM_Plex_Serif']">
          {t("titlePart1")}
          <span className="italic font-semibold font-['IBM_Plex_Serif']">
            {t("titlePart2")}
          </span>
          {t("titlePart3")}
        </h1>

        {/* Top divider line */}
        <div className="w-full h-px bg-[#E4BE10] mb-2"></div>

        <div className="space-y-6">
          {/* Answer Input Step */}
          {currentStep === "answer" && (
            <div className="space-y-4">
              <div className="text-black  text-sm mb-2">{}</div>
              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={selectedQuestion}
                  className="w-full h-96 p-1 rounded-lg font-['IBM_Plex_Serif'] bg-yellow-400 text-black text-sm resize-none focus:outline-none  "
                />
              </div>
              <div className="flex gap-2 items-center h-10">
                <VoiceInput
                  onTranscriptionComplete={handleVoiceTranscription}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* AI Response Step */}
          {currentStep === "response" && (
            <div className="space-y-4">
              <div className="text-black text-sm mb-2">{selectedQuestion}</div>
              <div className="text-black text-sm mb-3">{userAnswer}</div>
              <div className="text-black text-sm whitespace-pre-wrap">
                {aiResponse}
              </div>
              <button
                onClick={resetDiary}
                className="px-4 py-2 rounded-lg bg-transparent text-black text-sm"
                style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
              >
                {t("newEntryButton")}
              </button>
            </div>
          )}
        </div>

        {/* Bottom divider line */}
        <div className="w-full h-px bg-[#E4BE10] my-2"></div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleAnswerSubmit}
            disabled={isLoading || !userAnswer.trim()}
            className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-black text-xs font-medium cursor-pointer hover:bg-yellow-300 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("thinking") : t("sparkButton")}
          </button>
          <div className="flex items-center justify-center bg-yellow-400 border border-[#E4BE10] rounded-md px-4 py-2 text-black text-xs font-medium cursor-pointer hover:bg-yellow-300 w-full">
            {t("doneButton")}
          </div>
        </div>
      </div>

      {/* Right Side Scroll Indicator */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4">
        {/* Scroll indicator dots */}
        <div className="flex flex-col items-center space-y-2 mb-4">
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <div className="w-1 h-12 bg-black rounded-full"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={handleLanguageToggle}
          className="text-black hover:opacity-70 transition-opacity mb-3"
          title={getLanguageTooltip()}
        >
          <Languages className="w-5 h-5" />
        </button>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="text-black hover:opacity-70 transition-opacity"
          title={t("logout") as string}
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
