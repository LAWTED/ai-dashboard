import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { deepseek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'openai', customPrompt } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // 根据参数选择模型
    const selectedModel = model === 'openai'
      ? openai("gpt-4o")
      : deepseek("deepseek-chat");

    const systemPrompt = `你是一个专业的任务管理助手，擅长分析和重新组织用户的待办事项。你的职责是：

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

    const result = await streamText({
      model: selectedModel,
      system: customPrompt || systemPrompt,
      messages: messages,
      tools: {
        organizeTodos: {
          description: "重新整理和优化用户的待办事项列表",
          parameters: z.object({
            analysis: z.string().describe("对用户输入任务的分析总结"),
            organizedTasks: z.array(
              z.object({
                title: z.string().describe("任务标题"),
                description: z.string().describe("任务详细描述"),
                priority: z.enum(["high", "medium", "low"]).describe("优先级"),
                estimatedTime: z.string().describe("预估完成时间"),
                category: z.string().describe("任务分类"),
                dependencies: z.array(z.string()).describe("依赖的其他任务").optional(),
                tips: z.string().describe("完成建议").optional()
              })
            ).describe("重新整理后的任务列表"),
            suggestions: z.array(z.string()).describe("额外的建议和优化意见")
          })
        }
      },
      experimental_continueSteps: true,
      maxSteps: 1,
      toolCallStreaming: true,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in manifestation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}