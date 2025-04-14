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
        message: `${COLORS.RED}错误：${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "error" as const,
        color: "red",
      };
      addLog(logEntry);
      console.error(`ERROR: ${message}`);
    },
    warning: (message: string) => {
      const logEntry = {
        message: `${COLORS.YELLOW}警告：${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "warning" as const,
        color: "yellow",
      };
      addLog(logEntry);
      console.warn(`WARNING: ${message}`);
    },
    debug: (message: string) => {
      const logEntry = {
        message: `${COLORS.BLUE}调试：${message}${COLORS.RESET}`,
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
          `队列等待时间已超过 ${QUEUE_WAITING_TIME}ms，开始处理消息队列${
            typing ? " (正在输入中)" : ""
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
    logger.info(`【用户】：${userMessage}`);

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
        `消息已添加到队列，当前队列消息数: ${newQueue.messages.length}`
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
      logger.info(`处理消息队列: ${userMessages.length} 条消息合并为一条`);

      // Get conversation history (excluding latest user messages already in queue)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      logger.info(`调用 API: 发送合并后的消息 (${mergedMessage.length} 字符)`);
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
      logger.success(`API 响应时间: ${apiTime}ms`);

      if (data.success) {
        logger.info(`收到 AI 回复: ${data.response.length} 字符`);
        if (data.response.includes("\\")) {
          const parts = data.response.split("\\").filter(Boolean);
          logger.info(`回复将分为 ${parts.length} 个部分逐步显示`);
        }

        // Process response - if contains \ splits, show each part with typing animation
        await displayAssistantResponse(data.response);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`处理消息队列出错: ${errorMessage}`);
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
    logger.info("AI 开始输入回复...");

    if (response.includes("\\")) {
      // Split by backslash and remove empty parts
      const parts = response
        .split("\\")
        .map((part) => part.trim())
        .filter(Boolean);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // 计算打字时间直接使用字符长度 * 速度
        const typingDelay = part.length * TYPING_SPEED;

        logger.info(
          `显示回复部分 ${i + 1}/${parts.length} (${
            part.length
          } 字符, 延迟 ${typingDelay}ms)`
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

        // 记录AI回复到日志
        logger.info(`【Alice】: ${part}`);

        // Small pause between message parts
        if (i < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      // 计算打字时间直接使用字符长度 * 速度
      const typingDelay = response.length * TYPING_SPEED;

      logger.info(
        `显示完整回复 (${response.length} 字符, 延迟 ${typingDelay}ms)`
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

      // 记录AI回复到日志
      logger.info(`【Alice】: ${response}`);
    }

    logger.info("回复已完全显示，AI 停止输入");
    setTyping(false);
  };

  // 切换日志显示
  const toggleLogs = () => {
    setShowLogs(!showLogs);
    logger.debug(`日志显示状态: ${!showLogs}`);
  };

  // 注意: 聊天消息不再显示时间戳，相关的 formatTime 函数已移除

  // 格式化完整日期时间，类似bot.py格式
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // 在组件挂载时记录启动日志
  useEffect(() => {
    logger.success("\u001b[32m开始运行聊天界面...\u001b[0m");

    return () => {
      logger.info("聊天界面已关闭");
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
            {showLogs ? "隐藏日志" : "显示日志"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-10rem)]">
          {/* 聊天区域 - 固定宽度 */}
          <div className="flex flex-col w-full md:w-[600px] md:flex-shrink-0 h-full">
            <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-muted/50 mb-4">
              {/* 容器内消息滚动区 */}
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
                placeholder="输入消息..."
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
                发送
              </Button>
            </div>
          </div>

          {/* 日志区域 - 完全占满剩余宽度 */}
          <div
            className={`flex-1 h-full overflow-hidden border rounded-lg bg-black/90 text-gray-200 font-mono text-xs ${
              showLogs ? "md:block" : "hidden"
            }`}
          >
            <h3 className="font-bold text-white p-2 sticky top-0 bg-black z-10">
              系统日志
            </h3>
            <div className="h-[calc(100%-2rem)] overflow-y-auto p-3">
              {logs.map((log, index) => {
                // 解析ANSI颜色代码
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

                // 清除ANSI颜色代码
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
