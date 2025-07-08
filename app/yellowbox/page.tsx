"use client";

import { Youtube, Apple, AirplayIcon as Spotify } from "lucide-react";
import { useState, useEffect } from "react";
import { VoiceInput } from "@/components/voice-input";
import { motion, AnimatePresence } from "framer-motion";

type DiaryStep = "answer" | "response";

const questions = [
  "🌹 What's one win, small or big, you had today?",
  "🌹 What's one positive thing that happened today?",
  "🌹 What was the highlight of your day?",
];

export default function Component() {
  const [currentStep, setCurrentStep] = useState<DiaryStep>("answer");
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with a random question
  useEffect(() => {
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setSelectedQuestion(randomQuestion);
  }, []);

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
      setAiResponse("Sorry, something went wrong. Please try again.");
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
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setSelectedQuestion(randomQuestion);
  };

  const handleVoiceTranscription = (text: string) => {
    setUserAnswer(text);
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://freight.cargo.site/w/2689/h/2000/q/75/i/H2267809419218707714982209727068/Forest-Visitation.jpg')",
        }}
      />

      {/* Yellow Rounded Box */}
      <div className="absolute left-4 top-4 w-[460px] bg-yellow-400 rounded-2xl p-8 font-mono">
        <h1 className="text-7xl font-black text-black mb-8 leading-none">
          {getCurrentDate()}
        </h1>

        <div className="space-y-6">
          {/* Answer Input Step */}
          {currentStep === "answer" && (
            <div className="space-y-4">
              <div className="text-black  text-sm mb-2">{selectedQuestion}</div>
              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full h-32 p-3 rounded-lg bg-yellow-400 text-black text-sm resize-none focus:outline-none"
                  style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                />
              </div>
              <div className="flex gap-2 items-center h-10">
                <VoiceInput
                  onTranscriptionComplete={handleVoiceTranscription}
                  disabled={isLoading}
                />
                <AnimatePresence>
                  {userAnswer.trim() && (
                    <motion.button
                      initial={{
                        opacity: 0,
                        filter: "blur(4px)",
                        x: -20,
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        filter: "blur(4px)",
                        x: -20,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      onClick={handleAnswerSubmit}
                      disabled={isLoading}
                      className="px-4 rounded-lg bg-transparent text-black text-sm disabled:opacity-50 disabled:cursor-not-allowed h-8"
                      style={{ border: "1px solid rgba(0, 0, 0, 0.15)" }}
                    >
                      {isLoading ? "Thinking..." : "Send"}
                    </motion.button>
                  )}
                </AnimatePresence>
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
                New Entry
              </button>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-12 pt-4">
          <div className="text-black  text-sm cursor-pointer hover:underline">
            Diary
          </div>
          <div className="text-black  text-sm cursor-pointer hover:underline">
            Reflect
          </div>
        </div>
      </div>

      {/* Right Side Social Icons */}
      <div className="absolute right-0 bottom-0 w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-4 space-y-3">
        <Youtube className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
        <Apple className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
        <Spotify className="w-5 h-5 text-black cursor-pointer hover:opacity-70" />
      </div>
    </div>
  );
}
