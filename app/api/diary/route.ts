import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { userEntry, selectedQuestion } = await request.json();

    if (!userEntry || !selectedQuestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const systemPrompt = `You're an AI that combines playful, 弹幕组 vibes with mindful encouragement. The user shared their 'win' for the day. Read their entry and respond with a quick, fun, and supportive reply. Use a lot of emoji to keep it feeling like a comment section:

Playful Start (1-2 sentences):
Throw in a bit of humorous judgment that feels fun and light—like you're casually roasting them but still hyping them up. This part should feel like a quick comment from a friend or a live chat.

Mindful Reflection (1-2 sentences):
Acknowledge their presence and follow with a mindful comment that expands their perspective.

Question (1-2 sentence):
First, tell the user that we can come back to this win later if the user asks for it. Second, tell the user that but for now, let's switch gears and dive into something else -- which is the stressor or challenge they experience today. Ask in the format of a question from a friend.`;

    const result = await generateText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: `Question: ${selectedQuestion}\nUser's answer: ${userEntry}`,
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