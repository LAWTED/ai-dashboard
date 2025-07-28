"use client";

import { motion } from "framer-motion";
import { VoiceInput } from "@/components/voice-input";
import React from "react";

interface InputSectionProps {
  userAnswer: string;
  conversationHistory: Array<{ type: string; content: string }>;
  selectedQuestion: string;
  isLoading: boolean;
  onAnswerChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onVoiceTranscription: (text: string) => void;
  trackKeystroke: (event: KeyboardEvent, textLength: number) => void;
  trackTextChange: (newValue: string, previousValue: string) => void;
}

export function InputSection({
  userAnswer,
  conversationHistory,
  selectedQuestion,
  isLoading,
  onAnswerChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onVoiceTranscription,
  trackKeystroke,
  trackTextChange,
}: InputSectionProps) {
  const previousAnswer = React.useRef<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    trackTextChange(newValue, previousAnswer.current);
    previousAnswer.current = newValue;
    onAnswerChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    trackKeystroke(e.nativeEvent, userAnswer.length);
    onKeyDown(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    trackKeystroke(e.nativeEvent, userAnswer.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-4"
    >
      <motion.textarea
        initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        value={userAnswer}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
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
          onTranscriptionComplete={onVoiceTranscription}
          disabled={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}