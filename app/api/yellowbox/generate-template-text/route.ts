import { NextRequest, NextResponse } from 'next/server';
import { generateTemplateText } from '@/lib/yellowbox/templates/text-generator';

export async function POST(request: NextRequest) {
  try {
    const { prompt, language = 'zh', maxTokens = 500 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await generateTemplateText({
      prompt,
      language,
      maxTokens,
    });

    return NextResponse.json({
      text: result.text,
      usage: result.usage,
    });

  } catch (error) {
    console.error('Error generating template text:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate text',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}