"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { Calendar, Upload, Info, X, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomMarkdown } from "@/components/ui/custom-markdown";

// 定义交互类型
type InteractionMode = "idle" | "choices" | "dice" | "diceResult";

interface Choice {
  text: string;
  toolCallId: string;
}

// 定义工具参数类型
interface RenderChoicesArgs {
  choices: string[];
}

export default function PuaGameDebug() {
  const [gameDay, setGameDay] = useState(0); // 开始前为0天
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    "/default-pua-game.png"
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // 交互状态管理
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("idle");
  const [currentChoices, setCurrentChoices] = useState<Choice[]>([]);
  const [diceToolCallId, setDiceToolCallId] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<{value: number, isSuccess: boolean} | null>(null);

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
5. 整个游戏应该在9天内完成，第9天后根据学生的表现给出不同结局。

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

  // 游戏介绍文本
  const gameIntroduction = `# 学术PUA生存游戏

在这个模拟游戏中，你将扮演一名研究生，面对学术PUA导师郑凤教授的各种压力和挑战。

## 背景故事

你刚刚进入某知名高校攻读研究生学位，怀揣着对学术的热爱和对未来的憧憬。然而，你的导师郑凤教授以其严苛的要求和独特的"管理方式"而闻名。

## 游戏规则

- 游戏将持续9天，每一天你都需要面对不同的学术PUA场景
- 你可以从多个选项中选择应对方式
- 每次行动后，系统会自动掷骰子(1-20)决定你的行动成功与否
- 根据你的选择和骰子结果，故事将向不同方向发展
- 游戏结束时，你将获得不同的结局

## 提示

- 收集证据可能对你有所帮助
- 寻求同学和学校资源的支持
- 保持心理健康同样重要
- 有时候妥协是必要的，有时候原则不容退让

准备好开始你的研究生生涯了吗？`;

  const {
    messages,
    append,
    addToolResult,
  } = useChat({
    api: "/api/pua-game",
    body: {
      systemPrompt,
    },
    initialMessages: [],
    maxSteps: 3, // 允许多步工具调用
    onFinish: (message, options) => {
      console.log("onFinish", message, options);
    },
    onToolCall: async ({ toolCall }) => {
      // 处理工具调用，更新UI状态
      if (toolCall.toolName === "renderChoices" && toolCall.args) {
        // 使用类型断言来安全地访问args
        const args = toolCall.args as unknown as RenderChoicesArgs;
        const choices = args.choices || [];

        setCurrentChoices(
          choices.map(choice => ({
            text: choice,
            toolCallId: toolCall.toolCallId
          }))
        );
        setInteractionMode("choices");
        return null;
      }

      // 处理骰子调用
      if (toolCall.toolName === "rollADice") {
        setDiceToolCallId(toolCall.toolCallId);
        setInteractionMode("dice");
        // 骰子结果由服务端处理或用户手动触发
        return null;
      }

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
    if (!gameStarted) return;

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
  }, [messages, gameDay, gameStarted]);

  // 监听工具结果
  useEffect(() => {
    // 查找最后一条消息中的工具调用结果
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.parts) return;

    // 处理骰子结果
    const diceResultPart = lastMessage.parts.find(
      part =>
        part.type === "tool-invocation" &&
        part.toolInvocation.toolName === "rollADice" &&
        part.toolInvocation.state === "result"
    );

    if (diceResultPart?.type === "tool-invocation" &&
        diceResultPart.toolInvocation.state === "result") {
      const diceValue = parseInt(diceResultPart.toolInvocation.result);
      setDiceResult({
        value: diceValue,
        isSuccess: diceValue > 10
      });
      setInteractionMode("diceResult");
    }

    // 检测是否有新的选择选项
    const choicesPart = lastMessage.parts.find(
      part =>
        part.type === "tool-invocation" &&
        part.toolInvocation.toolName === "renderChoices" &&
        part.toolInvocation.state === "call"
    );

    if (choicesPart?.type === "tool-invocation" && choicesPart.toolInvocation.state === "call") {
      setInteractionMode("choices");
    }

    // 检测选择结果
    const choiceResultPart = lastMessage.parts.find(
      part =>
        part.type === "tool-invocation" &&
        part.toolInvocation.toolName === "renderChoices" &&
        part.toolInvocation.state === "result"
    );

    if (choiceResultPart) {
      // 用户已经做出选择，重置选择状态
      if (interactionMode === "choices") {
        setInteractionMode("idle");
        setCurrentChoices([]);
      }
    }
  }, [messages, interactionMode]);

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

  // 处理骰子点击
  const handleDiceClick = () => {
    if (!diceToolCallId) return;

    setIsManualRolling(true);

    // 随机生成1-20的数字
    const randomResult = Math.floor(Math.random() * 20) + 1;

    // 延迟一下，模拟骰子动画
    setTimeout(() => {
      addToolResult({
        toolCallId: diceToolCallId,
        result: randomResult.toString(),
      });
      setIsManualRolling(false);
    }, 1500);
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
    if (backgroundImage && backgroundImage !== "/default-pua-game.png") {
      URL.revokeObjectURL(backgroundImage);
      setBackgroundImage("/default-pua-game.png");
    }
  };

  // 开始游戏
  const startGame = () => {
    setGameStarted(true);
    setGameDay(1);
    // 发送第一条消息，开始游戏
    append({
      role: "user",
      content: "开始游戏",
    });
  };

  // 渲染交互面板
  const renderInteractionPanel = () => {
    if (!gameStarted) {
      // 游戏未开始，显示开始游戏按钮
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Button
            onClick={startGame}
            size="lg"
            className="flex items-center gap-2 px-8 py-6 text-lg"
          >
            <Play className="h-5 w-5" />
            开始游戏
          </Button>
        </div>
      );
    }

    // 根据当前交互模式显示不同的面板
    switch(interactionMode) {
      case "choices":
        return (
          <div className="space-y-2">
            <div className="text-center mb-3 text-sm text-muted-foreground">请选择你的行动:</div>
            {currentChoices.map((choice, choiceIndex) => (
              <Button
                key={choiceIndex}
                variant="secondary"
                size="sm"
                className="w-full text-left justify-start text-sm"
                onClick={() => handleSelectChoice(choice.text, choice.toolCallId)}
              >
                {choice.text}
              </Button>
            ))}
          </div>
        );

      case "dice":
        return (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-center mb-4 text-sm">
              点击骰子来决定你的行动结果
            </div>
            <button
              onClick={() => !isManualRolling && handleDiceClick()}
              disabled={isManualRolling}
              className="relative w-24 h-24 mb-4 cursor-pointer hover:scale-110 transition-transform disabled:cursor-not-allowed"
            >
              <div className={`absolute inset-0 flex items-center justify-center ${isManualRolling ? 'animate-spin' : ''}`}>
                <div className={`${isManualRolling ? 'rounded-full h-16 w-16 border-b-2 border-primary' : ''}`}></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🎲</span>
              </div>
            </button>
            <div className="text-sm text-muted-foreground text-center">
              {isManualRolling ? "骰子正在转动..." : "骰子结果将决定你的行动是否成功"}
              <br />
              <span className="text-xs">(1-10: 失败, 11-20: 成功)</span>
            </div>
          </div>
        );

      case "diceResult":
        if (diceResult) {
          return (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="text-center mb-4 text-sm font-medium">
                骰子结果已出:
              </div>
              <div className="w-24 h-24 mb-4 bg-background/60 rounded-lg flex items-center justify-center">
                <div className="text-4xl font-bold">{diceResult.value}</div>
              </div>
              <div className={`text-center font-semibold ${diceResult.isSuccess ? "text-green-600" : "text-red-600"}`}>
                {diceResult.isSuccess ? "成功!" : "失败!"}
              </div>
              <div className="mt-3 text-sm text-muted-foreground text-center">
                等待教授的回应...
              </div>
            </div>
          );
        }
        return null;

      default:
        return (
          <div className="text-sm text-center text-muted-foreground py-4">
            <p className="mb-2">当前没有可用选项</p>
            <Button
              onClick={handleSendHelp}
              variant="outline"
              size="sm"
              className="mx-auto"
            >
              请求行动选项
            </Button>
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 游戏状态条 */}
      <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-black/40 text-white flex items-center gap-1 px-3 py-1 text-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>第{gameDay}/9天</span>
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
          {backgroundImage && backgroundImage !== "/default-pua-game.png" && (
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
                游戏将持续9天，每一天的选择都会影响最终结局。
              </p>
              {gameStarted && (
                <Button onClick={handleSendHelp} className="mt-4 w-full">
                  请求行动选项
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 游戏主要内容区 - 填充大部分空间 */}
      <div className="flex-grow" />

      {/* 对话框部分 - 固定在底部 */}
      <div className="w-full">
        <Card className="m-6 rounded-lg bg-background/80 backdrop-blur-sm border-background/30 h-[400px]">
          <div className="flex flex-col md:flex-row">
            {/* 左侧对话区域 - 占2/3宽度 */}
            <div className="p-4 md:w-2/3 border-r border-background/30">
              <div className="max-h-[280px] overflow-y-auto mb-4 prose prose-sm dark:prose-invert">
                {!gameStarted ? (
                  // 游戏未开始时显示介绍
                  <div className="whitespace-pre-wrap markdown-content">
                    <CustomMarkdown>{gameIntroduction}</CustomMarkdown>
                  </div>
                ) : (
                  // 游戏开始后显示游戏内容
                  messages.map((message, messageIndex) => {
                    // 只显示助手（教授）的消息作为剧情
                    if (message.role === "assistant") {
                      if (message.parts) {
                        // 处理带有parts的消息
                        return (
                          <div key={message.id} className="mb-4">
                            {message.parts.map((part, partIndex) => {
                              if (part.type === "text") {
                                // 高亮显示天数标记
                                const textWithDayHighlight = part.text.replace(
                                  /【第(\d+)天】/g,
                                  '<span class="font-bold text-amber-600 dark:text-amber-400">【第$1天】</span>'
                                );

                                return (
                                  <div
                                    key={`${messageIndex}-${partIndex}`}
                                    className="text-sm whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                      __html: textWithDayHighlight,
                                    }}
                                  />
                                );
                              }

                              if (part.type === "tool-invocation") {
                                const toolInvocation = part.toolInvocation;

                                // 显示用户选择的结果，但不显示选项本身
                                if (
                                  toolInvocation.toolName === "renderChoices" &&
                                  toolInvocation.state === "result"
                                ) {
                                  return (
                                    <div
                                      key={`${messageIndex}-${partIndex}`}
                                      className="my-2 text-sm italic text-muted-foreground border-l-2 border-primary pl-2"
                                    >
                                      你选择了: {toolInvocation.result}
                                    </div>
                                  );
                                }

                                // 显示骰子结果
                                if (
                                  toolInvocation.toolName === "rollADice" &&
                                  toolInvocation.state === "result"
                                ) {
                                  const result = parseInt(
                                    toolInvocation.result
                                  );
                                  const isSuccess = result > 10;
                                  return (
                                    <div
                                      key={`${messageIndex}-${partIndex}`}
                                      className={`my-2 text-sm italic ${
                                        isSuccess
                                          ? "text-green-600"
                                          : "text-red-600"
                                      } border-l-2 border-primary pl-2`}
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
                        // 处理普通文本消息
                        // 高亮显示天数标记
                        const textWithDayHighlight = message.content.replace(
                          /【第(\d+)天】/g,
                          '<span class="font-bold text-amber-600 dark:text-amber-400">【第$1天】</span>'
                        );

                        return (
                          <div
                            key={message.id}
                            className="mb-4 text-sm whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: textWithDayHighlight,
                            }}
                          />
                        );
                      }
                    } else if (
                      message.role === "user" &&
                      typeof message.content === "string"
                    ) {
                      // 用户的消息显示为选择
                      return (
                        <div
                          key={message.id}
                          className="my-2 text-sm italic text-muted-foreground border-l-2 border-primary pl-2"
                        >
                          你说: {message.content}
                        </div>
                      );
                    }
                    return null;
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 右侧选项区域 - 占1/3宽度 */}
            <div className="p-4 md:w-1/3 bg-background/40 rounded-lg">
              <div className="h-full flex flex-col">
                <h3 className="text-sm font-medium mb-3 text-center">
                  互动区域
                </h3>

                {/* 显示当前可用选项或骰子 */}
                <div className="flex-grow overflow-y-auto">
                  {renderInteractionPanel()}
                </div>

                <div className="mt-4 text-xs text-center text-muted-foreground">
                  <Badge variant="outline" className="bg-black/20">
                    <Calendar className="h-3 w-3 mr-1" />第{gameDay}/9天
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
