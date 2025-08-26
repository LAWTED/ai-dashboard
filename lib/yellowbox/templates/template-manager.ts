import { TLShape } from 'tldraw';
import fs from 'fs';
import path from 'path';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  textShapeCount: number;
  imageCount: number;
  previewUrl?: string;
  tags: string[];
  language: string;
}

export interface TemplateData {
  metadata: TemplateMetadata;
  snapshot: any; // Tldraw snapshot data
}

export interface TextShapeInfo {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: {
    color: string;
    size: string;
    font: string;
    width: number;
  };
  maxLength?: number;
}

/**
 * Template Manager for handling Tldraw templates
 */
export class TemplateManager {
  private static templates: Map<string, TemplateData> = new Map();

  /**
   * Load template from JSON file
   */
  static async loadTemplate(templateId: string, useFileSystem: boolean = false): Promise<TemplateData | null> {
    try {
      // Check if already loaded
      if (this.templates.has(templateId)) {
        return this.templates.get(templateId)!;
      }

      let snapshotData: any;

      if (useFileSystem && typeof window === 'undefined') {
        // Server-side: load directly from file system
        try {
          const templatePath = path.join(process.cwd(), 'app', 'yellowbox', 'sample', `${templateId}.json`);
          const fileContent = fs.readFileSync(templatePath, 'utf8');
          snapshotData = JSON.parse(fileContent);
        } catch (fsError) {
          console.error(`Failed to load template from file system: ${templateId}`, fsError);
          return null;
        }
      } else {
        // Client-side: use API endpoint
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          throw new Error(`Failed to load template: ${templateId}`);
        }
        snapshotData = await response.json();
      }
      const textShapes = this.extractTextShapes(snapshotData);
      
      const templateData: TemplateData = {
        metadata: {
          id: templateId,
          name: this.getTemplateName(templateId),
          description: this.getTemplateDescription(templateId),
          textShapeCount: textShapes.length,
          imageCount: this.countImageShapes(snapshotData),
          tags: this.getTemplateTags(templateId),
          language: 'zh', // Default to Chinese for now
        },
        snapshot: snapshotData,
      };

      this.templates.set(templateId, templateData);
      return templateData;
    } catch (error) {
      console.error(`Error loading template ${templateId}:`, error);
      return null;
    }
  }

  /**
   * Get all available templates
   */
  static async getAvailableTemplates(): Promise<TemplateMetadata[]> {
    // For now, we only have one template
    const template = await this.loadTemplate('long-photo-1', true);
    return template ? [template.metadata] : [];
  }

  /**
   * Extract text shapes from template snapshot
   */
  static extractTextShapes(snapshot: any): TextShapeInfo[] {
    const textShapes: TextShapeInfo[] = [];
    
    if (!snapshot?.data?.document?.store) {
      return textShapes;
    }

    const store = snapshot.data.document.store;
    
    for (const [key, record] of Object.entries(store)) {
      const shape = record as any;
      
      if (shape.typeName === 'shape' && shape.type === 'text') {
        const textContent = this.extractTextFromRichText(shape.props.richText);
        
        textShapes.push({
          id: shape.id,
          text: textContent,
          position: { x: shape.x, y: shape.y },
          style: {
            color: shape.props.color,
            size: shape.props.size,
            font: shape.props.font,
            width: shape.props.w,
          },
          maxLength: this.estimateMaxLength(textContent, shape.props.w),
        });
      }
    }

    return textShapes;
  }

  /**
   * Replace text content in template while preserving structure
   */
  static replaceTextInTemplate(
    template: TemplateData,
    newTexts: { shapeId: string; text: string }[]
  ): any {
    const modifiedSnapshot = JSON.parse(JSON.stringify(template.snapshot));
    const store = modifiedSnapshot.data.document.store;

    for (const { shapeId, text } of newTexts) {
      if (store[shapeId] && store[shapeId].type === 'text') {
        // Update the rich text content while preserving structure
        store[shapeId].props.richText = this.createRichText(text);
      }
    }

    return modifiedSnapshot;
  }

  /**
   * Extract plain text from Tldraw rich text structure
   */
  private static extractTextFromRichText(richText: any): string {
    if (!richText?.content) return '';
    
    let text = '';
    for (const paragraph of richText.content) {
      if (paragraph.content) {
        for (const textNode of paragraph.content) {
          if (textNode.type === 'text' && textNode.text) {
            text += textNode.text;
          }
        }
      }
    }
    
    return text;
  }

  /**
   * Create Tldraw rich text structure from plain text
   */
  private static createRichText(text: string): any {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { dir: 'auto' },
          content: [
            {
              type: 'text',
              text: text,
            },
          ],
        },
      ],
    };
  }

  /**
   * Count image shapes in template
   */
  private static countImageShapes(snapshot: any): number {
    if (!snapshot?.data?.document?.store) return 0;
    
    const store = snapshot.data.document.store;
    let count = 0;
    
    for (const [key, record] of Object.entries(store)) {
      const shape = record as any;
      if (shape.typeName === 'shape' && shape.type === 'image') {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Estimate max character length based on text width and font size
   */
  private static estimateMaxLength(originalText: string, width: number): number {
    // Simple estimation based on original text length and proportional width
    const baseRatio = originalText.length / Math.max(width, 100);
    return Math.max(50, Math.floor(width * baseRatio * 1.5));
  }

  /**
   * Get template name by ID
   */
  private static getTemplateName(templateId: string): string {
    const names: Record<string, string> = {
      'long-photo-1': '长图模板 1',
    };
    return names[templateId] || templateId;
  }

  /**
   * Get template description by ID
   */
  private static getTemplateDescription(templateId: string): string {
    const descriptions: Record<string, string> = {
      'long-photo-1': '适合长篇日记的图文混排模板，包含多个文本区域和图片位置',
    };
    return descriptions[templateId] || '';
  }

  /**
   * Get template tags by ID
   */
  private static getTemplateTags(templateId: string): string[] {
    const tags: Record<string, string[]> = {
      'long-photo-1': ['长图', '图文混排', '日记', '多图'],
    };
    return tags[templateId] || [];
  }
}