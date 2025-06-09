"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, User, Bot } from "lucide-react";

// Predefined values for the demo - curated for better visual presentation
const coreValues = [
  "Creativity",
  "Growth",
  "Compassion",
  "Integrity",
  "Knowledge",
  "Balance",
  "Purpose",
  "Connection",
  "Excellence",
  "Empathy",
  "Leadership",
  "Innovation"
];

interface Message {
  role: "user" | "bot";
  content: string;
  isTyping?: boolean;
}

export default function VADemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Welcome to the Values Affirmation exercise. I'd like to invite you to reflect on what's meaningful to you. What core value guides your work or life?",
    },
  ]);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollContainer = document.getElementById('message-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if ((!input.trim() && !selectedValue) || isTyping) return;

    const userMessage = input.trim() || selectedValue || "";
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // Clear inputs
    setInput("");
    setSelectedValue(null);

    // Show typing indicator
    setIsTyping(true);
    setMessages((prev) => [...prev, { role: "bot", content: "", isTyping: true }]);

    // Process response based on stage with natural delay
    setTimeout(() => {
      let botResponse = "";

      if (stage === 0) {
        botResponse = `Thank you for sharing that "${userMessage}" is important to you. Could you briefly explain why this value resonates with you? Perhaps share a time when it guided a decision you made.`;
        setStage(1);
      } else if (stage === 1) {
        botResponse = `Thank you for that thoughtful reflection. Research shows that connecting with our core values helps us navigate challenges with greater resilience. Your commitment to "${messages[1].content}" is a strength you can draw upon in difficult moments. Would you like to learn more about how values affirmation works?`;
        setStage(2);
      } else {
        botResponse = "This completes our demonstration. In a real implementation, we would continue the conversation based on your response, potentially offering more personalized affirmations or transitioning to the main task that follows this intervention.";
      }

      // Remove typing indicator and add actual response
      setMessages((prev) => prev.slice(0, -1).concat({ role: "bot", content: botResponse }));
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectValue = (value: string) => {
    setSelectedValue(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-black text-white py-5 px-8 flex items-center">
        <Link href="/va" className="flex items-center text-sm font-light hover:text-blue-300 transition-colors duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to presentation
        </Link>
        <h1 className="text-xl font-light ml-6 tracking-tight">Values Affirmation Demo</h1>
      </header>

      {/* Chat UI */}
      <main className="flex-grow flex flex-col px-4 sm:px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-grow flex flex-col overflow-hidden">
          {/* Chat messages */}
          <div id="message-container" className="flex-grow px-6 py-6 overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-5 duration-300`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`flex items-start max-w-xs sm:max-w-md ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}>
                    <div className={`rounded-full p-2 flex-shrink-0 ${
                      message.role === "user" ? "bg-blue-100 ml-3" : "bg-gray-100 mr-3"
                    }`}>
                      {message.role === "user" ?
                        <User className="w-5 h-5 text-blue-600" /> :
                        <Bot className="w-5 h-5 text-gray-600" />
                      }
                    </div>
                    <div
                      className={`rounded-2xl px-5 py-3.5 ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.isTyping ? (
                        <div className="flex space-x-1 items-center py-1.5">
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: "200ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: "400ms" }}></div>
                        </div>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value selection */}
          {stage === 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Select a value or type your own:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {coreValues.map((value) => (
                  <button
                    key={value}
                    onClick={() => selectValue(value)}
                    className={`px-3.5 py-1.5 rounded-full text-sm border transition-all duration-200 ${
                      selectedValue === value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedValue
                    ? `Send "${selectedValue}" or type a different response...`
                    : "Type your message..."
                }
                className="flex-grow px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedValue) || isTyping}
                className={`ml-3 p-3 rounded-full transition-all duration-200 ${
                  (!input.trim() && !selectedValue) || isTyping
                    ? "bg-gray-200 text-gray-400"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Info Footer */}
      <footer className="bg-white border-t border-gray-200 py-5 px-8 text-center text-sm text-gray-500">
        <p className="max-w-xl mx-auto">
          This demo illustrates a Values Affirmation intervention based on research by Geoffrey Cohen.
          <br className="hidden sm:block" />
          In production, responses would be more personalized and adaptive to the user&apos;s context.
        </p>
      </footer>
    </div>
  );
}