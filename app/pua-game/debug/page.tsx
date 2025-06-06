"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { Calendar, Upload, Info, X, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PuaGameDebug() {
  const [gameDay, setGameDay] = useState(0); // 开始时为0天，表示游戏未开始
  const [backgroundImage, setBackgroundImage] = useState<string | null>("/default-pua-game.png");
  const [showInstructions, setShowInstructions] = useState(false);
  const [isManualRolling, setIsManualRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

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

  // 游戏介绍文本
  const introductionText = `# 学术PUA生存游戏

在这个模拟游戏中，你将扮演一名研究生，面对导师郑凤教授的学术PUA行为。

郑凤教授是学界知名学者，表面光鲜亮丽，实则对学生实施各种学术霸凌手段。作为她的新研究生，你将在接下来的7天内，体验并应对各种PUA情境。

## 游戏机制

1. 每天你将面对不同的学术PUA场景
2. 你可以从多个选项中选择应对方式
3. 系统会通过骰子决定你的行动成功与否
4. 你的选择将影响游戏走向和最终结局

## 可能的结局

- 精神崩溃：心理值过低，无法完成学业
- 实名举报成功：收集足够证据并成功举报
- 双赢苟活：完成学业但心理受创
- 权威崩塌：成功反抗PUA并让导师失去权威
- 集体维权：联合其他学生共同对抗

准备好开始这段艰难的学术之旅了吗？点击右侧的"开始游戏"按钮开始你的故事。`;

  const {
    messages,
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

  // 控制游戏初始消息的显示
  useEffect(() => {
    // 如果游戏刚开始，清除初始消息，等用户点击开始游戏后再显示
    if (!gameStarted && messages.length > 0) {
      // 这里不做任何操作，只在UI层面控制显示
    }
  }, [gameStarted, messages]);

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
  const handleDiceClick = (toolCallId: string) => {
    setIsManualRolling(true);

    // 随机生成1-20的数字
    const randomResult = Math.floor(Math.random() * 20) + 1;

    // 延迟一下，模拟骰子动画
    setTimeout(() => {
      addToolResult({
        toolCallId: toolCallId,
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
            <span>第{gameDay}/7天</span>
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
                游戏将持续7天，每一天的选择都会影响最终结局。
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
        <Card className="m-6 rounded-lg bg-background/80 backdrop-blur-sm border-background/30">
          <div className="flex flex-col md:flex-row">
            {/* 左侧对话区域 - 占2/3宽度 */}
            <div className="p-4 md:w-2/3 border-r border-background/30">
              <div className="max-h-[280px] overflow-y-auto mb-4 prose prose-sm dark:prose-invert">
                {!gameStarted ? (
                  // 显示游戏介绍
                  <div
                    className="whitespace-pre-wrap markdown"
                    dangerouslySetInnerHTML={{
                      __html: introductionText.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>').replace(/^## (.*?)$/gm, '<h3>$1</h3>').replace(/^# (.*?)$/gm, '<h2 class="text-xl font-bold mb-2">$1</h2>'),
                    }}
                  />
                ) : (
                  // 显示游戏内容
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
                                if (toolInvocation.toolName === "renderChoices" &&
                                    toolInvocation.state === "result") {
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
                                if (toolInvocation.toolName === "rollADice" &&
                                    toolInvocation.state === "result") {
                                  const result = parseInt(toolInvocation.result);
                                  const isSuccess = result > 10;
                                  return (
                                    <div
                                      key={`${messageIndex}-${partIndex}`}
                                      className={`my-2 text-sm italic ${isSuccess ? "text-green-600" : "text-red-600"} border-l-2 border-primary pl-2`}
                                    >
                                      🎲 掷骰结果: {result} ({isSuccess ? "成功!" : "失败!"})
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
                    } else if (message.role === "user" && typeof message.content === "string") {
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
                <h3 className="text-sm font-medium mb-3 text-center">互动区域</h3>

                {/* 显示当前可用选项或骰子 */}
                <div className="flex-grow overflow-y-auto">
                  {!gameStarted ? (
                    // 游戏未开始，显示开始游戏按钮
                    <div className="flex flex-col items-center justify-center h-full">
                      <Button
                        onClick={startGame}
                        variant="default"
                        size="lg"
                        className="flex items-center gap-2"
                      >
                        <PlayCircle className="h-5 w-5" />
                        开始游戏
                      </Button>
                    </div>
                  ) : messages.length > 0 && messages[messages.length - 1].parts ? (
                    (() => {
                      const lastMessage = messages[messages.length - 1];
                      if (lastMessage.role !== "assistant" || !lastMessage.parts) {
                        return (
                          <div className="text-sm text-center text-muted-foreground py-4">
                            等待教授的回应...
                          </div>
                        );
                      }

                      // 寻找最后一个renderChoices工具调用
                      const choicesPart = lastMessage.parts.find(
                        (part) =>
                          part.type === "tool-invocation" &&
                          part.toolInvocation.toolName === "renderChoices" &&
                          part.toolInvocation.state === "call"
                      );

                      // 寻找最后一个rollADice工具调用
                      const dicePart = lastMessage.parts.find(
                        (part) =>
                          part.type === "tool-invocation" &&
                          part.toolInvocation.toolName === "rollADice" &&
                          part.toolInvocation.state === "call"
                      );

                      // 优先显示选项，如果没有选项但有骰子，则显示骰子
                      if (choicesPart && choicesPart.type === "tool-invocation") {
                        const toolInvocation = choicesPart.toolInvocation;
                        const choices = toolInvocation.args.choices as string[];

                        return (
                          <div className="space-y-2">
                            <div className="text-center mb-3 text-sm text-muted-foreground">请选择你的行动:</div>
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
                      } else if (dicePart && dicePart.type === "tool-invocation") {
                        // 显示骰子界面
                        return (
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="text-center mb-4 text-sm">
                              点击骰子来决定你的行动结果
                            </div>
                            <button
                              onClick={() => !isManualRolling && handleDiceClick(dicePart.toolInvocation.toolCallId)}
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
                      }

                      // 检查是否有已完成的骰子结果需要显示
                      const diceResultPart = lastMessage.parts.find(
                        (part) =>
                          part.type === "tool-invocation" &&
                          part.toolInvocation.toolName === "rollADice" &&
                          part.toolInvocation.state === "result"
                      );

                      if (diceResultPart && diceResultPart.type === "tool-invocation" &&
                          diceResultPart.toolInvocation.state === "result") {
                        const result = parseInt(diceResultPart.toolInvocation.result);
                        const isSuccess = result > 10;

                        return (
                          <div className="flex flex-col items-center justify-center py-4">
                            <div className="text-center mb-4 text-sm font-medium">
                              骰子结果已出:
                            </div>
                            <div className="w-24 h-24 mb-4 bg-background/60 rounded-lg flex items-center justify-center">
                              <div className="text-4xl font-bold">{result}</div>
                            </div>
                            <div className={`text-center font-semibold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                              {isSuccess ? "成功!" : "失败!"}
                            </div>
                            <div className="mt-3 text-sm text-muted-foreground text-center">
                              等待教授的回应...
                            </div>
                          </div>
                        );
                      }

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
                    })()
                  ) : (
                    <div className="text-sm text-center text-muted-foreground py-4">
                      等待对话开始...
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-center text-muted-foreground">
                  <Badge variant="outline" className="bg-black/20">
                    <Calendar className="h-3 w-3 mr-1" />
                    第{gameDay}/7天
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
