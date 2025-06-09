import React, { useRef, useEffect } from "react";
import { CustomMarkdown } from "@/components/ui/custom-markdown";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Message } from "@ai-sdk/react";

interface GameMessageDisplayProps {
  messages: Message[];
  status: string;
  gameStarted: boolean;
  gameIntroduction: string;
}

export function GameMessageDisplay({
  messages,
  status,
  gameStarted,
  gameIntroduction,
}: GameMessageDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add auto-scroll effect when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto mb-4 prose prose-sm dark:prose-invert">
      {!gameStarted ? (
        // Game not started, show introduction
        <CustomMarkdown>{gameIntroduction}</CustomMarkdown>
      ) : (
        // Game started, show messages
        messages.map((message, messageIndex) => {
          // Only show assistant (professor) messages as story
          if (message.role === "assistant") {
            if (message.parts) {
              // Handle messages with parts
              return (
                <div key={message.id} className="mb-4">
                  {message.parts.map((part, partIndex) => {
                    if (part.type === "text") {
                      // Highlight day markers
                      const textWithDayHighlight = part.text.replace(
                        /【第(\d+)天】/g,
                        '<span class="font-bold text-amber-600 dark:text-amber-400">【第$1天】</span>'
                      );
                      return (
                        <div key={`${messageIndex}-${partIndex}`}>
                          <CustomMarkdown>
                            {textWithDayHighlight}
                          </CustomMarkdown>
                        </div>
                      );
                    }

                    if (part.type === "tool-invocation") {
                      const toolInvocation = part.toolInvocation;

                      // Show user choice result, but not options themselves
                      if (
                        toolInvocation.toolName === "renderChoices" &&
                        toolInvocation.state === "result"
                      ) {
                        return (
                          <div
                            key={`${messageIndex}-${partIndex}`}
                            className="my-2 font-bold text-sm italic text-muted-foreground bg-black/10 p-2 rounded-md w-fit"
                          >
                            玩家选择了: {toolInvocation.result}
                          </div>
                        );
                      }

                      // Show dice result
                      if (
                        toolInvocation.toolName === "rollADice" &&
                        toolInvocation.state === "result"
                      ) {
                        const result = parseInt(toolInvocation.result);
                        const isSuccess = result > 10;
                        return (
                          <div
                            key={`${messageIndex}-${partIndex}`}
                            className={`my-2 font-bold text-sm italic p-2 rounded-md w-fit bg-black/10 ${
                              isSuccess ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            🎲 掷骰结果: {result} (
                            {isSuccess ? "成功!" : "失败!"})
                          </div>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              );
            } else if (typeof message.content === "string") {
              // Handle regular text messages
              // Highlight day markers
              const textWithDayHighlight = message.content.replace(
                /【第(\d+)天】/g,
                '<span class="font-bold text-amber-600 dark:text-amber-400">【第$1天】</span>'
              );
              return (
                <div
                  key={message.id}
                  className="mb-4 text-sm whitespace-pre-wrap"
                >
                  <CustomMarkdown>{textWithDayHighlight}</CustomMarkdown>
                </div>
              );
            }
          } else if (
            message.role === "user" &&
            typeof message.content === "string"
          ) {
            // Show user messages as choices
            return (
              <div
                key={message.id}
                className="my-2 text-sm italic text-muted-foreground border-l-2 border-primary pl-2"
              >
                玩家说: {message.content}
              </div>
            );
          }
          return null;
        })
      )}
      <div ref={messagesEndRef} />

      {status === "streaming" && (
        <TextShimmer
          className="font-mono text-sm absolute top-3 left-4"
          duration={1}
        >
          Generating ...
        </TextShimmer>
      )}
    </div>
  );
}
