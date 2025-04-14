"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAliceConfigStore } from "@/app/store/alice-config";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

// 系统日志类型
type LogEntry = {
  message: string;
  timestamp: number;
  level: "info" | "error" | "warning" | "debug";
  // 添加ANSI颜色代码
  color?: string;
};

// Queue to collect user messages before sending to API
type UserQueue = {
  messages: string[];
  lastMessageTime: number;
};

export default function AlicePage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userQueue, setUserQueue] = useState<UserQueue>({
    messages: [],
    lastMessageTime: 0,
  });
  // 保留 typing 状态用于日志记录，即使界面上不再显示
  const [typing, setTyping] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);
  // 添加日志状态
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // 从配置 store 中获取配置
  const { config } = useAliceConfigStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 使用配置 store 中的值
  const QUEUE_WAITING_TIME = config.queueWaitingTime; // 从 store 中获取
  const TYPING_SPEED = config.typingSpeed;           // 从 store 中获取
  const MAX_LOGS = 100; // 最大日志数量

  // ANSI 颜色代码常量
  const COLORS = {
    RED: "\u001b[31m",
    GREEN: "\u001b[32m",
    YELLOW: "\u001b[33m",
    BLUE: "\u001b[34m",
    MAGENTA: "\u001b[35m",
    CYAN: "\u001b[36m",
    RESET: "\u001b[0m",
  };

  // bot.py风格的日志功能
  const logger = {
    info: (message: string) => {
      const logEntry = {
        message,
        timestamp: Date.now(),
        level: "info" as const,
      };
      addLog(logEntry);
      console.log(`INFO: ${message}`);
    },
    error: (message: string) => {
      const logEntry = {
        message: `${COLORS.RED}Error: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "error" as const,
        color: "red",
      };
      addLog(logEntry);
      console.error(`ERROR: ${message}`);
    },
    warning: (message: string) => {
      const logEntry = {
        message: `${COLORS.YELLOW}Warning: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "warning" as const,
        color: "yellow",
      };
      addLog(logEntry);
      console.warn(`WARNING: ${message}`);
    },
    debug: (message: string) => {
      const logEntry = {
        message: `${COLORS.BLUE}Debug: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "debug" as const,
        color: "blue",
      };
      addLog(logEntry);
      console.debug(`DEBUG: ${message}`);
    },
    success: (message: string) => {
      const logEntry = {
        message: `${COLORS.GREEN}${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "info" as const,
        color: "green",
      };
      addLog(logEntry);
      console.log(`SUCCESS: ${message}`);
    },
  };

  // 添加日志
  const addLog = (logEntry: LogEntry) => {
    setLogs((prev) => {
      // 保持日志数量在限制内
      const newLogs = [...prev, logEntry];
      if (newLogs.length > MAX_LOGS) {
        return newLogs.slice(-MAX_LOGS);
      }
      return newLogs;
    });
  };

  // Scroll to bottom when messages or logs change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Effect to check message queue
  useEffect(() => {
    if (userQueue.messages.length === 0 || processingQueue || loading) return;

    const timer = setTimeout(() => {
      if (Date.now() - userQueue.lastMessageTime > QUEUE_WAITING_TIME) {
        logger.info(
          `Queue waiting time has exceeded ${QUEUE_WAITING_TIME}ms, processing message queue${
            typing ? " (Typing)" : ""
          }`
        );
        processUserQueue();
      }
    }, QUEUE_WAITING_TIME + 100); // Add 100ms buffer

    return () => clearTimeout(timer);
  }, [userQueue, processingQueue, loading, typing]);

  // Function to handle sending a user message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");

    const timestamp = Date.now();
    logger.info(`【User】: ${userMessage}`);

    // Add message to UI
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
      },
    ]);

    // Add to queue
    setUserQueue((prev) => {
      const newQueue = {
        messages: [...prev.messages, userMessage],
        lastMessageTime: timestamp,
      };
      logger.info(
        `Message added to queue, current queue message count: ${newQueue.messages.length}`
      );
      return newQueue;
    });
  };

  // Process user queue and send to API
  const processUserQueue = async () => {
    setProcessingQueue(true);
    setLoading(true);

    try {
      // Get all messages from queue
      const userMessages = [...userQueue.messages];

      // Clear the queue
      setUserQueue({ messages: [], lastMessageTime: 0 });

      // Merge messages
      const mergedMessage = userMessages.join(" ");
      logger.info(`Processing message queue: ${userMessages.length} messages merged into one`);

      // Get conversation history (excluding latest user messages already in queue)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      logger.info(`Calling API: Sending merged message (${mergedMessage.length} characters)`);
      const startTime = Date.now();

      const res = await fetch("/api/alice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: mergedMessage,
          conversationHistory,
        }),
      });

      const data = await res.json();
      const apiTime = Date.now() - startTime;
      logger.success(`API response time: ${apiTime}ms`);

      if (data.success) {
        logger.info(`Received AI reply: ${data.response.length} characters`);
        if (data.response.includes("\\")) {
          const parts = data.response.split("\\").filter(Boolean);
          logger.info(`Reply will be displayed in ${parts.length} parts`);
        }

        // Process response - if contains \ splits, show each part with typing animation
        await displayAssistantResponse(data.response);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Error processing message queue: ${errorMessage}`);
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setProcessingQueue(false);
    }
  };

  // Display assistant response with typing animation
  const displayAssistantResponse = async (response: string) => {
    setTyping(true);
    logger.info("AI starting to type reply...");

    if (response.includes("\\")) {
      // Split by backslash and remove empty parts
      const parts = response
        .split("\\")
        .map((part) => part.trim())
        .filter(Boolean);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Calculate typing time directly using character length * speed
        const typingDelay = part.length * TYPING_SPEED;

        logger.info(
          `Displaying reply part ${i + 1}/${parts.length} (${
            part.length
          } characters, delay ${typingDelay}ms)`
        );

        // Show typing indicator
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

        // Record AI reply to logs
        logger.info(`【Alice】: ${part}`);

        // Small pause between message parts
        if (i < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      // Calculate typing time directly using character length * speed
      const typingDelay = response.length * TYPING_SPEED;

      logger.info(
        `Displaying full reply (${response.length} characters, delay ${typingDelay}ms)`
      );
      await new Promise((resolve) => setTimeout(resolve, typingDelay));

      // Add the whole response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        },
      ]);

      // Record AI reply to logs
      logger.info(`【Alice】: ${response}`);
    }

    logger.info("Reply fully displayed, AI stopped typing");
    setTyping(false);
  };

  // Toggle log display
  const toggleLogs = () => {
    setShowLogs(!showLogs);
    logger.debug(`Log display status: ${!showLogs}`);
  };

  // 注意: 聊天消息不再显示时间戳，相关的 formatTime 函数已移除

  // Format full date and time, similar to bot.py format
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Record startup log when component mounts
  useEffect(() => {
    logger.success("\u001b[32mChat interface started...!\u001b[0m");

    return () => {
      logger.info("Chat interface closed");
    };
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-auto ">
      <div className="w-full max-w-full mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Chat with Alice</h1>
          <Button
            onClick={toggleLogs}
            variant={showLogs ? "default" : "outline"}
            size="sm"
          >
            {showLogs ? "Hide Logs" : "Show Logs"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-12rem)]">
          {/* Chat area - fixed width */}
          <div className="flex flex-col w-full md:w-[600px] md:flex-shrink-0 h-full">
            <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-muted/50 mb-4">
              {/* Container message scroll area */}
              <div className="flex flex-col w-full">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 p-4 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground self-end max-w-[85%]"
                        : "bg-muted self-start max-w-[85%]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={false}
                className="flex-1"
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
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                Send
              </Button>
            </div>
          </div>

          {/* Log area - completely fill remaining width */}
          <div
            className={`flex-1 h-full overflow-hidden border rounded-lg bg-black/90 text-gray-200 font-mono text-xs ${
              showLogs ? "md:block" : "hidden"
            }`}
          >
            <h3 className="font-bold text-white p-2 sticky top-0 bg-black z-10">
              System Logs
            </h3>
            <div className="h-[calc(100%-2rem)] overflow-y-auto p-3">
              {logs.map((log, index) => {
                // Parse ANSI color codes
                let content = log.message;
                let textColor = "";

                if (log.color) {
                  textColor = log.color;
                } else if (log.level === "error") {
                  textColor = "red";
                } else if (log.level === "warning") {
                  textColor = "yellow";
                } else if (log.level === "debug") {
                  textColor = "blue";
                }

                // Remove ANSI color codes
                content = content.replace(/\u001b\[\d+m/g, "");

                return (
                  <div
                    key={index}
                    className={`mb-1 py-1 border-b border-gray-800`}
                  >
                    <span className="text-gray-500">
                      [{formatDateTime(log.timestamp)}]
                    </span>{" "}
                    <span
                      className={`${
                        textColor ? `text-${textColor}-400` : "text-gray-300"
                      }`}
                    >
                      {content}
                    </span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
