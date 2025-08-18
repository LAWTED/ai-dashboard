"use client";

import React from "react";
import { TextEffect } from "@/components/ui/text-effect";
import { motion } from "framer-motion";
import Image from "next/image";

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
  images?: string[];
  hasValueMirror?: boolean; // New field to indicate if AI message includes value awareness
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