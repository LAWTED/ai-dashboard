"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendIcon, Bot } from "lucide-react";

type Message = {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

export function AiChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "你好！我是 OpenHatch AI 助手，我可以帮助你找到最适合的教授和项目，并指导你完成申请流程。请告诉我你对哪个研究领域感兴趣？",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: Message;

      if (input.toLowerCase().includes("机器学习") || input.toLowerCase().includes("ai") || input.toLowerCase().includes("人工智能")) {
        aiResponse = {
          id: messages.length + 2,
          content: "机器学习和人工智能是非常热门的研究领域！根据你的兴趣，我推荐你考虑斯坦福大学的王教授，他在机器学习方面有很深的研究。他目前正在招收对强化学习和深度学习感兴趣的学生。你可以上传你的简历，我可以帮你分析与他的研究方向的匹配度。",
          sender: "ai",
          timestamp: new Date(),
        };
      } else if (input.toLowerCase().includes("申请") || input.toLowerCase().includes("流程")) {
        aiResponse = {
          id: messages.length + 2,
          content: "博士申请流程通常包括：1) 确定目标教授和项目；2) 准备个人陈述和研究计划；3) 联系潜在导师；4) 提交正式申请。在 OpenHatch，我们可以帮助你完成每一步，并根据教授的偏好给你个性化的建议。你想从哪一步开始？",
          sender: "ai",
          timestamp: new Date(),
        };
      } else {
        aiResponse = {
          id: messages.length + 2,
          content: "谢谢你的信息！为了给你提供更精准的匹配和建议，我需要了解更多关于你的学术背景和研究兴趣。你可以在\"个人简历\"和\"研究兴趣\"部分填写更多信息，或者告诉我你感兴趣的具体研究方向。",
          sender: "ai",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          OpenHatch AI 助手
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[350px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="输入你的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}