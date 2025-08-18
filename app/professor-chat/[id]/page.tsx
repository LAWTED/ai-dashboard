"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Building, BookOpen, GraduationCap, Trash2 } from "lucide-react";
import Link from "next/link";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";

type Professor = {
  id: string;
  name: string;
  institution: string;
  country_code?: string;
  works_count: number;
  cited_by_count: number;
  h_index?: number;
  topics?: string[];
  fullDetails?: Record<string, unknown>;
};

type UserQueue = {
  messages: string[];
  lastMessageTime: number;
};

export default function ProfessorChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [professorId, setProfessorId] = useState<string>("");
  const [userQueue, setUserQueue] = useState<UserQueue>({
    messages: [],
    lastMessageTime: 0,
  });
  const [processingQueue, setProcessingQueue] = useState(false);

  // Typing animation speed (milliseconds per character)
  const TYPING_SPEED = 20;
  // Queue waiting time (milliseconds)
  const QUEUE_WAITING_TIME = 1500;

  // Display assistant response with typing animation (similar to Alice)
  const displayAssistantResponse = async (response: string) => {
    setTyping(true);

    // Check if response contains backslash separators
    if (response.includes("\\")) {
      // Split by backslash and filter out empty parts
      const parts = response
        .split("\\")
        .map((part) => part.trim())
        .filter(Boolean);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Calculate typing delay based on character length
        const typingDelay = part.length * TYPING_SPEED;

        // Wait for typing animation
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        // Add this part of the response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: part,
            timestamp: Date.now(),
          },
        ]);

        // Small pause between message parts
        if (i < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      // Single message without separators
      const typingDelay = response.length * TYPING_SPEED;
      await new Promise((resolve) => setTimeout(resolve, typingDelay));

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        },
      ]);
    }

    setTyping(false);
  };

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setProfessorId(resolvedParams.id);
    });
  }, [params]);

  // Load professor data and chat history
  useEffect(() => {
    if (!professorId) return;

    const loadProfessorData = () => {
      const savedProfessors = JSON.parse(localStorage.getItem("professor-chat-list") || "[]");
      const foundProfessor = savedProfessors.find((p: Professor) => p.id === professorId);

      if (foundProfessor) {
        setProfessor(foundProfessor);

        // Load chat history for this professor
        const chatHistoryKey = `professor-chat-history-${professorId}`;
        const savedMessages = localStorage.getItem(chatHistoryKey);
        if (savedMessages) {
          try {
            const parsedMessages = JSON.parse(savedMessages);
            setMessages(parsedMessages);
          } catch (error) {
            console.error("Failed to load chat history:", error);
          }
        } else {
          // Add welcome message
          const welcomeMessage = `Hi there! I'm Professor ${foundProfessor.name} from ${foundProfessor.institution}\\Great to meet you\\What would you like to chat about today? My research, academic life, or anything else you're curious about~`;
          
          // Use the display function for the welcome message too
          displayAssistantResponse(welcomeMessage);
        }
      }
    };

    loadProfessorData();
  }, [professorId]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && professor && professorId) {
      const chatHistoryKey = `professor-chat-history-${professorId}`;
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
    }
  }, [messages, professorId, professor]);

  // Process user queue and send to API
  const processUserQueue = useCallback(async () => {
    if (processingQueue || !professor) return;
    
    setProcessingQueue(true);
    setLoading(true);

    try {
      // Get all messages from queue
      const userMessages = [...userQueue.messages];

      // Clear the queue
      setUserQueue({ messages: [], lastMessageTime: 0 });

      // Merge messages if multiple
      const mergedMessage = userMessages.length > 1 
        ? userMessages.join(" ") 
        : userMessages[0];

      // Get conversation history (excluding the queued messages)
      const conversationHistory = messages
        .slice(0, -userMessages.length) // Remove the queued user messages
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await fetch("/api/professor-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: mergedMessage,
          professorId: professorId,
          conversationHistory,
          professorDetails: professor.fullDetails,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use the new display function for segmented responses
        await displayAssistantResponse(data.response);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble responding right now. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setProcessingQueue(false);
    }
  }, [processingQueue, professor, userQueue.messages, messages, professorId]);

  // Monitor queue and auto-process
  useEffect(() => {
    if (userQueue.messages.length === 0 || processingQueue || loading || typing) {
      return;
    }

    const timeSinceLastMessage = Date.now() - userQueue.lastMessageTime;
    
    if (timeSinceLastMessage >= QUEUE_WAITING_TIME) {
      processUserQueue();
    } else {
      const remainingTime = QUEUE_WAITING_TIME - timeSinceLastMessage;
      const timer = setTimeout(() => {
        processUserQueue();
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [userQueue, processingQueue, loading, typing, processUserQueue]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || !professor) return;

    const timestamp = Date.now();

    // Add user message to UI immediately
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
      },
    ]);

    // Add to queue
    setUserQueue((prev) => ({
      messages: [...prev.messages, userMessage],
      lastMessageTime: timestamp,
    }));
  };

  const exportChatHistory = () => {
    if (messages.length === 0) return;

    const BOM = "\uFEFF";
    const rows = messages.map((msg) => {
      const timestamp = new Date(msg.timestamp).toISOString();
      const role = msg.role;
      const content = msg.content.replace(/"/g, '""');
      return `"${timestamp}","${role}","${content}"`;
    });

    const csvContent = BOM + "Timestamp,Role,Content\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date();
    const filename = `${professor?.name.replace(/\s+/g, '_')}_chat_history_${date.toISOString().split("T")[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearChatHistory = () => {
    if (messages.length === 0) return;
    
    // Clear messages state
    setMessages([]);
    
    // Remove chat history from localStorage
    if (professorId) {
      const chatHistoryKey = `professor-chat-history-${professorId}`;
      localStorage.removeItem(chatHistoryKey);
    }
    
    // Display new welcome message
    if (professor) {
      const welcomeMessage = `Hi there! I'm Professor ${professor.name} from ${professor.institution}\\Great to meet you\\What would you like to chat about today? My research, academic life, or anything else you're curious about~`;
      displayAssistantResponse(welcomeMessage);
    }
  };

  const renderModelInfo = () => {
    if (!professor) return null;

    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <GraduationCap className="h-4 w-4 mr-2" />
        <span className="font-medium">Professor:</span>
        <span className="ml-1">{professor.name}</span>
        <span className="mx-2">•</span>
        <Building className="h-4 w-4 mr-1" />
        <span>{professor.institution}</span>
        {professor.h_index && (
          <>
            <span className="mx-2">•</span>
            <span>h-index: {professor.h_index}</span>
          </>
        )}
      </div>
    );
  };

  if (!professor) {
    return (
      <div className="flex-1 p-8">
        <div className="text-center">
          <p className="text-gray-500">Professor not found.</p>
          <Link href="/professor-chat">
            <Button variant="outline" className="mt-4">
              Back to Professor Chat
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-auto">
      <div className="w-full max-w-full mx-auto">
        <div className="mb-4">
          <Link
            href="/professor-chat"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Professor Chat
          </Link>
        </div>

        <div className="flex justify-between items-start mb-4 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Chat with Professor {professor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {professor.institution}
                {professor.country_code && (
                  <span className="text-gray-500">({professor.country_code})</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {professor.works_count} publications
              </div>
              <div>{professor.cited_by_count} citations</div>
              {professor.h_index && <div>h-index: {professor.h_index}</div>}
            </div>
            {professor.topics && professor.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {professor.topics.slice(0, 4).map((topic, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={exportChatHistory}
              variant="outline"
              size="sm"
              title="Export chat history as CSV"
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={clearChatHistory}
              variant="outline"
              size="sm"
              title="Clear chat history"
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100vh-16rem)]">
          <WeChatChat
            messages={messages}
            onSendMessage={handleSendMessage}
            disabled={false}
            placeholder="Ask the professor anything..."
            modelInfo={renderModelInfo()}
          />
        </div>
      </div>
    </div>
  );
}