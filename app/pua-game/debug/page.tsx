"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
// import { ScrollArea } from "@/components/ui/scroll-area"; // 已不再使用
import { SendIcon, Calendar, Upload, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PuaGameDebug() {
  const [gameDay, setGameDay] = useState(1);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const systemPrompt = `你是学术PUA游戏中的郑凤教授角色。这是一个橙光风格的文字RPG游戏。

重要规则：
1. 当需要提供选项供学生选择时，必须使用renderChoices工具，不要直接在文本中列出选项。
2. 永远不要在回复文本中包含"1. xxx"、"2. xxx"这样的列表选项。
3. 永远不要提示用户"请告诉我你的选择编号"，因为工具会自动处理选择。

游戏流程：
1. 你首先介绍自己并描述第1天的学术PUA场景，表现出强势、操控和学术霸凌的特点。
2. 当学生（用户）回应时：
   - 当需要提供选项时，调用renderChoices工具提供3-4个行动选项。
   - 当学生从选项中选择一个行动后，使用rollADice工具（sides=20）来决定行动成功与否。
   - 骰子结果1-10表示失败，11-20表示成功。
3. 根据学生的行动和骰子结果，描述结果和后果。
4. 然后**自动**进入下一天，清晰标明"【第X天】"，描述新的场景或教授的反应。
5. 整个游戏应该在7天内完成，第7天后根据学生的表现给出不同结局。

你的角色应该表现出：
- 情绪侮辱与人格攻击
- 毕业威胁与家长联络
- 强迫学生干私活
- 学术指导缺失
- 工资与劳务剥削
- 作息与假期控制
- 强迫加班与夜会
- 权力威胁与检讨文化

结局可能包括：
- 精神崩溃：心理值过低，无法完成学业
- 实名举报成功：收集足够证据并成功举报
- 双赢苟活：完成学业但心理受创
- 权威崩塌：成功反抗PUA并让导师失去权威
- 集体维权：联合其他学生共同对抗

示例工具使用方式：
- 正确：使用工具调用 renderChoices(["选项1", "选项2", "选项3"])
- 错误：在文本中写"1. 选项1 2. 选项2 3. 选项3"

记住，这是一个模拟游戏，目的是展示学术PUA的危害，帮助学生认识和应对此类情况。`;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    append,
    addToolResult,
  } = useChat({
    api: "/api/pua-game",
    body: {
      systemPrompt,
    },
    initialMessages: [
      {
        id: "initial",
        role: "assistant",
        content:
          "【第1天】\n\n我是郑凤教授。你是我的研究生，我负责指导你的学术生涯。今天我需要你来我办公室一趟，我有些...特别的任务要交给你。\n\n当你走进办公室，我头也不抬地盯着电脑说：「怎么这么慢？我等了你20分钟！你知不知道导师的时间有多宝贵？坐下！」我指着旁边的椅子，表情严肃。「我女儿下周有数学竞赛，你以前不是说自己数学很好吗？我需要你帮她做几份模拟试卷。」",
      },
    ],
    maxSteps: 3, // 允许多步工具调用
    onToolCall: async ({ toolCall }) => {
      // 骰子工具由服务端处理
      if (toolCall.toolName === "rollADice") {
        return null;
      }
      // renderChoices工具不需要在这里处理，我们在UI中显示选项并等待用户选择
      return null;
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用与wechat-chat.tsx相同的滚动逻辑
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 检测当前游戏天数
  useEffect(() => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && typeof m.content === "string");

    if (
      lastAssistantMessage &&
      typeof lastAssistantMessage.content === "string"
    ) {
      const dayMatch = lastAssistantMessage.content.match(/【第(\d+)天】/);
      if (dayMatch && dayMatch[1]) {
        const day = parseInt(dayMatch[1]);
        if (!isNaN(day) && day > gameDay) {
          setGameDay(day);
        }
      }
    }
  }, [messages, gameDay]);

  const handleSendHelp = () => {
    append({
      role: "user",
      content: "请给我一些可以选择的行动",
    });
  };

  // 选择一个选项
  const handleSelectChoice = (choice: string, toolCallId: string) => {
    // 添加工具结果
    addToolResult({
      toolCallId: toolCallId,
      result: choice,
    });
  };

  // 检查最后一条消息是否包含未处理的工具调用
  const hasUnhandledToolCalls = () => {
    if (messages.length === 0) return false;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant" || !lastMessage.parts) return false;

    return lastMessage.parts.some((part) => {
      if (part.type !== "tool-invocation") return false;
      const toolInvocation = part.toolInvocation;
      return (
        toolInvocation.state === "call" &&
        toolInvocation.toolName === "renderChoices"
      );
    });
  };

  // 处理背景图片上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(imageUrl);
    }
  };

  // 触发文件选择对话框
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 清除背景图片
  const clearBackgroundImage = () => {
    if (backgroundImage) {
      URL.revokeObjectURL(backgroundImage);
      setBackgroundImage(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* 游戏状态条 */}
      <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-black/40 text-white flex items-center gap-1 px-3 py-1 text-sm">
            <Calendar className="h-4 w-4" />
            <span>第{gameDay}天</span>
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="bg-black/40 text-white hover:bg-black/60"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/40 text-white hover:bg-black/60 flex items-center gap-1"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs">背景图片</span>
          </Button>
          {backgroundImage && (
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/40 text-white hover:bg-black/60"
              onClick={clearBackgroundImage}
            >
              清除背景
            </Button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBackgroundUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {/* 游戏说明弹窗 */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => setShowInstructions(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle>学术PUA生存游戏 - 游戏说明</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">
                在这个游戏中，你是郑凤教授的研究生。她会使用各种PUA手段对你进行学术霸凌。
              </p>
              <p className="text-sm mb-2">
                你可以选择不同的行动来应对，系统会自动掷骰子判断成功与否。
              </p>
              <p className="text-sm">
                游戏将持续7天，每一天的选择都会影响最终结局。
              </p>
              <Button onClick={handleSendHelp} className="mt-4 w-full">
                请求行动选项
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 游戏主要内容区 - 填充大部分空间 */}
      <div className="flex-grow" />

      {/* 对话框部分 - 固定在底部 */}
      <div className="w-full">
        <Card className="rounded-b-none m-6 rounded-t-lg bg-background/80 backdrop-blur-sm border-background/30">
          <div className="p-4">
            <div className="max-h-[280px] overflow-y-auto mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 ${
                    message.role === "user" ? "pl-12" : ""
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mb-1 text-xs text-muted-foreground">郑凤教授:</div>
                  )}
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" && message.parts ? (
                      <div>
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            // 高亮显示天数标记
                            const textWithDayHighlight = part.text.replace(
                              /【第(\d+)天】/g,
                              '<span class="font-bold text-amber-600 dark:text-amber-400">【第$1天】</span>'
                            );

                            return (
                              <p
                                key={index}
                                className="text-sm whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                  __html: textWithDayHighlight,
                                }}
                              />
                            );
                          }

                          if (part.type === "tool-invocation") {
                            const toolInvocation = part.toolInvocation;

                            if (toolInvocation.toolName === "renderChoices") {
                              if (toolInvocation.state === "call") {
                                const choices = toolInvocation.args
                                  .choices as string[];
                                return (
                                  <div key={index} className="mt-3 space-y-2">
                                    <p className="text-sm font-medium">
                                      可选行动:
                                    </p>
                                    {choices.map((choice, choiceIndex) => (
                                      <Button
                                        key={choiceIndex}
                                        variant="secondary"
                                        size="sm"
                                        className="w-full text-left justify-start text-sm"
                                        onClick={() =>
                                          handleSelectChoice(
                                            choice,
                                            toolInvocation.toolCallId
                                          )
                                        }
                                      >
                                        {choice}
                                      </Button>
                                    ))}
                                  </div>
                                );
                              } else if (toolInvocation.state === "result") {
                                return (
                                  <div
                                    key={index}
                                    className="mt-2 text-sm text-green-600 dark:text-green-400"
                                  >
                                    选择了: {toolInvocation.result}
                                  </div>
                                );
                              }
                            }

                            if (toolInvocation.toolName === "rollADice") {
                              if (toolInvocation.state === "result") {
                                const result = parseInt(toolInvocation.result);
                                const isSuccess = result > 10;
                                return (
                                  <div
                                    key={index}
                                    className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                                  >
                                    <p className="text-sm">
                                      🎲 掷骰结果:{" "}
                                      <span className="font-bold">{result}</span>{" "}
                                      ({isSuccess ? "成功!" : "失败!"})
                                    </p>
                                  </div>
                                );
                              } else if (toolInvocation.state === "call") {
                                return (
                                  <div
                                    key={index}
                                    className="mt-2 text-sm text-gray-500"
                                  >
                                    正在掷骰...
                                  </div>
                                );
                              }
                            }
                          }

                          return null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="输入你的回应或行动..."
                disabled={status === "streaming" || hasUnhandledToolCalls()}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={
                  status === "streaming" ||
                  !input.trim() ||
                  hasUnhandledToolCalls()
                }
              >
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
            {hasUnhandledToolCalls() && (
              <p className="text-xs text-amber-600 mt-1">请先选择一个行动选项</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
