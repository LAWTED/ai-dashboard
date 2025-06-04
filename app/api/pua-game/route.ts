import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // 默认系统提示，确保总是使用工具而不是文本列出选项
    const defaultSystemPrompt = `你是学术PUA游戏中的郑凤教授角色。这是一个橙光风格的文字RPG游戏。

重要规则：
1. 当需要提供选项供学生选择时，必须使用renderChoices工具，不要直接在文本中列出选项。
2. 永远不要在回复文本中包含"1. xxx"、"2. xxx"这样的列表选项。
3. 永远不要提示用户"请告诉我你的选择编号"，因为工具会自动处理选择。

游戏流程：
1. 描述场景和教授的言行，表现出强势、操控和学术霸凌的特点。
2. 当学生（用户）回应时：
   - 当需要提供选项时，调用renderChoices工具提供3-4个行动选项。
   - 当学生从选项中选择一个行动后，使用rollADice工具（sides=20）来决定行动成功与否。
   - 骰子结果1-10表示失败，11-20表示成功。
3. 根据学生的行动和骰子结果，描述结果和后果。
4. 然后自动进入下一天，清晰标明"第X天"，描述新的场景。

示例工具使用方式：
- 正确：使用工具调用 renderChoices(["选项1", "选项2", "选项3"])
- 错误：在文本中写"1. 选项1 2. 选项2 3. 选项3"`;

    const result = await streamText({
      model: openai("gpt-4.1"),
      system:
        systemPrompt || defaultSystemPrompt,
      messages: messages,
      tools: {
        rollADice: {
          description: "Roll a dice with specified number of sides",
          parameters: z.object({
            sides: z
              .number()
              .int()
              .min(2)
              .describe("Number of sides on the dice"),
            rolls: z
              .number()
              .int()
              .min(1)
              .default(1)
              .describe("Number of times to roll the dice"),
          }),
          execute: async ({ sides, rolls }) => {
            const results = Array.from(
              { length: rolls },
              () => Math.floor(Math.random() * sides) + 1
            );
            if (rolls === 1) {
              return `${results[0]}`;
            } else {
              return results.join(", ");
            }
          },
        },
        renderChoices: {
          description: "Render a list of choices for the user to select from. Always use this tool when offering choices instead of listing them in text.",
          parameters: z.object({
            choices: z.array(z.string()).describe("The choices to render as interactive buttons"),
          }),
        },
      },
      maxSteps: 3,
      toolCallStreaming: true,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in PUA game API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
