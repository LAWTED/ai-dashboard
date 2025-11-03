import { NextRequest, NextResponse } from 'next/server';
import { TemplateEngine } from '@/lib/yellowbox/template-engine';
import { getTemplateById } from '@/lib/yellowbox/templates';
import { ApplyTemplateRequest } from '@/lib/yellowbox/template-types';

/**
 * POST /api/yellowbox/apply-template
 * 应用模板到日记内容
 */
export async function POST(request: NextRequest) {
  try {
    const body: ApplyTemplateRequest = await request.json();
    const { templateId, diaryContent, language = 'zh' } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    if (!diaryContent) {
      return NextResponse.json(
        { error: 'Diary content is required' },
        { status: 400 }
      );
    }

    if (!diaryContent.conversationHistory || !Array.isArray(diaryContent.conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid diary content format' },
        { status: 400 }
      );
    }

    const hasContent = diaryContent.conversationHistory.length > 0 || 
                      diaryContent.summary || 
                      diaryContent.selectedQuestion;

    if (!hasContent) {
      return NextResponse.json(
        { error: 'No processable diary content found' },
        { status: 400 }
      );
    }

    console.log(`Applying template ${templateId} with ${diaryContent.conversationHistory.length} conversation entries.`);

    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log(`Found template: ${template.name}`);

    const applicationResult = await TemplateEngine.applyTemplate(
      template,
      diaryContent,
      language
    );

    if (!applicationResult.success) {
      return NextResponse.json(
        { error: applicationResult.error || 'Failed to apply template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templateId,
      templateName: template.name,
      modifiedSnapshot: applicationResult.modifiedSnapshot,
      replacedCount: applicationResult.replacedCount,
      processingInfo: {
        language,
        contentLength: diaryContent.conversationHistory.reduce(
          (sum, msg) => sum + msg.content.length, 0
        ),
      }
    });

  } catch (error) {
    console.error('Apply template error:', error);
    return NextResponse.json(
      { error: 'An error occurred while applying the template' },
      { status: 500 }
    );
  }
}
