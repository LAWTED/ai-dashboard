/**
 * 模板引擎 - MVP 统一版本
 * 使用标准 Tldraw 格式，自动识别所有文本进行替换
 */

import { 
  Template,
  TldrawSnapshot,
  TldrawTextShape,
  TldrawRecord,
  ReplaceableText,
  DiaryContent,
  TemplateApplicationResult,
  TemplateStats,
  Result
} from './types/template';

/**
 * 核心模板引擎
 */
export class TemplateEngine {
  
  /**
   * 分析 Tldraw snapshot，提取所有可替换的文本
   */
  static analyzeSnapshot(snapshot: TldrawSnapshot): Result<ReplaceableText[]> {
    try {
      if (!snapshot?.store || typeof snapshot.store !== 'object') {
        return {
          success: false,
          error: '无效的 snapshot 格式：缺少 store 数据'
        };
      }

      const replaceableTexts: ReplaceableText[] = [];

      // 遍历所有 shapes，找出文本类型
      for (const [shapeId, record] of Object.entries(snapshot.store)) {
        if (this.isTextShape(record)) {
          const textShape = record as TldrawTextShape;
          const text = textShape.props.text || '';
          
          // MVP: 所有非空文本都可替换
          if (text.trim()) {
            const textType = this.determineTextType(text, textShape);
            const priority = this.calculatePriority(textShape, textType);
            
            replaceableTexts.push({
              shapeId,
              type: textType,
              originalText: text,
              maxLength: this.calculateMaxLength(text, textShape),
              priority,
              style: {
                color: textShape.props.color,
                size: textShape.props.size,
                font: textShape.props.font,
                width: textShape.props.w
              }
            });
          }
        }
      }

      // 按优先级排序（标题优先，然后按位置从上到下，从左到右）
      replaceableTexts.sort((a, b) => {
        if (a.type === 'title' && b.type !== 'title') return -1;
        if (b.type === 'title' && a.type !== 'title') return 1;
        return b.priority - a.priority;
      });

      return {
        success: true,
        data: replaceableTexts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '分析 snapshot 时发生未知错误'
      };
    }
  }

  /**
   * 应用日记内容到模板
   */
  static async applyTemplate(
    template: Template,
    diaryContent: DiaryContent,
    language: 'zh' | 'en' = 'zh'
  ): Promise<TemplateApplicationResult> {
    const startTime = Date.now();

    try {
      // 1. 分析模板中的可替换文本
      const analysisResult = this.analyzeSnapshot(template.snapshot);
      if (!analysisResult.success || !analysisResult.data) {
        return {
          success: false,
          error: analysisResult.error || '分析模板失败'
        };
      }

      const replaceableTexts = analysisResult.data;
      
      if (replaceableTexts.length === 0) {
        return {
          success: false,
          error: '模板中没有找到可替换的文本'
        };
      }

      // 2. 生成新文本内容
      const newTexts = await this.generateTexts(replaceableTexts, diaryContent, language);

      // 3. 应用到 snapshot
      const modifiedSnapshot = this.applyTextsToSnapshot(
        template.snapshot,
        replaceableTexts,
        newTexts
      );

      const processingTime = Date.now() - startTime;
      const totalWords = newTexts.join('').length;

      return {
        success: true,
        modifiedSnapshot,
        metadata: {
          replacedTextCount: replaceableTexts.length,
          processingTimeMs: processingTime,
          generatedWords: totalWords
        }
      };

    } catch (error) {
      console.error('Template application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '应用模板时发生未知错误'
      };
    }
  }

  /**
   * 获取模板统计信息
   */
  static getTemplateStats(snapshot: TldrawSnapshot): TemplateStats {
    if (!snapshot?.store) {
      return { totalShapes: 0, textShapes: 0, imageShapes: 0, replaceableTexts: 0 };
    }

    let totalShapes = 0;
    let textShapes = 0;
    let imageShapes = 0;
    let replaceableTexts = 0;

    for (const record of Object.values(snapshot.store)) {
      if (this.isShape(record)) {
        totalShapes++;
        
        if (this.isTextShape(record)) {
          textShapes++;
          const text = (record as TldrawTextShape).props.text || '';
          if (text.trim()) {
            replaceableTexts++;
          }
        } else if (this.isImageShape(record)) {
          imageShapes++;
        }
      }
    }

    return {
      totalShapes,
      textShapes,
      imageShapes,
      replaceableTexts
    };
  }

  // ====================== 私有工具方法 ======================

  /**
   * 检查记录是否为 Shape
   */
  private static isShape(record: unknown): record is TldrawRecord {
    return (
      record != null &&
      typeof record === 'object' &&
      'typeName' in record &&
      record.typeName === 'shape'
    );
  }

  /**
   * 检查是否为文本 Shape
   */
  private static isTextShape(record: unknown): record is TldrawTextShape {
    return (
      this.isShape(record) &&
      'type' in record &&
      record.type === 'text'
    );
  }

  /**
   * 检查是否为图片 Shape
   */
  private static isImageShape(record: unknown): boolean {
    return (
      this.isShape(record) &&
      'type' in record &&
      record.type === 'image'
    );
  }

  /**
   * 判断文本类型（标题、正文、说明）
   */
  private static determineTextType(text: string, shape: TldrawTextShape): 'title' | 'body' | 'caption' {
    // 根据文本长度和字体大小判断
    const textLength = text.trim().length;
    const fontSize = shape.props.size;

    if (textLength <= 20 && (fontSize === 'l' || fontSize === 'xl')) {
      return 'title';
    }
    
    if (textLength <= 30) {
      return 'caption';
    }
    
    return 'body';
  }

  /**
   * 计算位置优先级（越大越优先）
   */
  private static calculatePriority(shape: TldrawTextShape, type: 'title' | 'body' | 'caption'): number {
    // 标题优先级最高
    if (type === 'title') return 1000;
    
    // 位置越靠上越优先，靠左越优先
    const yPriority = Math.max(0, 1000 - shape.y);
    const xPriority = Math.max(0, 100 - shape.x * 0.1);
    
    return yPriority + xPriority;
  }

  /**
   * 计算文本最大长度限制
   */
  private static calculateMaxLength(originalText: string, shape: TldrawTextShape): number {
    const baseLength = originalText.length;
    const widthFactor = Math.max(1, shape.props.w / 100);
    
    // 根据原文长度和宽度估算合适的长度
    return Math.min(200, Math.max(baseLength, Math.floor(baseLength * widthFactor * 1.5)));
  }

  /**
   * 生成替换文本内容
   */
  private static async generateTexts(
    replaceableTexts: ReplaceableText[],
    diaryContent: DiaryContent,
    language: 'zh' | 'en'
  ): Promise<string[]> {
    const texts: string[] = [];
    const context = this.prepareDiaryContext(diaryContent);

    for (const replaceableText of replaceableTexts) {
      try {
        const generatedText = await this.generateSingleText(
          replaceableText,
          context,
          language
        );
        texts.push(generatedText);
      } catch (error) {
        console.error(`生成文本失败 (${replaceableText.shapeId}):`, error);
        // 使用回退文本
        texts.push(this.createFallbackText(replaceableText));
      }
    }

    return texts;
  }

  /**
   * 生成单个文本内容
   */
  private static async generateSingleText(
    replaceableText: ReplaceableText,
    context: string,
    language: 'zh' | 'en'
  ): Promise<string> {
    // TODO: 集成实际的 AI 文本生成 API，使用 context 和 prompt
    // const prompt = this.createPrompt(replaceableText, context, language);
    
    // 暂时返回模拟内容
    const mockGenerated = await this.mockTextGeneration(replaceableText.type, language);
    
    // 确保生成的文本不超过长度限制
    return this.trimToLength(mockGenerated, replaceableText.maxLength);
  }

  /**
   * 模拟文本生成（临时实现）
   */
  private static async mockTextGeneration(type: string, language: 'zh' | 'en'): Promise<string> {
    // 模拟异步延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (language === 'zh') {
      switch (type) {
        case 'title': return '今日感悟';
        case 'body': return '这是一段关于今天生活感悟的文字，记录了内心的思考和体会。';
        case 'caption': return '温暖的午后时光';
        default: return '生成的内容';
      }
    } else {
      switch (type) {
        case 'title': return 'Daily Reflection';
        case 'body': return 'This is a thoughtful reflection on today\'s experiences and insights.';
        case 'caption': return 'Peaceful afternoon moments';
        default: return 'Generated content';
      }
    }
  }

  /**
   * 创建生成提示词
   */
  private static createPrompt(
    replaceableText: ReplaceableText,
    context: string,
    language: 'zh' | 'en'
  ): string {
    const langPrompts = {
      zh: {
        title: '请根据以下日记内容，生成一个简洁有力的标题',
        body: '请根据以下日记内容，生成一段富有感情的正文',
        caption: '请根据以下日记内容，生成一句简短的说明文字'
      },
      en: {
        title: 'Generate a concise and powerful title based on the following diary content',
        body: 'Generate an emotional body text based on the following diary content',
        caption: 'Generate a brief caption based on the following diary content'
      }
    };

    const typePrompt = langPrompts[language][replaceableText.type as keyof typeof langPrompts.zh];
    return `${typePrompt}，最多 ${replaceableText.maxLength} 个字符：\n\n${context}`;
  }

  /**
   * 准备日记上下文
   */
  private static prepareDiaryContext(diaryContent: DiaryContent): string {
    const parts: string[] = [];

    // 添加对话历史
    if (diaryContent.conversationHistory?.length) {
      const messages = diaryContent.conversationHistory
        .slice(-3) // 只取最近3条
        .map(msg => `${msg.type === 'user' ? '我' : 'AI'}: ${msg.content}`)
        .join('\n');
      parts.push(`对话内容:\n${messages}`);
    }

    // 添加总结
    if (diaryContent.summary) {
      parts.push(`总结: ${diaryContent.summary}`);
    }

    // 添加增强总结
    if (diaryContent.enhancedSummary) {
      const { title, emotion, themes } = diaryContent.enhancedSummary;
      parts.push(`主题: ${title}`);
      parts.push(`情感: ${emotion.primary} (${emotion.intensity})`);
      if (themes.length > 0) {
        parts.push(`关键词: ${themes.join(', ')}`);
      }
    }

    return parts.join('\n\n') || '今天是美好的一天';
  }

  /**
   * 创建回退文本
   */
  private static createFallbackText(replaceableText: ReplaceableText): string {
    const fallbacks = {
      title: ['今日记录', '我的想法', '内心独白', '此刻感悟'],
      body: ['记录今天的美好时光，感受生活中的点点滴滴。', '在这个特殊的时刻，我想记录下内心的声音。'],
      caption: ['温暖时光', '美好瞬间', '生活点滴', '心情记录']
    };
    
    const options = fallbacks[replaceableText.type] || ['生活记录'];
    const selected = options[Math.floor(Math.random() * options.length)];
    
    return this.trimToLength(selected, replaceableText.maxLength);
  }

  /**
   * 截断文本到指定长度
   */
  private static trimToLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + '…';
  }

  /**
   * 应用新文本到 snapshot
   */
  private static applyTextsToSnapshot(
    snapshot: TldrawSnapshot,
    replaceableTexts: ReplaceableText[],
    newTexts: string[]
  ): TldrawSnapshot {
    // 深拷贝 snapshot
    const modified = JSON.parse(JSON.stringify(snapshot)) as TldrawSnapshot;
    
    // 应用每个文本替换
    for (let i = 0; i < replaceableTexts.length; i++) {
      const { shapeId } = replaceableTexts[i];
      const newText = newTexts[i];
      
      if (modified.store[shapeId] && this.isTextShape(modified.store[shapeId])) {
        (modified.store[shapeId] as TldrawTextShape).props.text = newText;
      }
    }
    
    return modified;
  }
}