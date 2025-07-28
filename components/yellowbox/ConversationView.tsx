"use client";

import { TextEffect } from "@/components/ui/text-effect";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
};

interface ConversationViewProps {
  conversationHistory: ConversationMessage[];
  onAnimationComplete: () => void;
}

export function ConversationView({
  conversationHistory,
  onAnimationComplete,
}: ConversationViewProps) {
  if (conversationHistory.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {conversationHistory.map((message, index) => (
        <div key={index} className="text-[#3B3109] text-base">
          {message.type === "ai" ? (
            index === conversationHistory.length - 1 ? (
              <TextEffect
                key={`ai-${index}`}
                preset="fade-in-blur"
                speedReveal={1.1}
                speedSegment={0.3}
                className="text-[#C04635] text-base"
                onAnimationComplete={onAnimationComplete}
              >
                {message.content}
              </TextEffect>
            ) : (
              <div className="text-[#C04635] text-base">
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
  );
}