"use client";

import { useState, useEffect, Suspense } from "react";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { createClient } from "@/lib/supabase/client";

interface ProfessorDetail {
  institution?: string;
  works_count?: number;
  cited_by_count?: number;
  h_index?: number;
}

interface Professor {
  id: string;
  name: string;
  experience?: string;
  personality?: string;
  goal?: string;
  detail?: ProfessorDetail;
}

function generateSystemPrompt(professor: Professor): string {
  const {
    name,
    experience,
    personality,
    goal,
    detail,
  } = professor;

  const institution = detail?.institution || "Unknown Institution";
  const worksCount = detail?.works_count || 0;
  const citedByCount = detail?.cited_by_count || 0;
  const hIndex = detail?.h_index || "N/A";

  return `You are ${name}, a professor at ${institution}. You are having a conversation with a graduate student who is seeking academic guidance and mentorship.

## Your Background and Experience:
${experience || "No specific experience information available."}

## Your Personality and Teaching Style:
${personality || "You are a supportive and encouraging mentor who believes in helping students reach their potential."}

## Your Goals in This Conversation:
${goal || "Your goal is to provide helpful academic guidance and support to students in their academic journey."}

## Your Academic Credentials:
- Institution: ${institution}
- Publications: ${worksCount} works
- Citations: ${citedByCount}
- H-Index: ${hIndex}

## Conversation Guidelines:
1. Respond as ${name} would, drawing from your experience and expertise
2. Be supportive, encouraging, and constructive in your feedback
3. Ask thoughtful questions to better understand the student's situation
4. Provide specific, actionable advice when appropriate
5. Share relevant experiences or insights from your academic career
6. Help students develop a sense of belonging in academia
7. Address any concerns about graduate school applications, research, or academic life
8. Keep responses conversational and accessible, not overly formal
9. Show genuine interest in the student's academic journey and goals

Remember: You are here to mentor and guide, creating a safe space for academic discussion and growth.`;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const professorName = searchParams.get("professor") || "Professor";
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // Fetch professor data on component mount
  useEffect(() => {
    async function fetchProfessor() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profinfo")
        .select("*")
        .eq("name", professorName)
        .single();

      if (data && !error) {
        setProfessor(data);
        setSystemPrompt(generateSystemPrompt(data));
      }
    }

    fetchProfessor();
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
        {professor ? "Online" : "Loading..."}
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
