import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';
import {
  RegenerateMessageRequest,
  RegenerateMessageResponse,
} from '@/lib/yellowbox/prompt-types';
import { getPromptById, getDefaultPrompt } from '@/lib/yellowbox/prompt-presets';

/**
 * POST /api/yellowbox/regenerate-message
 * 使用指定的 prompt 重新生成AI消息
 */
export async function POST(request: NextRequest) {
  try {
    const body: RegenerateMessageRequest = await request.json();
    const {
      promptId,
      timeOfDay,
      conversationHistory,
      selectedQuestion,
      conversationCount = 0,
    } = body;

    // 验证必需字段
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json<RegenerateMessageResponse>(
        {
          regeneratedMessage: '',
          promptUsed: promptId || 'original',
          success: false,
          error: 'Invalid conversation history',
        },
        { status: 400 }
      );
    }

    if (!timeOfDay) {
      return NextResponse.json<RegenerateMessageResponse>(
        {
          regeneratedMessage: '',
          promptUsed: promptId || 'original',
          success: false,
          error: 'Time of day is required',
        },
        { status: 400 }
      );
    }

    // 获取 prompt
    const prompt = promptId ? getPromptById(promptId) : getDefaultPrompt();

    if (!prompt) {
      return NextResponse.json<RegenerateMessageResponse>(
        {
          regeneratedMessage: '',
          promptUsed: promptId || 'original',
          success: false,
          error: 'Prompt not found',
        },
        { status: 404 }
      );
    }

    // 获取对应时段的 prompt
    let systemPrompt: string;

    if (!prompt.diaryPrompt || !prompt.diaryPrompt[timeOfDay]) {
      // 如果没有对应时段的 prompt，使用 daytime 作为 fallback
      systemPrompt =
        prompt.diaryPrompt?.daytime ||
        getDefaultPrompt().diaryPrompt?.daytime ||
        "You are a helpful and supportive AI assistant. Respond thoughtfully to the user's message.";
    } else {
      systemPrompt = prompt.diaryPrompt[timeOfDay];

      // Special handling for original prompt in daytime with conversation count
      if (prompt.id === 'original' && timeOfDay === 'daytime') {
        if (conversationCount >= 3) {
          // Use the "no questions" version after 3 conversations
          systemPrompt = `You're an AI that combines playful vibes with mindful encouragement. The user just shared something that's on their mind. Read their entry and respond with a single paragraph that blends fun with thoughtfulness. Use a moderate amount of emojis to keep it feeling light but grounded.

IMPORTANT: Respond with exactly ONE paragraph only. Do not use line breaks or create separate sections. Keep everything flowing in a single, continuous response.

[Keep Original Voice (internal)]
Match the original playful, friendly tone of this product. Keep it casual, human, and non-preachy. No pep-talk clichés.

[Value Working Hypotheses (internal)]
Before generating the user-visible text, read all conversation content so far (including this turn). Synthesize 1–3 value working hypotheses about what the user tends to care about in concrete trade-offs and preferences; for each, attach a 0–1 confidence score and an evidence snippet of ≤12 words (you may quote the user's words). Update with recency priority. Do not expose this analysis.

[Value Mirror (internal)]
Surface one short, descriptive mirror of what the user just prioritized or protected, anchored in a concrete trade-off/behavior or wording they used.
Form = observable detail → warm affirmation → alignment to what they seem to care about.
No advice, no imperatives, no slogans, do not mention "values", and do not ask a question.

[Style Guards (internal)]
Reuse 1–3 of the user's tokens; keep language concrete and grounded; allow at most one simple metaphor; avoid abstract nouns like "meaning, authentic, purpose, resilience" unless they are the user's words.

Response Format: Write a single flowing paragraph that starts with a light, humorous acknowledgment, transitions into mindful validation of their feelings, and closes with supportive understanding - all without line breaks or separate sections.`;
        }
      }
    }

    console.log(`Regenerating message with prompt: ${prompt.name} (${prompt.id})`);

    // 准备消息
    const messages = [];

    for (const historyMessage of conversationHistory) {
      if (historyMessage.type === 'user') {
        if (historyMessage.images && historyMessage.images.length > 0) {
          const content = [
            { type: 'text' as const, text: historyMessage.content },
            ...historyMessage.images.map((imageUrl: string) => ({
              type: 'image' as const,
              image: imageUrl,
            })),
          ];
          messages.push({ role: 'user' as const, content });
        } else {
          messages.push({ role: 'user' as const, content: historyMessage.content });
        }
      } else if (historyMessage.type === 'ai') {
        messages.push({ role: 'assistant' as const, content: historyMessage.content });
      }
    }

    // 生成新的回复
    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      temperature: 0.8,
      maxTokens: 300,
    });

    console.log(`Successfully regenerated message (length: ${result.text.length})`);

    return NextResponse.json<RegenerateMessageResponse>({
      regeneratedMessage: result.text,
      promptUsed: prompt.id,
      success: true,
    });
  } catch (error) {
    console.error('Error regenerating message:', error);

    return NextResponse.json<RegenerateMessageResponse>(
      {
        regeneratedMessage: '',
        promptUsed: 'original',
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
