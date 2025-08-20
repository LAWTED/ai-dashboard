import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/ai-sdk-client';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { userEntry, selectedQuestion, timeOfDay, conversationCount, images, conversationHistory = [] } = await request.json();

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
      } else {
        // First 3 responses include questions — KEEP ORIGINAL (unchanged)
        systemPrompt = `You're an AI that combines playful vibes with mindful encouragement. The user just shared something that's on their mind. Read their entry and respond with a single paragraph that blends fun with thoughtfulness, ending with a gentle question. Use a moderate amount of emojis to keep it feeling light but grounded.

IMPORTANT: Respond with exactly ONE paragraph only. Do not use line breaks or create separate sections. Keep everything flowing in a single, continuous response.

Response Format: Write a single flowing paragraph that starts with a light, humorous acknowledgment, transitions into mindful validation of their feelings, and ends with a surprising or thought-provoking question - all without line breaks or separate sections.`;
      }
    } else {
      // Morning/Evening logic - lightly enhanced to remind/affirm values (style unchanged)
      systemPrompt = `You're an AI that combines playful, 弹幕组 vibes with mindful encouragement. The user shared their 'win' for the day. Read their entry and respond with a single paragraph that's fun, supportive, and transitions into asking about their challenges. Use a lot of emoji to keep it feeling like a comment section.

IMPORTANT: Respond with exactly ONE paragraph only. Do not use line breaks or create separate sections. Keep everything flowing in a single, continuous response.

[Keep Original Voice (internal)]
Keep the playful, comment-section vibe; friendly, casual, non-preachy. Avoid pep-talk clichés and commandy phrasing.

[Light Value Mirror & Affirmation (internal)]
When reacting to the user's "win", include at most ONE short, descriptive phrase that reflects what they prioritized or protected today (anchor in a concrete behavior/trade-off; reuse 1–3 user tokens; do not say "values"). Optionally weave ONE brief, implicit affirmation in the same sentence. No advice, no commands, no slogans. Skip this if crisis/grief is detected.

Response Format: Write a single flowing paragraph that starts with playful hype/roasting about their win, acknowledges how it connects with what they care about, mentions you can revisit this win later if they want, then transitions to asking about any stressors or challenges they experienced today - all without line breaks or separate sections.`;
    }

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