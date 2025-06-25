"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@ai-sdk/react";
import { Loader2, Sparkles, Clock, Tag, Users, Lightbulb, Settings, Eye, EyeOff } from "lucide-react";
import { VoiceInput } from "@/components/voice-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface OrganizedTask {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
  category: string;
  dependencies?: string[];
  tips?: string;
}

interface ManifestationResult {
  analysis: string;
  organizedTasks: OrganizedTask[];
  suggestions: string[];
}

const DEFAULT_PROMPT = `你是一个专业的任务管理助手，擅长分析和重新组织用户的待办事项。你的职责是：

1. 分析用户输入的任务内容（可能是结构化的待办事项列表，也可能是一段描述性文字）
2. 识别任务的重要性和紧急程度
3. 按照优先级重新整理任务
4. 为模糊的任务提供更具体的描述
5. 识别任务之间的依赖关系
6. 提供时间估算建议

请使用 organizeTodos 工具来输出重新整理后的任务列表。

分析原则：
- 重要性：对目标达成影响程度
- 紧急性：时间敏感程度
- 可行性：当前条件下完成难度
- 依赖性：与其他任务的关联程度

优先级分类：
- 高优先级：重要且紧急
- 中优先级：重要但不紧急，或紧急但不重要
- 低优先级：既不重要也不紧急

请用中文回复。`;

export default function ManifestationPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ManifestationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(DEFAULT_PROMPT);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { append } = useChat({
    api: "/api/manifestation",
    initialMessages: [],
    body: {
      customPrompt: isDebugMode ? customPrompt : undefined,
    },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "organizeTodos" && toolCall.args) {
        const { analysis, organizedTasks, suggestions } = toolCall.args as ManifestationResult;
        setResult({ analysis, organizedTasks, suggestions });
        setIsProcessing(false);
        return "任务整理完成";
      }
      return null;
    },
  });

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      await append({
        role: "user",
        content: `请帮我分析并重新整理以下任务内容：\n\n${input}`,
      });
    } catch (error) {
      console.error("Error processing manifestation:", error);
      setIsProcessing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "高优先级";
      case "medium":
        return "中优先级";
      case "low":
        return "低优先级";
      default:
        return priority;
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Manifestation
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDebugMode(!isDebugMode)}
              className={isDebugMode ? "bg-primary/10 border-primary" : ""}
            >
              {isDebugMode ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {isDebugMode ? "关闭调试" : "调试模式"}
            </Button>
            {isDebugMode && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-1" />
                    编辑 Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>自定义 AI Prompt</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">系统提示词:</label>
                      <Textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={20}
                        className="mt-2"
                        placeholder="输入自定义的 AI 提示词..."
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCustomPrompt(DEFAULT_PROMPT);
                        }}
                      >
                        重置为默认
                      </Button>
                      <Button onClick={() => setIsDialogOpen(false)}>
                        保存
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <p className="text-muted-foreground">
          输入你的待办事项或想法，AI 将帮你智能整理并优化任务优先级
          {isDebugMode && <span className="text-primary ml-2">（调试模式已启用）</span>}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>输入你的任务内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="你可以输入：
1. 结构化的待办事项列表
2. 一段描述性的文字
3. 任何需要整理的任务想法

例如：明天要开会讨论项目进度，还要完成PPT，需要买菜做饭，记得给妈妈打电话...

💡 提示：可以使用语音输入功能"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI 正在整理中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  开始整理
                </>
              )}
            </Button>
            <VoiceInput
              onTranscriptionComplete={(text) => {
                if (input.trim()) {
                  setInput(input + '\n\n' + text);
                } else {
                  setInput(text);
                }
              }}
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* 分析总结 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                分析总结
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{result.analysis}</p>
            </CardContent>
          </Card>

          {/* 整理后的任务列表 */}
          <Card>
            <CardHeader>
              <CardTitle>整理后的任务列表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.organizedTasks.map((task, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {task.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {task.category}
                    </div>
                  </div>

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        依赖任务：
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.dependencies.map((dep, depIndex) => (
                          <Badge key={depIndex} variant="outline" className="text-xs">
                            {dep}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.tips && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-800">
                        <strong>💡 完成建议：</strong> {task.tips}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 额外建议 */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>额外建议</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• 可以输入任何形式的任务描述，AI 会自动识别和整理</p>
          <p>• 系统会根据重要性和紧急程度自动分配优先级</p>
          <p>• 会为模糊的任务提供更具体的描述和建议</p>
          <p>• 识别任务间的依赖关系，帮助合理安排执行顺序</p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}