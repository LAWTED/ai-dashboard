import { NextRequest, NextResponse } from 'next/server';
import { TemplateManager } from '@/lib/yellowbox/templates/template-manager';

export async function GET(request: NextRequest) {
  try {
    const templates = await TemplateManager.getAvailableTemplates();
    
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Error loading templates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load templates',
        templates: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}