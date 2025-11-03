/**
 * 简化的模板引擎 - MVP版本
 * 核心功能：识别所有文本，生成相同长度的替换文本
 */

import { toRichText } from '@tldraw/tlschema';
import {
  Template,
  TldrawSnapshot,
  TldrawTextShape,
  TldrawRichText,
  ReplaceableText,
  DiaryContent,
  TemplateApplicationResult,
  TextGenerationRequest
} from './template-types';

type TldrawColor =
  | 'black'
  | 'grey'
  | 'light-violet'
  | 'violet'
  | 'blue'
  | 'light-blue'
  | 'yellow'
  | 'orange'
  | 'green'
  | 'light-green'
  | 'light-red'
  | 'red'
  | 'white';

const ALLOWED_COLORS: Record<string, TldrawColor> = {
  black: 'black',
  grey: 'grey',
  'light-violet': 'light-violet',
  violet: 'violet',
  blue: 'blue',
  'light-blue': 'light-blue',
  yellow: 'yellow',
  orange: 'orange',
  green: 'green',
  'light-green': 'light-green',
  'light-red': 'light-red',
  red: 'red',
  white: 'white'
};

export class TemplateEngine {
  
  /**
   * 分析模板，找出所有可替换的文本
   */
  static analyzeTemplate(template: Template): ReplaceableText[] {
    const replaceableTexts: ReplaceableText[] = [];
    
    if (!template.snapshot?.store) {
      return replaceableTexts;
    }

    // 遍历所有 shapes，找出文本类型
    for (const [shapeId, record] of Object.entries(template.snapshot.store)) {
      if (this.isTextShape(record)) {
        const textShape = record as TldrawTextShape;
        const text = this.getPlainTextFromShape(textShape);

        // 只处理非空文本
        if (text.trim()) {
          replaceableTexts.push({
            shapeId,
            originalText: text,
            targetLength: this.calculateTextLength(text)
          });
        }
      }
    }

    // 按位置排序（从上到下，从左到右）
    replaceableTexts.sort((a, b) => {
      const shapeA = template.snapshot.store[a.shapeId] as TldrawTextShape;
      const shapeB = template.snapshot.store[b.shapeId] as TldrawTextShape;
      
      // 先按Y轴排序（从上到下）
      if (Math.abs(shapeA.y - shapeB.y) > 20) {
        return shapeA.y - shapeB.y;
      }
      
      // 然后按X轴排序（从左到右）
      return shapeA.x - shapeB.x;
    });

    return replaceableTexts;
  }

  /**
   * 应用模板到日记内容
   */
  static async applyTemplate(
    template: Template,
    diaryContent: DiaryContent,
    language: 'zh' | 'en' = 'zh'
  ): Promise<TemplateApplicationResult> {
    try {
      // 1. 分析模板中的可替换文本
      const replaceableTexts = this.analyzeTemplate(template);
      
      if (replaceableTexts.length === 0) {
        return {
          success: false,
          error: 'No replaceable text found in the template.'
        };
      }

      // 2. 生成新文本
      const generatedTexts = await this.generateReplacementTexts(
        replaceableTexts,
        diaryContent,
        language
      );

      // 3. 应用到snapshot
      const modifiedSnapshot = this.applyTextsToSnapshot(
        template.snapshot,
        replaceableTexts,
        generatedTexts
      );

      return {
        success: true,
        modifiedSnapshot,
        replacedCount: replaceableTexts.length
      };

    } catch (error) {
      console.error('Template application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred while applying the template.'
      };
    }
  }

  // ====================== 私有方法 ======================

  /**
   * 检查是否为文本Shape
   */
  private static isTextShape(record: unknown): record is TldrawTextShape {
    return (
      record != null &&
      typeof record === 'object' &&
      'typeName' in record &&
      record.typeName === 'shape' &&
      'type' in record &&
      record.type === 'text'
    );
  }

  /**
   * 计算文本长度（中文字符算1个字符）
   */
  private static calculateTextLength(text: string): number {
    return text.length;
  }

  /**
   * 生成替换文本
   */
  private static async generateReplacementTexts(
    replaceableTexts: ReplaceableText[],
    diaryContent: DiaryContent,
    language: 'zh' | 'en'
  ): Promise<string[]> {
    const { generateText } = await import('./ai-generator');
    const generatedTexts: string[] = [];

    for (const replaceableText of replaceableTexts) {
      try {
        const request: TextGenerationRequest = {
          originalText: replaceableText.originalText,
          targetLength: replaceableText.targetLength,
          diaryContent,
          language
        };

        const result = await generateText(request);
        
        if (result.success) {
          generatedTexts.push(result.text);
        } else {
          // 失败时使用回退文本
          generatedTexts.push(this.createFallbackText(replaceableText));
        }
      } catch (error) {
        console.error(`Failed to generate text (${replaceableText.shapeId}):`, error);
        generatedTexts.push(this.createFallbackText(replaceableText));
      }
    }

    return generatedTexts;
  }

  /**
   * 创建回退文本
   */
  private static createFallbackText(replaceableText: ReplaceableText): string {
    const fallbacks = [
      'Today felt wonderful',
      'Capturing tiny daily moments',
      'Treasured memories worth keeping',
      'Warm feelings on the page',
      'Little joys from everyday life',
      'A moment I want to remember'
    ];
    
    const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return this.adjustTextLength(selected, replaceableText.targetLength);
  }

  /**
   * 调整文本长度到目标长度
   */
  private static adjustTextLength(text: string, targetLength: number): string {
    if (text.length === targetLength) {
      return text;
    }
    
    if (text.length > targetLength) {
      // 截断
      return text.slice(0, targetLength - 1) + '…';
    } else {
      // 重复或填充
      while (text.length < targetLength) {
        const remaining = targetLength - text.length;
        if (remaining >= text.length) {
          text = text + text;
        } else {
          text = text + text.slice(0, remaining);
        }
      }
      return text;
    }
  }

  /**
   * 应用新文本到snapshot
   */
  private static applyTextsToSnapshot(
    snapshot: TldrawSnapshot,
    replaceableTexts: ReplaceableText[],
    newTexts: string[]
  ): TldrawSnapshot {
    // 深拷贝snapshot
    const modified = JSON.parse(JSON.stringify(snapshot)) as TldrawSnapshot;
    
    // 应用每个文本替换
    for (let i = 0; i < replaceableTexts.length; i++) {
      const { shapeId } = replaceableTexts[i];
      const newText = newTexts[i];
      
      if (modified.store[shapeId] && this.isTextShape(modified.store[shapeId])) {
        const shape = modified.store[shapeId] as TldrawTextShape;

        // 更新富文本内容
        shape.props.richText = toRichText(newText);

        // 规范化颜色以符合TLDraw枚举
        shape.props.color = this.normalizeColor(shape.props.color);

        // 移除旧版本的 text 字段，避免验证错误
        if ('text' in shape.props) {
          delete (shape.props as Record<string, unknown>).text;
        }
      }
    }

    return modified;
  }

  /**
   * 提取文本 shape 中的纯文本内容
   */
  private static getPlainTextFromShape(shape: TldrawTextShape): string {
    const props = shape.props;

    if (props.richText) {
      return this.richTextToPlainText(props.richText);
    }

    // 兼容旧版本的 text 字段
    if (typeof (props as Record<string, unknown>).text === 'string') {
      return (props as Record<string, string>).text;
    }

    return '';
  }

  /**
   * 将 Tldraw 富文本转换为普通字符串
   */
  private static richTextToPlainText(richText: TldrawRichText): string {
    if (!richText || !Array.isArray(richText.content)) {
      return '';
    }

    const lines: string[] = [];

    for (const block of richText.content) {
      if (!block || typeof block !== 'object') {
        continue;
      }

      if ('content' in block && Array.isArray((block as { content?: unknown[] }).content)) {
        const paragraphContent = (block as { content?: unknown[] }).content || [];

        const text = paragraphContent
          .map((span) => {
            if (!span || typeof span !== 'object') {
              return '';
            }

            if ('text' in span && typeof (span as { text?: unknown }).text === 'string') {
              return (span as { text: string }).text;
            }

            return '';
          })
          .join('');

        lines.push(text);
      } else {
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private static normalizeColor(color: unknown): TldrawColor {
    if (typeof color !== 'string') {
      return 'black';
    }

    const lower = color.toLowerCase();

    if (lower in ALLOWED_COLORS) {
      return ALLOWED_COLORS[lower];
    }

    switch (lower) {
      case 'purple':
        return 'violet';
      case 'light-purple':
      case 'lavender':
        return 'light-violet';
      case 'dark-blue':
        return 'blue';
      case 'dark-green':
        return 'green';
      case 'dark-grey':
      case 'gray':
        return 'grey';
      default:
        return 'black';
    }
  }
}
