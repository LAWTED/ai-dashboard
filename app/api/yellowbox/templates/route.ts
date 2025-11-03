import { NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/yellowbox/templates';

/**
 * GET /api/yellowbox/templates
 * 获取所有可用模板列表
 */
export async function GET() {
  try {
    const templates = getAllTemplates();
    
    // 转换为列表项格式（只包含必要信息）
    const templateList = templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      previewUrl: template.previewUrl
    }));

    return NextResponse.json({
      templates: templateList,
      count: templateList.length
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template list' },
      { status: 500 }
    );
  }
}
