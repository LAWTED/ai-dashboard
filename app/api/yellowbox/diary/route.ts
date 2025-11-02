import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';
import { getSystemPrompt, type CustomPrompts } from '@/lib/yellowbox/prompts';

export async function POST(request: NextRequest) {
  try {
    const {
      userEntry,
      selectedQuestion,
      timeOfDay,
      conversationCount,
      images,
      conversationHistory = [],
      customPrompts
    } = await request.json();

    if (!userEntry || !selectedQuestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use getSystemPrompt to handle custom and default prompts
    const systemPrompt = getSystemPrompt(timeOfDay, conversationCount, customPrompts);

    // Prepare messages for AI SDK with conversation history and multimodal support
    const messages = [];
    
    // Add conversation history first
    for (const historyMessage of conversationHistory) {
      if (historyMessage.type === 'user') {
        if (historyMessage.images && historyMessage.images.length > 0) {
          const content = [
            { type: 'text', text: historyMessage.content },
            ...historyMessage.images.map((imageUrl: string) => ({
              type: 'image' as const,
              image: imageUrl
            }))
          ];
          messages.push({ role: 'user' as const, content });
        } else {
          messages.push({ role: 'user' as const, content: historyMessage.content });
        }
      } else if (historyMessage.type === 'ai') {
        messages.push({ role: 'assistant' as const, content: historyMessage.content });
      }
    }
    
    // Add the current user message
    if (images && images.length > 0) {
      const content = [
        { type: 'text', text: userEntry },
        ...images.map((imageUrl: string) => ({
          type: 'image' as const,
          image: imageUrl
        }))
      ];
      messages.push({ role: 'user' as const, content });
    } else {
      messages.push({ role: 'user' as const, content: userEntry });
    }

    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      temperature: 0.8,
      maxTokens: 300,
    });

    return NextResponse.json({ response: result.text });
  } catch (error) {
    console.error('Error in diary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}