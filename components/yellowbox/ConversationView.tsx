"use client";

import React from "react";
import { TextEffect } from "@/components/ui/text-effect";
import { motion } from "framer-motion";
import Image from "next/image";
import { PromptStyleSelector } from "./PromptStyleSelector";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
  images?: string[];
  hasValueMirror?: boolean; // New field to indicate if AI message includes value awareness
};

interface ConversationViewProps {
  conversationHistory: ConversationMessage[];
  onAnimationComplete: () => void;
  onRegenerateLastMessage?: (promptId: string) => Promise<void>;
  onRegenerateWithCustomPrompt?: (customPrompt: string) => Promise<void>;
  isRegenerating?: boolean;
  timeOfDay?: 'morning' | 'daytime' | 'evening';
}

export function ConversationView({
  conversationHistory,
  onAnimationComplete,
  onRegenerateLastMessage,
  onRegenerateWithCustomPrompt,
  isRegenerating = false,
  timeOfDay = 'daytime',
}: ConversationViewProps) {
  if (conversationHistory.length === 0) {
    return null;
  }

  const isLastAIMessage = (index: number) => {
    // Check if this is the last AI message in the conversation
    if (conversationHistory[index].type !== "ai") {
      return false;
    }

    for (let i = conversationHistory.length - 1; i > index; i--) {
      if (conversationHistory[i].type === "ai") {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="space-y-3">
      {conversationHistory.map((message, index) => (
        <div key={index} className="text-[#3B3109] text-base">
          {message.type === "ai" ? (
            <div className="relative">
              {/* Value Mirror Indicator */}
              {message.hasValueMirror && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="absolute -left-6 top-0 w-2 h-2 bg-[#C04635] rounded-full opacity-60"
                  title="Value-aware response"
                />
              )}

              {index === conversationHistory.length - 1 ? (
                <div>
                  <TextEffect
                    key={`ai-${index}`}
                    preset="fade-in-blur"
                    speedReveal={1.1}
                    speedSegment={0.3}
                    className="text-[#C04635] text-base break-words"
                    onAnimationComplete={onAnimationComplete}
                  >
                    {message.content}
                  </TextEffect>

                  {/* Prompt Style Selector - show after animation completes */}
                  {onRegenerateLastMessage && onRegenerateWithCustomPrompt && isLastAIMessage(index) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.5, duration: 0.3 }}
                      className="mt-3 flex justify-start"
                    >
                      <PromptStyleSelector
                        onRegenerateWithPrompt={onRegenerateLastMessage}
                        onRegenerateWithCustomPrompt={onRegenerateWithCustomPrompt}
                        isGenerating={isRegenerating}
                        timeOfDay={timeOfDay}
                      />
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="text-[#C04635] text-base break-words">
                  {message.content}
                </div>
              )}
            </div>
          ) : (
            <div className="py-1">
              {/* User images */}
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.images.map((imageUrl, imgIndex) => {
                    // Generate the same layoutId as in InputSection based on image content
                    const imageHash = btoa(imageUrl.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
                    const layoutId = `image-${imageHash}-${imgIndex}`;

                    return (
                      <motion.div key={imgIndex} layoutId={layoutId}>
                        <Image
                          src={imageUrl}
                          alt={`User uploaded image ${imgIndex + 1}`}
                          width={192}
                          height={192}
                          className="max-w-48 max-h-48 object-cover rounded-lg border-2 border-yellow-600"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
              {/* User text */}
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}