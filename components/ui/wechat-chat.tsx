"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface WeChatChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  modelInfo?: React.ReactNode;
}

export function WeChatChat({
  messages,
  onSendMessage,
  loading = false,
  disabled = false,
  className = "",
  placeholder = "Type a message...",
  modelInfo = null,
}: WeChatChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || disabled || loading) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  return (
    <div className={`flex flex-col w-full h-full ${className}`}>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 border rounded-lg bg-[#ebebeb] mb-2 sm:mb-4">
        {/* Container message scroll area */}
        <div className="flex flex-col w-full">
          {/* Optional model info area */}
          {modelInfo && (
            <div className="bg-gray-100 rounded-lg p-2 mb-3 text-xs text-gray-700 flex items-center justify-center">
              {modelInfo}
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 p-2 sm:p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-[#95ec69] text-black self-end max-w-[85%]"
                  : "bg-white border border-gray-200 self-start max-w-[85%]"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="flex-1 bg-white text-sm sm:text-base h-9 sm:h-10"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || loading}
          className="bg-[#07c160] hover:bg-[#06ad56] h-9 sm:h-10 px-3 sm:px-4"
          size="sm"
        >
          {loading ? "发送中..." : "发送"}
        </Button>
      </div>
    </div>
  );
}
