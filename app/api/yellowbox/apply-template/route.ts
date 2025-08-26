import { NextRequest, NextResponse } from 'next/server';
import { 
  TemplateProcessor, 
  TemplateApplicationRequest, 
  DiaryContent 
} from '@/lib/yellowbox/templates/template-processor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      templateId, 
      diaryContent, 
      language = 'zh',
      preserveImages = true 
    }: {
      templateId: string;
      diaryContent: DiaryContent;
      language?: 'zh' | 'en';
      preserveImages?: boolean;
    } = body;

    // Validate required fields
    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    if (!diaryContent || typeof diaryContent !== 'object') {
      return NextResponse.json(
        { error: 'Diary content is required' },
        { status: 400 }
      );
    }

    // Validate diary content structure
    if (!diaryContent.conversationHistory || !Array.isArray(diaryContent.conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid diary content format' },
        { status: 400 }
      );
    }

    // Check if there's any content to work with
    const hasContent = diaryContent.conversationHistory.length > 0 || 
                      diaryContent.summary || 
                      diaryContent.selectedQuestion;

    if (!hasContent) {
      return NextResponse.json(
        { error: 'No content found in diary to process' },
        { status: 400 }
      );
    }

    // Prepare application request
    const applicationRequest: TemplateApplicationRequest = {
      templateId,
      diaryContent,
      language,
      preserveImages,
    };

    console.log(`Applying template ${templateId} with ${diaryContent.conversationHistory.length} conversation messages`);

    // Apply template
    const result = await TemplateProcessor.applyDiaryToTemplate(applicationRequest);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to apply template',
          templateId,
        },
        { status: 500 }
      );
    }

    // Return successful result
    return NextResponse.json({
      success: true,
      templateId,
      modifiedSnapshot: result.modifiedSnapshot,
      metadata: result.metadata,
      processingInfo: {
        language,
        preserveImages,
        contentLength: diaryContent.conversationHistory.reduce(
          (sum, msg) => sum + msg.content.length, 0
        ),
      },
    });

  } catch (error) {
    console.error('Error in apply-template API:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error while applying template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}