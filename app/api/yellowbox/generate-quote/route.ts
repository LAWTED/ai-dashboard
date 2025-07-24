import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { openai } from "@/lib/ai-sdk-client";

interface ConversationMessage {
  type: "user" | "ai";
  content: string;
}

interface EntryData {
  entries?: {
    conversationHistory?: ConversationMessage[];
  };
  metadata?: Record<string, unknown>;
  created_at: string;
}

export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 获取用户的所有entries
    const { data: entries, error: entriesError } = await supabase
      .from("yellowbox_entries")
      .select("entries, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20); // 最多获取最近20条记录

    if (entriesError) {
      console.error("Error fetching entries:", entriesError);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json({ error: "No entries found" }, { status: 404 });
    }

    // 提取所有文字内容
    const userTexts: string[] = [];
    entries.forEach((entry: EntryData) => {
      if (entry.entries?.conversationHistory) {
        entry.entries.conversationHistory.forEach(
          (message: ConversationMessage) => {
            if (message.content) {
              userTexts.push(message.content);
            }
          }
        );
      }
    });

    if (userTexts.length === 0) {
      return NextResponse.json(
        { error: "No user content found" },
        { status: 404 }
      );
    }

    // 使用AI提取精彩词句
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `你是一个文字编辑专家。从用户的日记条目中提取最优美、最有意义的句子或段落。请选择：
1. 最有深度和哲理的句子
2. 最具情感价值的表达
3. 最优美的文字
4. 最能代表用户思考的片段

要求：
- 选择的文字长度在10-80字之间
- 保持原文的完整性和语境
- 优先选择完整的句子或段落
- 避免选择过于私人或敏感的内容
- 返回1-3个最佳选择

请直接返回选中的文字，每个选择一行，不要添加任何解释。`,
        },
        {
          role: "user",
          content: `请从以下文字中提取精彩片段：\n\n${userTexts.join(
            "\n\n---\n\n"
          )}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    const extractedQuotes = text.trim();
    if (!extractedQuotes) {
      return NextResponse.json(
        { error: "Failed to extract quotes" },
        { status: 500 }
      );
    }

    // 分割多个选择
    const quotes = extractedQuotes
      .split("\n")
      .filter((q: string) => q.trim().length > 0);
    const selectedQuote = quotes[0]; // 选择第一个

    // 生成图片数据（SVG格式）
    const svgContent = generateQuoteImage(selectedQuote, user.email || "用户");

    return NextResponse.json({
      success: true,
      quote: selectedQuote,
      alternatives: quotes.slice(1),
      svg: svgContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateQuoteImage(quote: string, userEmail: string): string {
  const userName = userEmail.split("@")[0];
  const date = new Date().toLocaleDateString("zh-CN");

  // 计算文字长度来调整字体大小
  const fontSize = quote.length > 50 ? 24 : quote.length > 30 ? 28 : 32;
  const lineHeight = fontSize * 1.4;

  // 简单的文字换行逻辑
  const maxCharsPerLine = 20;
  const lines: string[] = [];
  for (let i = 0; i < quote.length; i += maxCharsPerLine) {
    lines.push(quote.substring(i, i + maxCharsPerLine));
  }

  const textHeight = lines.length * lineHeight;
  const svgHeight = Math.max(400, textHeight + 200);

  return `
<svg width="800" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <rect width="800" height="${svgHeight}" fill="#FACC15"/>

  <!-- 主内容区域 -->
  <rect x="60" y="60" width="680" height="${
    svgHeight - 180
  }" fill="#FEF3C7" stroke="#E4BE10" stroke-width="2" rx="16"/>

  <!-- 引号装饰 -->
  <text x="100" y="130" font-family="serif" font-size="60" fill="#C04635" opacity="0.3">"</text>

  <!-- 主文字内容 -->
  <g transform="translate(120, 160)">
    ${lines
      .map(
        (line, index) =>
          `<text x="0" y="${
            index * lineHeight
          }" font-family="serif" font-size="${fontSize}" fill="#3B3109" text-anchor="start">${line}</text>`
      )
      .join("")}
  </g>

  <!-- 结束引号 -->
  <text x="660" y="${
    160 + textHeight + 20
  }" font-family="serif" font-size="60" fill="#C04635" opacity="0.3">"</text>

  <!-- 署名 -->
  <text x="680" y="${
    svgHeight - 120
  }" font-family="sans-serif" font-size="18" fill="#3B3109" text-anchor="end">— ${userName}</text>
  <text x="680" y="${
    svgHeight - 95
  }" font-family="sans-serif" font-size="16" fill="#3B3109" text-anchor="end" opacity="0.7">${date}</text>

  <!-- YellowBox标识 -->
  <text x="400" y="${
    svgHeight - 40
  }" font-family="serif" font-size="20" fill="#3B3109" text-anchor="middle" font-weight="bold">YELLOW BOX</text>
</svg>`;
}
