"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAliceConfigStore } from "@/app/store/alice-config";
import { Download, ListFilter, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

// Define available model options
type ModelOption = {
  id: string;
  name: string;
  api: string; // Add API provider information
};

const MODELS: ModelOption[] = [
  { id: "gpt-4o-2024-08-06", name: "GPT-4o", api: "OpenAI" },
  { id: "gpt-4.1-2025-04-14", name: "GPT-4.1", api: "OpenAI" },
  { id: "o3-mini-2025-01-31", name: "o3-mini", api: "OpenAI" },
];

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

export default function Demo() {
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
  const [showLogs, setShowLogs] = useState(true);
  // 确认对话框状态
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // 用户名状态
  const [userid, setUserid] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  // 添加学生信息状态
  const [loadingStudentInfo, setLoadingStudentInfo] = useState(false);
  // Add state for selected model
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  // Add loading state for clear history operation
  const [clearingHistory, setClearingHistory] = useState(false);
  // Add logout confirmation dialog state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // 从配置 store 中获取配置
  const { config } = useAliceConfigStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 使用配置 store 中的值
  const QUEUE_WAITING_TIME = config.queueWaitingTime; // 从 store 中获取
  const TYPING_SPEED = config.typingSpeed; // 从 store 中获取
  const MAX_LOGS = 100; // 最大日志数量
  const STORAGE_KEY_PREFIX = "alice_chat_history_"; // localStorage 存储键前缀
  const USERID_STORAGE_KEY = "alice_userid"; // userid 存储键
  const MODEL_STORAGE_KEY = "alice_selected_model"; // model 存储键

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
    model: (modelInfo: ModelOption | undefined, action: string) => {
      const modelName = modelInfo?.name || "Unknown";
      const apiProvider = modelInfo?.api || "Unknown";
      const modelId = modelInfo?.id || "Unknown";
      const logEntry = {
        message: `${COLORS.MAGENTA}[${apiProvider} API] Using ${modelName} (${modelId}) for ${action}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "info" as const,
        color: "magenta",
      };
      addLog(logEntry);
      console.log(
        `MODEL: Using ${modelName} (${modelId}) via ${apiProvider} API for ${action}`
      );
    },
    api: (status: string, details: string) => {
      const logEntry = {
        message: `${COLORS.CYAN}[API ${status}] ${details}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "info" as const,
        color: "cyan",
      };
      addLog(logEntry);
      console.log(`API ${status}: ${details}`);
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
    if (!message.trim() || !nameEntered) return;

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
      logger.info(
        `Processing message queue: ${userMessages.length} messages merged into one`
      );

      // Get conversation history (excluding latest user messages already in queue)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const modelInfo = MODELS.find((m) => m.id === selectedModel);
      logger.model(modelInfo, `sending ${mergedMessage.length} characters`);
      const startTime = Date.now();

      const res = await fetch("/api/alice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: mergedMessage,
          conversationHistory,
          userid: userid,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      const apiTime = Date.now() - startTime;
      logger.api(
        "response",
        `Completed in ${apiTime}ms with status: ${
          data.success ? "success" : "failure"
        }`
      );

      if (data.success) {
        logger.api(
          "data",
          `Received ${data.response.length} characters from model: ${data.model}`
        );
        if (data.response.includes("\\")) {
          const parts = data.response.split("\\").filter(Boolean);
          logger.debug(`Reply will be displayed in ${parts.length} parts`);
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

    // Check if response contains any separators
    if (response.includes("\\") || response.includes("\n")) {
      // Split by backslash first, then further split each part by newlines
      const parts = response
        .split("\\")
        .flatMap((part) =>
          part
            .split("\n")
            .map((subPart) => subPart.trim())
            .filter(Boolean)
        )
        .filter(Boolean);

      logger.debug(
        `Response will be displayed in ${parts.length} parts (split by \\ and \n)`
      );

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Calculate typing time directly using character length * speed
        const typingDelay = part.length * TYPING_SPEED;

        logger.debug(
          `Displaying part ${i + 1}/${parts.length} (${
            part.length
          } chars, delay ${typingDelay}ms)`
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

      logger.debug(
        `Displaying full reply (${response.length} chars, delay ${typingDelay}ms)`
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

    logger.success("Reply fully displayed");
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

  // 处理名字提交
  const handleNameSubmit = () => {
    if (!userid.trim()) return;

    setNameEntered(true);
    logger.success(`User ID set: ${userid}`);

    // 保存用户ID到 sessionStorage 而不是 localStorage
    sessionStorage.setItem(USERID_STORAGE_KEY, userid);
  };

  // Record startup log when component mounts and load model preference
  useEffect(() => {
    logger.success("Chat interface started");
    logger.info(
      `Available models: ${MODELS.map((m) => `${m.name} (${m.api})`).join(
        ", "
      )}`
    );

    // 尝试从 sessionStorage 加载用户ID
    const savedUserid = sessionStorage.getItem(USERID_STORAGE_KEY);
    if (savedUserid) {
      setUserid(savedUserid);
      setNameEntered(true);
      logger.info(`User ID loaded from sessionStorage: ${savedUserid}`);
    }

    // 尝试从 localStorage 加载模型选择（模型选择可以在所有窗口共享）
    const savedModel = localStorage.getItem(MODEL_STORAGE_KEY);
    if (savedModel && MODELS.some((m) => m.id === savedModel)) {
      setSelectedModel(savedModel);
      const modelInfo = MODELS.find((m) => m.id === savedModel);
      logger.model(modelInfo, "loaded from localStorage");
    }

    return () => {
      logger.info("Chat interface closed");
    };
  }, []);

  // 获取特定用户的聊天历史存储键
  const getChatHistoryKey = (id: string) => {
    return `${STORAGE_KEY_PREFIX}${id}`;
  };

  // Load chat history from localStorage on component mount
  useEffect(() => {
    if (!nameEntered || !userid) return; // 只有在用户输入ID后才加载聊天历史

    try {
      const chatHistoryKey = getChatHistoryKey(userid);
      const savedMessages = localStorage.getItem(chatHistoryKey);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        logger.info(
          `Loaded ${parsedMessages.length} messages from localStorage for user ${userid}`
        );
      } else {
        // Add default welcome message from Alice as three separate messages
        const welcomeMessages = [
          "Hello同学你好呀～ 是要申请grad school嘛？",
          '我先自我介绍下，我叫Alice，中文名李星煜，本科清华，博士毕业于Stanford，目前在Stanford做research scientist（其实就是俗称的"博士后"～）。',
          "怎么称呼你比较好呀？我给你微信备注上。",
        ];

        const timestamp = Date.now();
        const initialMessages = welcomeMessages.map((content, index) => ({
          role: "assistant" as const,
          content,
          timestamp: timestamp + index * 100, // Add small time difference for message order
        }));

        setMessages(initialMessages);

        logger.info(
          `Default greeting displayed as ${welcomeMessages.length} separate messages`
        );
      }
    } catch (error) {
      logger.error(`Failed to load chat history from localStorage: ${error}`);
    }
  }, [nameEntered, userid]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      if (messages.length > 0 && nameEntered && userid) {
        const chatHistoryKey = getChatHistoryKey(userid);
        localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
        logger.debug(`Saved ${messages.length} messages to localStorage for user ${userid}`);
      }
    } catch (error) {
      logger.error(`Failed to save chat history to localStorage: ${error}`);
    }
  }, [messages, userid, nameEntered]);

  // 显示清除历史确认对话框
  const handleClearHistoryClick = () => {
    setShowClearConfirm(true);
  };

  // 确认清除历史
  const confirmClearHistory = async () => {
    setClearingHistory(true);
    await clearChatHistory();
    setShowClearConfirm(false);
    setClearingHistory(false);
  };

  // Clear chat history
  const clearChatHistory = async () => {
    try {
      logger.api("operation", "Starting to clear chat history...");
      setMessages([]);

      if (userid) {
        // 删除特定用户的聊天历史
        const chatHistoryKey = getChatHistoryKey(userid);
        localStorage.removeItem(chatHistoryKey);
        logger.info(`Chat history cleared from localStorage for user ${userid}`);

        // 清空数据库中对应用户的记录
        logger.info(`Deleting user record for ID: ${userid} from database...`);
        const { error } = await supabase
          .from("studentinfo")
          .delete()
          .eq("userid", userid);

        if (error) {
          logger.error(`Failed to delete user data: ${error.message}`);
        } else {
          logger.success(`Successfully deleted user data for ID: ${userid}`);
        }
      }

      // 刷新页面
      logger.info("Refreshing page...");
      window.location.reload();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Error during clearing history: ${errorMessage}`);
      setClearingHistory(false); // Reset loading state on error
    }
  };

  // Export chat history as CSV
  const exportChatHistory = () => {
    try {
      if (messages.length === 0) {
        logger.warning("No messages to export");
        return;
      }

      // Add UTF-8 BOM to ensure Excel recognizes the encoding
      const BOM = "\uFEFF";

      // Create rows with proper escaping for CSV format
      const rows = messages.map((msg) => {
        const timestamp = new Date(msg.timestamp).toISOString();
        const role = msg.role;
        // Properly escape content for CSV
        const content = msg.content.replace(/"/g, '""'); // Double quotes to escape

        // Wrap fields in quotes and join with commas
        return `"${timestamp}","${role}","${content}"`;
      });

      // Build CSV with header
      const csvContent = BOM + "Timestamp,Role,Content\n" + rows.join("\n");

      // Create blob with UTF-8 encoding explicitly set
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });

      // Create and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      // Set filename with current date
      const date = new Date();
      const filename = `alice_chat_history_${
        date.toISOString().split("T")[0]
      }.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up to avoid memory leaks

      logger.success(`Chat history exported as CSV: ${filename}`);
    } catch (error) {
      logger.error(`Failed to export chat history: ${error}`);
    }
  };

  // 获取学生信息
  const fetchStudentInfo = async () => {
    try {
      setLoadingStudentInfo(true);
      logger.info(`获取当前用户 (${userid}) 的信息数据...`);

      // 修改查询，仅获取当前用户的信息
      const { data, error } = await supabase
        .from("studentinfo")
        .select("*")
        .eq("userid", userid)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        logger.info(`========== ${userid} 的信息记录 ==========`);

        data.forEach((student, index) => {
          const createdAt = new Date(student.created_at).toLocaleString();
          const updatedAt = new Date(student.updated_at).toLocaleString();

          logger.info(`用户ID: ${student.userid}`);
          logger.info(`创建时间: ${createdAt}`);
          logger.info(`更新时间: ${updatedAt}`);

          // 过滤出学生关键信息字段
          Object.keys(student).forEach((key) => {
            if (
              !["id", "created_at", "updated_at", "userid"].includes(key) &&
              student[key]
            ) {
              logger.info(`${key}: ${student[key]}`);
            }
          });

          if (index < data.length - 1) {
            logger.info("----------------------------------");
          }
        });

        logger.info("=================================");
      } else {
        logger.warning(`没有找到用户 ${userid} 的信息记录`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`获取用户信息失败: ${errorMessage}`);
    } finally {
      setLoadingStudentInfo(false);
    }
  };

  // Display logout confirmation dialog
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Confirm logout
  const confirmLogout = async () => {
    setLoggingOut(true);
    await handleLogout();
    setShowLogoutConfirm(false);
    setLoggingOut(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      logger.api("operation", "Logging out user...");

      // Clear userid and set nameEntered to false
      setUserid("");
      setNameEntered(false);

      // Remove userid from sessionStorage
      sessionStorage.removeItem(USERID_STORAGE_KEY);
      logger.success("User ID removed from sessionStorage");

      // Optionally clear messages from state
      setMessages([]);

      // Refresh page to ensure clean state
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Error during logout: ${errorMessage}`);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 overflow-auto ">
      <div className="w-full max-w-full mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Chat with Alice</h1>
          <div className="flex gap-2">
            {nameEntered && (
              <>
                <div className="flex items-center text-sm text-muted-foreground mr-2">
                  Current ID: <span className="font-medium ml-1">{userid}</span>
                </div>
                <div className="flex items-center gap-2 mr-2">
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => {
                      setSelectedModel(value);
                      // Save to localStorage
                      localStorage.setItem(MODEL_STORAGE_KEY, value);
                      const newModel = MODELS.find((m) => m.id === value);
                      logger.model(
                        newModel,
                        "selected and saved to localStorage"
                      );
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((model) => (
                        <SelectItem
                          key={model.id}
                          value={model.id}
                          className="flex justify-between"
                        >
                          <div>{model.name}</div>
                          {/* <div className="text-xs text-muted-foreground ml-2">{model.api}</div> */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleLogoutClick}
                  variant="secondary"
                  size="sm"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            )}
            <Button
              onClick={exportChatHistory}
              variant="outline"
              size="sm"
              title="Export as CSV"
              disabled={!nameEntered}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={handleClearHistoryClick}
              variant="destructive"
              size="sm"
              disabled={!nameEntered || clearingHistory}
            >
              {clearingHistory ? "Clearing..." : "Clear History"}
            </Button>
            <Button
              onClick={fetchStudentInfo}
              variant="outline"
              size="sm"
              disabled={loadingStudentInfo}
              title="查看我的信息"
            >
              <ListFilter className="h-4 w-4 mr-1" />
              查看我的信息
            </Button>
            <Button
              onClick={toggleLogs}
              variant={showLogs ? "default" : "outline"}
              size="sm"
            >
              {showLogs ? "Hide Logs" : "Show Logs"}
            </Button>
          </div>
        </div>

        {/* ID输入界面 */}
        {!nameEntered && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 border rounded-lg bg-muted/50 mb-4">
            <h2 className="text-xl font-semibold">请输入你的ID开始聊天</h2>
            <div className="flex w-full max-w-sm items-center space-x-2 px-4">
              <Input
                value={userid}
                onChange={(e) => setUserid(e.target.value)}
                placeholder="请输入你的ID..."
                className="flex-1"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleNameSubmit();
                  }
                }}
              />
              <Button onClick={handleNameSubmit} disabled={!userid.trim()}>
                开始聊天
              </Button>
            </div>
          </div>
        )}

        {/* 清除历史确认对话框 */}
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Chat History</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all chat history? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                disabled={clearingHistory}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmClearHistory}
                disabled={clearingHistory}
              >
                {clearingHistory ? (
                  <>
                    <span className="animate-spin mr-1">⟳</span>
                    Clearing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 登出确认对话框 */}
        <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? This will clear your current session.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <>
                    <span className="animate-spin mr-1">⟳</span>
                    Logging out...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 聊天界面 - 只有当用户输入ID后才显示 */}
        {nameEntered && (
          <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-12rem)]">
            {/* Chat area - fixed width */}
            <div className="flex flex-col w-full md:w-[600px] md:flex-shrink-0 h-full">
              <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-[#ebebeb] mb-4">
                {/* Container message scroll area */}
                <div className="flex flex-col w-full">
                  {/* Current model info */}
                  <div className="bg-gray-100 rounded-lg p-2 mb-4 text-xs text-gray-700 flex items-center justify-center">
                    <div className="flex items-center">
                      <span className="font-medium">Model:</span>
                      <span className="ml-1">
                        {MODELS.find((m) => m.id === selectedModel)?.name ||
                          selectedModel}
                      </span>
                      <span className="mx-1">|</span>
                      <span className="font-medium">API:</span>
                      <span className="ml-1">
                        {MODELS.find((m) => m.id === selectedModel)?.api ||
                          "Unknown"}
                      </span>
                      <span className="mx-1">|</span>
                      <span className="font-medium">User ID:</span>
                      <span className="ml-1">{userid}</span>
                    </div>
                  </div>

                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-[#95ec69] text-black self-end max-w-[85%]"
                          : "bg-white border border-gray-200 self-start max-w-[85%]"
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
                  className="flex-1 bg-white"
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
                  disabled={!message.trim()}
                  className="bg-[#07c160] hover:bg-[#06ad56]"
                >
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

                  // Define color classes based on log level or color
                  let textColorClass = "";
                  if (log.color === "red") textColorClass = "text-red-400";
                  else if (log.color === "green")
                    textColorClass = "text-green-400";
                  else if (log.color === "yellow")
                    textColorClass = "text-yellow-400";
                  else if (log.color === "blue")
                    textColorClass = "text-blue-400";
                  else if (log.color === "magenta")
                    textColorClass = "text-fuchsia-400";
                  else if (log.color === "cyan")
                    textColorClass = "text-cyan-400";
                  else if (log.level === "error")
                    textColorClass = "text-red-400";
                  else if (log.level === "warning")
                    textColorClass = "text-yellow-400";
                  else if (log.level === "debug")
                    textColorClass = "text-blue-400";
                  else textColorClass = "text-gray-300";

                  // Remove ANSI color codes for display
                  content = content.replace(/\u001b\[\d+m/g, "");

                  return (
                    <div
                      key={index}
                      className="mb-1 py-1 border-b border-gray-800"
                    >
                      <span className="text-gray-500">
                        [{formatDateTime(log.timestamp)}]
                      </span>{" "}
                      <span className={textColorClass}>{content}</span>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
