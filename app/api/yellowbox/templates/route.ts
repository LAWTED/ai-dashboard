import { NextRequest, NextResponse } from 'next/server';
import { TemplateStorage } from '@/lib/yellowbox/template-storage';
import { CreateTemplateRequest } from '@/lib/yellowbox/types/template';

/**
 * GET /api/yellowbox/templates
 * 获取模板列表
 */
export async function GET() {
  try {
    const result = await TemplateStorage.listTemplates();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      templates: result.data,
      count: result.data?.length || 0
    });

  } catch (error) {
    console.error('Templates API error:', error);
    return NextResponse.json(
      { error: '获取模板列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/yellowbox/templates
 * 创建新模板
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const { name, description, snapshot, isPublic }: CreateTemplateRequest = body;
    
    if (!name?.trim()) {
      return NextResponse.json(
        { error: '模板名称不能为空' },
        { status: 400 }
      );
    }

    if (!snapshot?.store || !snapshot?.schema) {
      return NextResponse.json(
        { error: '无效的模板格式：缺少必要的 store 或 schema 数据' },
        { status: 400 }
      );
    }

    // TODO: 从认证中获取用户ID
    const userId = null; // 暂时设为null，表示匿名用户

    const result = await TemplateStorage.createTemplate({
      name: name.trim(),
      description: description?.trim(),
      snapshot,
      isPublic: isPublic ?? false
    }, userId || undefined);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        templateId: result.data,
        message: '模板创建成功'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: '创建模板失败' },
      { status: 500 }
    );
  }
}