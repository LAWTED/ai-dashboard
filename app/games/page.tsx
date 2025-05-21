"use client";

import { useState } from "react";
import { WeChatChat, Message } from "@/components/ui/wechat-chat";
import { Button } from "@/components/ui/button";
import { gameConfigs } from "@/app/games/config";

export default function GamesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<string>("mbti");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [guessedCorrectly, setGuessedCorrectly] = useState(false);
  const [gameParam, setGameParam] = useState<string>("");

  // Start the game
  const startGame = () => {
    const gameConfig = gameConfigs[selectedGameType];
    const randomOption = gameConfig.options[Math.floor(Math.random() * gameConfig.options.length)];
    setGameParam(randomOption);
    setGameStarted(true);
    setGuessedCorrectly(false);
    setSelectedOption(null);

    const initialMessages: Message[] = [
      {
        role: "assistant",
        content: gameConfig.initialMessage,
        timestamp: Date.now(),
      },
    ];

    setMessages(initialMessages);
  };

  // Handle user messages
  const handleSendMessage = async (content: string) => {
    if (guessedCorrectly) return;

    const gameConfig = gameConfigs[selectedGameType];

    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    // Check if user is guessing
    const isOptionGuess = gameConfig.options.some((option) => {
      if (selectedGameType === "mbti") {
        return content.toUpperCase().includes(option);
      } else {
        return content.includes(option);
      }
    });

    // Format conversation history for the API
    const conversationHistory = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    try {
      // Call our API
      const response = await fetch("/api/games/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          gameType: selectedGameType,
          gameParam: gameParam,
          isGuessing: isOptionGuess,
          conversationHistory,
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
  const makeGuess = (option: string) => {
    if (guessedCorrectly) return;

    setSelectedOption(option);
    const gameConfig = gameConfigs[selectedGameType];
    const guessMessage = gameConfig.formatGuessMessage(option);
    handleSendMessage(guessMessage);
  };

  // Change game type
  const changeGameType = (type: string) => {
    if (type !== selectedGameType) {
      setSelectedGameType(type);
      setGameStarted(false);
      setMessages([]);
      setGuessedCorrectly(false);
      setSelectedOption(null);
    }
  };

  const gameConfig = gameConfigs[selectedGameType];

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl h-full flex flex-col">
      <div className="flex justify-center mb-4 gap-2">
        {Object.keys(gameConfigs).map((type) => (
          <Button
            key={type}
            variant={selectedGameType === type ? "default" : "outline"}
            onClick={() => changeGameType(type)}
            className="text-sm h-auto"
            size="sm"
          >
            {gameConfigs[type].title}
          </Button>
        ))}
      </div>

      <h1 className="text-center text-xl sm:text-2xl font-bold mb-4">
        {gameConfig.title}
      </h1>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!gameStarted ? (
          <div className="text-center flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg p-6">
            <p className="mb-4 px-4">{gameConfig.description}</p>
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
              className="grow min-h-0"
            />

            {guessedCorrectly ? (
              <div className="text-center mt-2 bg-gray-50 rounded-lg p-4">
                <p className="mb-3 text-green-600 font-bold">
                  恭喜你猜对了！
                  {gameConfig.formatSuccessMessage(gameParam)}
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
                    {gameConfig.commonQuestions.map((question, index) => (
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
                    {gameConfig.optionsTitle}
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                    {gameConfig.options.map((option) => (
                      <Button
                        key={option}
                        variant={selectedOption === option ? "default" : "outline"}
                        onClick={() => makeGuess(option)}
                        className="text-xs sm:text-sm py-1 h-auto"
                        size="sm"
                      >
                        {option}
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