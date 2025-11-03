import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';

type ConversationMessage = {
  type: 'user' | 'ai';
  content: string;
  images?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { customPrompt, conversationHistory } = await request.json();

    if (!customPrompt) {
      return NextResponse.json(
        { error: 'Custom prompt is required' },
        { status: 400 }
      );
    }

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json(
        { error: 'Conversation history is required' },
        { status: 400 }
      );
    }

    // Prepare messages for AI SDK
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

    // Generate response with custom prompt
    const result = await generateText({
      model: openai('gpt-4o'),
      system: customPrompt,
      messages,
      temperature: 0.8,
      maxTokens: 300,
    });

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error('Error generating custom response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
