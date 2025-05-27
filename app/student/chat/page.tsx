"use client";

import { useState, useEffect, Suspense } from "react";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { feifeiLi } from "@/lib/prompt/professors/feifei-li";
import { geoffreyCohen } from "@/lib/prompt/professors/geoffrey-cohen";
import { PromptComposer } from "@/lib/prompt/composer";

function ChatContent() {
  const searchParams = useSearchParams();
  const professorName = searchParams.get("professor") || "Fei-Fei Li";
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // Set system prompt based on selected professor with PromptComposer
  useEffect(() => {
    const composer = new PromptComposer();

    // Select professor configuration based on professor name
    let professorConfig;
    switch (professorName) {
      case "Geoffrey L. Cohen":
        professorConfig = geoffreyCohen;
        break;
      case "Fei-Fei Li":
      default:
        professorConfig = feifeiLi;
        break;
    }

    setSystemPrompt(composer.compose(professorConfig.modules));
  }, [professorName]);

  const { messages, status, append } = useChat({
    api: "/api/chat",
    body: {
      systemPrompt,
    },
    initialMessages: [
      {
        id: "initial",
        role: "assistant",
        content:
          "Hi! I'm here to help you with your academic questions. How can I assist you today?",
      },
    ],
  });

  // Convert useChat messages to WeChatChat format
  const chatMessages: Message[] = messages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
    timestamp: Date.now(),
  }));

  const handleSendMessage = (message: string) => {
    // Use append to add user message and trigger AI response
    append({
      role: "user",
      content: message,
    });
  };

  const modelInfo = (
    <div className="flex items-center gap-2">
      <User className="h-4 w-4" />
      <span>Chatting with {professorName}</span>
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
        Online
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <Link href="/student/cafe">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cafe
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-londrina font-bold text-indigo-600 dark:text-indigo-400">
              Chat with {professorName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Academic discussion and guidance
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 grow min-h-0 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
          <WeChatChat
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            loading={status === "streaming"}
            placeholder="Ask your professor anything..."
            modelInfo={modelInfo}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default function StudentChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
