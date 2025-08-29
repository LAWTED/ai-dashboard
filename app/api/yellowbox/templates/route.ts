import { NextRequest, NextResponse } from 'next/server';
import { TemplateStorage, TemplateValidator } from '@/lib/yellowbox/template-storage';
import { CreateTemplateRequest } from '@/lib/yellowbox/types/template';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const templates = await TemplateStorage.listTemplates({}, true);
    
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
        templates: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户认证
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, description, snapshot, replaceableShapes, isPublic } = body;

    // 验证输入
    const nameValidation = TemplateValidator.validateName(name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const descValidation = TemplateValidator.validateDescription(description || '');
    if (!descValidation.valid) {
      return NextResponse.json(
        { error: descValidation.error },
        { status: 400 }
      );
    }

    const snapshotValidation = TemplateValidator.validateSnapshot(snapshot);
    if (!snapshotValidation.valid) {
      return NextResponse.json(
        { error: snapshotValidation.error },
        { status: 400 }
      );
    }

    if (replaceableShapes) {
      const shapesValidation = TemplateValidator.validateReplaceableShapes(replaceableShapes);
      if (!shapesValidation.valid) {
        return NextResponse.json(
          { error: shapesValidation.error },
          { status: 400 }
        );
      }
    }

    // 创建模板
    const createRequest: CreateTemplateRequest = {
      name,
      description: description || '',
      snapshot,
      replaceableShapes: replaceableShapes || [],
      isPublic: isPublic || false,
    };

    const template = await TemplateStorage.createTemplate(createRequest, true);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}