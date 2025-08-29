/**
 * 模板引擎 - 简化版本
 * MVP 核心功能：智能识别所有文本，批量生成内容
 */

import { 
  Template,
  TldrawSnapshot,
  TldrawTextShape,
  ReplaceableText,
  DiaryContent,
  TemplateApplicationResult,
  TldrawRecord
} from './types/template';
import { generateTemplateText } from './templates/text-generator';
import {
  isTextShape,
  extractPlainText,
  createRichText,
  shouldReplaceText,
  determineTextType,
  calculateMaxLength,
  trimTextToLength,
  prepareDiaryContext,
  createFallbackText,
  createGenerationPrompt
} from './template-utils';

/**
 * 简化的模板引擎核心类
 */
export class TemplateEngine {
  /**
   * 分析模板，识别所有可替换的文本
   */
  static analyzeTemplate(snapshot: TldrawSnapshot): ReplaceableText[] {
    const replaceableTexts: ReplaceableText[] = [];
    
    // 兼容不同的 snapshot 结构格式
    let store: Record<string, unknown>;
    if (snapshot.document?.store) {
      // 新格式：{document: {store: {...}}}
      store = snapshot.document.store;
    } else if ((snapshot.document as any)?.data?.document?.store) {
      // 旧格式：{document: {data: {document: {store: {...}}}}}
      store = (snapshot.document as any).data.document.store;
    } else if ((snapshot as any)?.store) {
      // 直接格式：{store: {...}}
      store = (snapshot as any).store;
    } else {
      console.warn('无法识别的 snapshot 格式:', {
        hasDocument: !!snapshot.document,
        documentKeys: snapshot.document ? Object.keys(snapshot.document) : 'N/A',
        snapshotKeys: Object.keys(snapshot)
      });
      return replaceableTexts;
    }

    if (!store || typeof store !== 'object') {
      console.warn('Store 不存在或格式不正确:', store);
      return replaceableTexts;
    }

    for (const [shapeId, record] of Object.entries(store)) {
      if (isTextShape(record as TldrawRecord)) {
        const textShape = record as TldrawTextShape;
        const plainText = extractPlainText(textShape.props.richText);
        
        // MVP: 简化判断逻辑，大部分文本都替换
        if (shouldReplaceText(plainText, textShape)) {
          const textType = determineTextType(plainText, textShape);
          
          replaceableTexts.push({
            shapeId,
            type: textType,
            originalText: plainText,
            maxLength: calculateMaxLength(plainText, textShape.props.w, textShape.props.size),
            style: {
              color: textShape.props.color,
              size: textShape.props.size,
              font: textShape.props.font,
              width: textShape.props.w,
            },
            position: {
              x: textShape.x,
              y: textShape.y,
            },
          });
        }
      }
    }

    return replaceableTexts.sort((a, b) => {
      // 排序：标题优先，然后按位置排序
      if (a.type === 'title' && b.type !== 'title') return -1;
      if (b.type === 'title' && a.type !== 'title') return 1;
      if (a.position.y !== b.position.y) return a.position.y - b.position.y;
      return a.position.x - b.position.x;
    });
  }

  /**
   * 将日记内容应用到模板
   */
  static async applyContentToTemplate(
    template: Template,
    diaryContent: DiaryContent,
    language: 'zh' | 'en' = 'zh'
  ): Promise<TemplateApplicationResult> {
    const startTime = Date.now();

    try {
      // 1. 分析模板，获取所有可替换文本
      const replaceableTexts = this.analyzeTemplate(template.snapshot);

      if (replaceableTexts.length === 0) {
        return {
          success: false,
          error: 'No replaceable text found in template'
        };
      }

      // 2. 批量生成新文本
      const newTexts = await this.batchGenerateTexts(replaceableTexts, diaryContent, language);
      
      if (!newTexts || newTexts.length !== replaceableTexts.length) {
        return {
          success: false,
          error: 'Failed to generate text for all shapes'
        };
      }

      // 3. 应用新文本到快照
      const modifiedSnapshot = this.applyTextsToSnapshot(
        template.snapshot,
        replaceableTexts.map((text, index) => ({
          shapeId: text.shapeId,
          newText: newTexts[index]
        }))
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        modifiedSnapshot,
        metadata: {
          originalTextCount: replaceableTexts.length,
          generatedTextCount: newTexts.length,
          processingTime,
        }
      };
    } catch (error) {
      console.error('Error applying content to template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * 获取模板统计信息
   */
  static getTemplateStats(snapshot: TldrawSnapshot): {
    totalShapes: number;
    textShapes: number;
    imageShapes: number;
    replaceableTexts: number;
  } {
    // 兼容不同的 snapshot 结构格式
    let store: Record<string, unknown>;
    if (snapshot.document?.store) {
      store = snapshot.document.store;
    } else if ((snapshot.document as any)?.data?.document?.store) {
      store = (snapshot.document as any).data.document.store;
    } else if ((snapshot as any)?.store) {
      store = (snapshot as any).store;
    } else {
      return { totalShapes: 0, textShapes: 0, imageShapes: 0, replaceableTexts: 0 };
    }

    if (!store || typeof store !== 'object') {
      return { totalShapes: 0, textShapes: 0, imageShapes: 0, replaceableTexts: 0 };
    }

    let totalShapes = 0;
    let textShapes = 0;
    let imageShapes = 0;
    let replaceableTexts = 0;

    for (const [, record] of Object.entries(store)) {
      const shape = record as TldrawRecord;
      if (shape.typeName === 'shape') {
        totalShapes++;
        
        if (shape.type === 'text') {
          textShapes++;
          const textShape = shape as TldrawTextShape;
          const plainText = extractPlainText(textShape.props.richText);
          
          if (shouldReplaceText(plainText, textShape)) {
            replaceableTexts++;
          }
        } else if (shape.type === 'image') {
          imageShapes++;
        }
      }
    }

    return {
      totalShapes,
      textShapes,
      imageShapes,
      replaceableTexts,
    };
  }

  // ====================== 私有辅助方法 ======================

  /**
   * 批量生成文本
   */
  private static async batchGenerateTexts(
    replaceableTexts: ReplaceableText[],
    diaryContent: DiaryContent,
    language: 'zh' | 'en'
  ): Promise<string[]> {
    const results: string[] = [];
    const diaryContext = prepareDiaryContext(diaryContent);

    for (let i = 0; i < replaceableTexts.length; i++) {
      const text = replaceableTexts[i];
      
      try {
        const prompt = createGenerationPrompt(text.type, text.maxLength, diaryContext, language);
        
        const result = await generateTemplateText({
          prompt,
          language,
          maxTokens: Math.min(text.maxLength * 2, 800),
        });

        const trimmedText = trimTextToLength(result.text, text.maxLength);
        results.push(trimmedText);
      } catch (error) {
        console.error(`Error generating text for shape ${text.shapeId}:`, error);
        
        // 使用回退文本
        const fallbackText = createFallbackText(diaryContext, text.type, text.maxLength);
        results.push(fallbackText);
      }
    }

    return results;
  }

  /**
   * 将新文本应用到快照
   */
  private static applyTextsToSnapshot(
    snapshot: TldrawSnapshot,
    textMappings: { shapeId: string; newText: string }[]
  ): TldrawSnapshot {
    const modifiedSnapshot = JSON.parse(JSON.stringify(snapshot));
    
    // 兼容不同的 snapshot 结构格式
    let store: Record<string, any>;
    if (modifiedSnapshot.document?.store) {
      store = modifiedSnapshot.document.store;
    } else if ((modifiedSnapshot.document as any)?.data?.document?.store) {
      store = (modifiedSnapshot.document as any).data.document.store;
    } else if ((modifiedSnapshot as any)?.store) {
      store = (modifiedSnapshot as any).store;
    } else {
      console.error('无法找到可修改的 store 结构');
      return modifiedSnapshot;
    }

    for (const { shapeId, newText } of textMappings) {
      if (store[shapeId] && isTextShape(store[shapeId] as TldrawRecord)) {
        (store[shapeId] as any).props.richText = createRichText(newText);
      }
    }

    return modifiedSnapshot;
  }
}