import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateObject } from 'ai';
import { z } from 'zod';

type ConversationMessage = {
  type: "user" | "ai";
  content: string;
};

// Define the schema for the enhanced summary response
const SummarySchema = z.object({
  title: z.string().describe('A concise title summarizing the main theme (5-8 words)'),
  tags: z.array(z.string()).max(5).describe('Up to 5 relevant tags/keywords'),
  values: z.array(z.string()).max(3).describe('Up to 3 core values reflected in this entry (e.g., authenticity, connection, boundaries, autonomy, balance, growth, creativity)'),
  emotion: z.object({
    primary: z.string().describe('Primary emotion detected (e.g., happy, reflective, anxious, grateful, etc.)'),
    intensity: z.enum(['low', 'medium', 'high']).describe('Emotional intensity level'),
    confidence: z.number().min(0).max(1).describe('Confidence score for emotion detection (0-1)')
  }),
  themes: z.array(z.string()).max(3).describe('Up to 3 main themes or topics discussed')
});

type EnhancedSummary = z.infer<typeof SummarySchema>;

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, language, selectedQuestion, timeOfDay } = await request.json();

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty conversation history' },
        { status: 400 }
      );
    }

    // Create conversation context
    const conversationText = conversationHistory
      .map((msg: ConversationMessage) => `${msg.type}: ${msg.content}`)
      .join('\n');

    // Build system prompt based on language and time of day
    const isChinese = language === 'zh';
    const timeContext = timeOfDay === 'morning' ? 'morning reflection' : 
                       timeOfDay === 'evening' ? 'evening reflection' : 
                       'daytime writing';

    let systemPrompt: string;

    if (isChinese) {
      systemPrompt = `你是一个AI助手，专门为用户的日记和反思内容生成详细的分析摘要。

任务要求：
- 分析用户的对话内容，理解其核心主题和情感状态
- 生成一个5-8个汉字的简洁标题，捕捉最重要的主题
- 识别最多5个相关的标签/关键词
- 分析主要情绪和情绪强度
- 识别最多3个主要话题或主题
- 风格应该自然、亲切，避免过于正式

对话类型：${timeContext}
原始问题：${selectedQuestion}

请根据整个对话内容生成结构化的分析结果。`;
    } else {
      systemPrompt = `You are an AI assistant specialized in generating detailed analytical summaries for users' journal entries and reflections.

Requirements:
- Analyze the conversation content to understand core themes and emotional states
- Generate a concise title of 5–8 words capturing the most important theme
- Identify up to 5 relevant tags/keywords
- Identify up to 3 core values reflected in this entry (authenticity, connection, boundaries, autonomy, balance, growth, creativity, etc.)
- Analyze primary emotion and emotional intensity
- Identify up to 3 main topics or themes discussed
- Style should be natural and warm, avoiding overly formal language

Conversation type: ${timeContext}
Original question: ${selectedQuestion}

Please generate a structured analysis based on the entire conversation content.`;
    }

    const result = await generateObject({
      model: openai('gpt-4o'),
      system: systemPrompt,
      prompt: `Conversation:\n${conversationText}`,
      schema: SummarySchema,
      temperature: 0.7,
    });

    const enhancedSummary: EnhancedSummary = result.object;

    return NextResponse.json({ 
      success: true,
      summary: enhancedSummary.title, // Keep backward compatibility
      enhanced: enhancedSummary,
      language: language 
    });
  } catch (error) {
    console.error('Error in generate-summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}