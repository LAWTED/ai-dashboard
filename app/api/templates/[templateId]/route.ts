import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;

    // Validate template ID
    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Only allow specific template IDs for security
    const allowedTemplates = ['long-photo-1'];
    if (!allowedTemplates.includes(templateId)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Read template file from app/yellowbox/sample/
    const templatePath = join(process.cwd(), 'app', 'yellowbox', 'sample', `${templateId}.json`);
    const templateData = await readFile(templatePath, 'utf-8');
    const parsedTemplate = JSON.parse(templateData);

    return NextResponse.json(parsedTemplate);
  } catch (error) {
    console.error('Error loading template:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load template' },
      { status: 500 }
    );
  }
}