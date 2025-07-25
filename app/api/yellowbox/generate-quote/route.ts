import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if request body contains specific content for quote generation
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const supabase = await createClient();

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If specific content is provided, use it for quote generation
    if (body.content || body.aiSummary) {
      const { content, aiSummary, emotion, themes, language } = body;

      // Create a prompt for quote generation
      const prompt = language === "zh" 
        ? `基于以下日记内容，生成一句富有诗意和启发性的引言。引言应该捕捉文本的核心情感和主题，长度在15-30个字之间，要优美、深刻且富有哲理性。

日记内容：${content || aiSummary}
${emotion ? `情感基调：${emotion}` : ''}
${themes && themes.length > 0 ? `主题：${themes.join(', ')}` : ''}

请直接返回引言，不要包含任何解释或额外文字。引言要能够独立存在，给人以思考和启发。`
        : `Based on the following diary content, generate a poetic and inspirational quote. The quote should capture the core emotion and themes of the text, be 10-25 words long, and be beautiful, profound, and philosophical.

Diary content: ${content || aiSummary}
${emotion ? `Emotional tone: ${emotion}` : ''}
${themes && themes.length > 0 ? `Themes: ${themes.join(', ')}` : ''}

Please return only the quote without any explanation or additional text. The quote should be able to stand alone and provide inspiration and reflection.`;

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: prompt,
        temperature: 0.8,
      });

      // Clean up the quote - remove quotes if they were added by the AI
      let quote = result.text.trim();
      if ((quote.startsWith('"') && quote.endsWith('"')) || 
          (quote.startsWith("'") && quote.endsWith("'"))) {
        quote = quote.slice(1, -1);
      }

      return NextResponse.json({
        success: true,
        quote: quote,
      });
    }

    // Original logic: 获取用户的所有entries
    const { data: entries, error: entriesError } = await supabase
      .from("yellowbox_entries")
      .select("entries, metadata, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

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
    const selectedQuote = quotes[0];

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

  // 智能文字换行逻辑
  const maxCharsPerLine = 24;
  const lines: string[] = [];
  let currentLine = '';

  for (const char of quote) {
    if (currentLine.length < maxCharsPerLine) {
      currentLine += char;
    } else {
      lines.push(currentLine);
      currentLine = char;
    }
  }
  if (currentLine) lines.push(currentLine);

  // 动态调整字体大小和行高
  const fontSize = quote.length > 60 ? 22 : quote.length > 40 ? 26 : 30;
  const lineHeight = fontSize * 1.5;
  const textHeight = lines.length * lineHeight;
  const svgHeight = Math.max(500, textHeight + 280);

  return `<svg width="900" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- 渐变背景定义 -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FEF3C7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FACC15;stop-opacity:1" />
    </linearGradient>

    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFBEB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FEF3C7;stop-opacity:1" />
    </linearGradient>

    <!-- 阴影滤镜 -->
    <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
    </filter>

    <!-- 文字阴影 -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation="1" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
  </defs>

  <!-- 主背景 -->
  <rect width="900" height="${svgHeight}" fill="url(#bgGradient)"/>

  <!-- 装饰圆点 -->
  <circle cx="100" cy="80" r="3" fill="#E4BE10" opacity="0.6"/>
  <circle cx="800" cy="100" r="2" fill="#C04635" opacity="0.4"/>
  <circle cx="120" cy="${svgHeight - 60}" r="2.5" fill="#E4BE10" opacity="0.5"/>
  <circle cx="780" cy="${svgHeight - 80}" r="3" fill="#C04635" opacity="0.3"/>

  <!-- 主卡片区域 -->
  <rect x="80" y="80" width="740" height="${svgHeight - 200}"
        fill="url(#cardGradient)"
        stroke="#E4BE10"
        stroke-width="3"
        rx="24"
        ry="24"
        filter="url(#dropshadow)"/>

  <!-- 内层边框 -->
  <rect x="90" y="90" width="720" height="${svgHeight - 220}"
        fill="none"
        stroke="#F59E0B"
        stroke-width="1"
        rx="18"
        ry="18"
        opacity="0.3"/>

  <!-- 左上角装饰引号 -->
  <text x="120" y="150"
        font-family="serif"
        font-size="48"
        fill="#C04635"
        opacity="0.4"
        font-weight="bold">"</text>

  <!-- 主文字内容区域 -->
  <g transform="translate(150, 180)">
    ${lines
      .map(
        (line, index) =>
          `<text x="0" y="${index * lineHeight}"
                 font-family="'Georgia', serif"
                 font-size="${fontSize}"
                 fill="#1F2937"
                 text-anchor="start"
                 filter="url(#textShadow)"
                 font-weight="400"
                 letter-spacing="0.5px">${line}</text>`
      )
      .join("")}
  </g>

  <!-- 右下角装饰引号 -->
  <text x="750" y="${180 + textHeight + 40}"
        font-family="serif"
        font-size="48"
        fill="#C04635"
        opacity="0.4"
        font-weight="bold"
        text-anchor="end">"</text>

  <!-- 分割线 -->
  <line x1="150" y1="${180 + textHeight + 60}"
        x2="750" y2="${180 + textHeight + 60}"
        stroke="#E4BE10"
        stroke-width="2"
        opacity="0.6"/>

  <!-- 署名区域 -->
  <text x="750" y="${180 + textHeight + 90}"
        font-family="'Helvetica', sans-serif"
        font-size="20"
        fill="#374151"
        text-anchor="end"
        font-weight="500"
        filter="url(#textShadow)">— ${userName}</text>

  <text x="750" y="${180 + textHeight + 115}"
        font-family="'Helvetica', sans-serif"
        font-size="16"
        fill="#6B7280"
        text-anchor="end"
        font-weight="400">${date}</text>

  <!-- 底部Logo区域背景 -->
  <rect x="350" y="${svgHeight - 80}" width="200" height="40"
        fill="#F59E0B"
        rx="20"
        opacity="0.8"/>

  <!-- YellowBox标识 -->
  <text x="450" y="${svgHeight - 55}"
        font-family="'Georgia', serif"
        font-size="18"
        fill="#FFFFFF"
        text-anchor="middle"
        font-weight="bold"
        letter-spacing="1px">YELLOW BOX</text>

  <!-- 装饰小星星 -->
  <polygon points="200,120 203,127 210,127 205,132 207,139 200,135 193,139 195,132 190,127 197,127"
           fill="#F59E0B" opacity="0.4"/>
  <polygon points="700,160 702,165 707,165 704,168 705,173 700,170 695,173 696,168 693,165 698,165"
           fill="#C04635" opacity="0.3"/>
</svg>`;
}