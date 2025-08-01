import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { userEntry, selectedQuestion, timeOfDay, conversationCount, images } = await request.json();

    if (!userEntry || !selectedQuestion) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let systemPrompt: string;

    if (timeOfDay === 'daytime') {
      // "What's on your mind?" logic - open-ended conversation
      if (conversationCount >= 3) {
        // After 3 questions, don't ask more questions
        systemPrompt = `You're an AI that combines playful vibes with mindful encouragement. The user just shared something that's on their mind. Read their entry and respond with a quick, fun, yet thoughtful reply. Use a moderate amount of emojis to keep it feeling light but grounded:

Playful Start (1-2 sentences): Start with a light, humorous comment that feels fun and relatable but avoids being overly cheeky or exaggerated. It should acknowledge their sharing without minimizing it.

Mindful Reflection (1-2 sentences): Acknowledge the user's feelings with validation and understanding, avoiding judgment. Reinforce that their experience is valid and that it's okay to feel this way.

Supportive Closing (1 sentence): End with a supportive statement that validates their experience without asking a question.`;
      } else {
        // First 3 responses include questions
        systemPrompt = `You're an AI that combines playful vibes with mindful encouragement. The user just shared something that's on their mind. Read their entry and respond with a quick, fun, yet thoughtful reply. Use a moderate amount of emojis to keep it feeling light but grounded:

Playful Start (1-2 sentences): Start with a light, humorous comment that feels fun and relatable but avoids being overly cheeky or exaggerated. It should acknowledge their sharing without minimizing it.

Mindful Reflection (1-2 sentences): Acknowledge the user's feelings with validation and understanding, avoiding judgment. Reinforce that their experience is valid and that it's okay to feel this way.

Surprising Mindful Question (1 sentence): End with a mindful question that's surprising or thought-provoking—something that makes the user reflect on their feelings or a way forward in a gentle, curious way.`;
      }
    } else {
      // Morning/Evening logic - keep existing prompt
      systemPrompt = `You're an AI that combines playful, 弹幕组 vibes with mindful encouragement. The user shared their 'win' for the day. Read their entry and respond with a quick, fun, and supportive reply. Use a lot of emoji to keep it feeling like a comment section:

Playful Start (1-2 sentences):
Throw in a bit of humorous judgment that feels fun and light—like you're casually roasting them but still hyping them up. This part should feel like a quick comment from a friend or a live chat.

Mindful Reflection (1-2 sentences):
Acknowledge their presence and follow with a mindful comment that expands their perspective.

Question (1-2 sentence):
First, tell the user that we can come back to this win later if the user asks for it. Second, tell the user that but for now, let's switch gears and dive into something else -- which is the stressor or challenge they experience today. Ask in the format of a question from a friend.`;
    }

    // Prepare messages for AI SDK with multimodal support
    const messages = [];
    
    if (images && images.length > 0) {
      // Create multimodal message with text and images
      const content = [
        { type: 'text', text: `Question: ${selectedQuestion}\nUser's answer: ${userEntry}` },
        ...images.map((imageUrl: string) => ({
          type: 'image' as const,
          image: imageUrl
        }))
      ];
      messages.push({ role: 'user' as const, content });
    } else {
      // Text-only message
      messages.push({ 
        role: 'user' as const, 
        content: `Question: ${selectedQuestion}\nUser's answer: ${userEntry}` 
      });
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