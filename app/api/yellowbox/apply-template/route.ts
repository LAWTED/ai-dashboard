import { NextRequest, NextResponse } from 'next/server';
import { TemplateStorage } from '@/lib/yellowbox/template-storage';
import { TemplateEngine } from '@/lib/yellowbox/template-engine';
import { ApplyTemplateRequest } from '@/lib/yellowbox/types/template';

/**
 * POST /api/yellowbox/apply-template
 * 应用模板到日记内容
 */
export async function POST(request: NextRequest) {
  try {
    const body: ApplyTemplateRequest = await request.json();
    const { templateId, diaryContent, language = 'zh' } = body;

    // 验证请求数据
    if (!templateId) {
      return NextResponse.json(
        { error: '模板ID不能为空' },
        { status: 400 }
      );
    }

    if (!diaryContent) {
      return NextResponse.json(
        { error: '日记内容不能为空' },
        { status: 400 }
      );
    }

    // 验证日记内容格式
    if (!diaryContent.conversationHistory || !Array.isArray(diaryContent.conversationHistory)) {
      return NextResponse.json(
        { error: '无效的日记内容格式' },
        { status: 400 }
      );
    }

    // 检查是否有内容可处理
    const hasContent = diaryContent.conversationHistory.length > 0 || 
                      diaryContent.summary || 
                      diaryContent.selectedQuestion;

    if (!hasContent) {
      return NextResponse.json(
        { error: '日记中没有找到可处理的内容' },
        { status: 400 }
      );
    }

    console.log(`应用模板 ${templateId}，包含 ${diaryContent.conversationHistory.length} 条对话`);

    // 获取模板
    const templateResult = await TemplateStorage.getTemplate(templateId);
    if (!templateResult.success || !templateResult.data) {
      return NextResponse.json(
        { error: templateResult.error || '模板不存在' },
        { status: 404 }
      );
    }

    const template = templateResult.data;
    console.log(`找到模板: ${template.name}`);

    // 应用模板
    const applicationResult = await TemplateEngine.applyTemplate(
      template,
      diaryContent,
      language
    );

    if (!applicationResult.success) {
      return NextResponse.json(
        { error: applicationResult.error || '应用模板失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templateId,
      modifiedSnapshot: applicationResult.modifiedSnapshot,
      metadata: applicationResult.metadata,
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
      { error: '应用模板时发生错误' },
      { status: 500 }
    );
  }
}