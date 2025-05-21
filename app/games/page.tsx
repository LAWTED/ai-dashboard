"use client";

import { useState } from "react";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";
import { Button } from "@/components/ui/button";

// MBTI types
const mbtiTypes = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];

// Common questions to ask for guessing MBTI type
const commonQuestions = [
  "你喜欢独处还是和朋友一起玩？",
  "你更关注事实和细节，还是喜欢想象和创意？",
  "做决定时，你更看重逻辑还是感受？",
  "你喜欢提前计划还是灵活应对？",
  "你如何看待冲突和矛盾？",
  "你在压力下会怎么反应？",
  "对于新事物，你的第一反应是什么？",
  "你更喜欢哪种工作环境？",
];

export default function MBTIGuessingGame() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedMBTI, setSelectedMBTI] = useState<string | null>(null);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [aiMBTI, setAiMBTI] = useState<string>("");

  // Start the game
  const startGame = () => {
    const randomMBTI = mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];
    setAiMBTI(randomMBTI);
    setGameStarted(true);
    setGuessedCorrectly(false);
    setSelectedMBTI(null);

    const initialMessages: Message[] = [
      {
        role: "assistant",
        content:
          "你好！我正在扮演一个MBTI类型。通过与我聊天，猜猜我是哪种类型吧！你可以问我一些问题，或者直接猜测。",
        timestamp: Date.now(),
      },
    ];

    setMessages(initialMessages);
  };

  // Handle user messages
  const handleSendMessage = async (content: string) => {
    if (guessedCorrectly) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Check if user is guessing a MBTI type
    const mbtiGuess = mbtiTypes.find((type) =>
      content.toUpperCase().includes(type)
    );

    try {
      // Call our API
      const response = await fetch("/api/games/mbti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          mbtiType: aiMBTI,
          isGuessing: !!mbtiGuess,
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();

      if (data.success) {
        const responseMessage: Message = {
          role: "assistant",
          content: data.text,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, responseMessage]);

        if (data.isCorrect) {
          setGuessedCorrectly(true);
        }
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      // Fallback response in case of error
      const responseMessage: Message = {
        role: "assistant",
        content: "抱歉，我遇到了一些问题。请再试一次。",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, responseMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Make a guess
  const makeGuess = (mbtiType: string) => {
    if (guessedCorrectly) return;

    setSelectedMBTI(mbtiType);
    handleSendMessage(`我猜你是${mbtiType}类型`);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl h-full flex flex-col">
      <h1 className="text-center text-xl sm:text-2xl font-bold mb-4">
        MBTI 猜猜猜
      </h1>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!gameStarted ? (
          <div className="text-center flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-6">
            <p className="mb-4 px-4">
              在这个游戏中，AI将扮演一个MBTI性格类型。通过与AI对话，猜测它代表的MBTI类型。
            </p>
            <Button onClick={startGame} className="mx-auto">
              开始游戏
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full p-2">
            <WeChatChat
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={loading}
              placeholder="输入问题或猜测..."
              className="h-full"
            />

            {guessedCorrectly ? (
              <div className="text-center mt-2 bg-gray-50 rounded-lg p-4">
                <p className="mb-3 text-green-600 font-bold">
                  恭喜你猜对了！AI的MBTI类型是: {aiMBTI}
                </p>
                <Button onClick={startGame} className="mx-auto">
                  再玩一次
                </Button>
              </div>
            ) : (
              <div className="mt-2 overflow-y-auto max-h-[35vh] sm:max-h-[30vh] bg-gray-50 rounded-lg p-3">
                <div className="mb-3">
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    常见问题:
                  </h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {commonQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleSendMessage(question)}
                        className="text-xs sm:text-sm py-1 h-auto"
                        size="sm"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">
                    猜测MBTI类型:
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {mbtiTypes.map((type) => (
                      <Button
                        key={type}
                        variant={selectedMBTI === type ? "default" : "outline"}
                        onClick={() => makeGuess(type)}
                        className="text-xs sm:text-sm py-1 h-auto"
                        size="sm"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
