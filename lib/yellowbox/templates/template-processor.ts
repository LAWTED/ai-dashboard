import { TemplateData, TemplateManager, TextShapeInfo } from './template-manager';
import { generateTemplateText } from './text-generator';

export interface DiaryContent {
  conversationHistory: Array<{
    type: 'user' | 'ai';
    content: string;
    images?: string[];
  }>;
  selectedQuestion?: string;
  summary?: string;
  enhancedSummary?: {
    title: string;
    tags: string[];
    emotion: {
      primary: string;
      intensity: 'low' | 'medium' | 'high';
    };
    themes: string[];
  };
}

export interface TemplateApplicationRequest {
  templateId: string;
  diaryContent: DiaryContent;
  language: 'zh' | 'en';
  preserveImages: boolean;
}

export interface TemplateApplicationResult {
  success: boolean;
  modifiedSnapshot?: any;
  error?: string;
  metadata?: {
    originalTextCount: number;
    generatedTextCount: number;
    processingTime: number;
  };
}

/**
 * Template Processor for applying diary content to templates
 */
export class TemplateProcessor {
  /**
   * Apply diary content to a template
   */
  static async applyDiaryToTemplate(
    request: TemplateApplicationRequest
  ): Promise<TemplateApplicationResult> {
    const startTime = Date.now();
    
    try {
      // Load template with file system access (server-side)
      const template = await TemplateManager.loadTemplate(request.templateId, true);
      if (!template) {
        return {
          success: false,
          error: `Template ${request.templateId} not found`,
        };
      }

      // Extract text shapes from template
      const textShapes = TemplateManager.extractTextShapes(template.snapshot);
      if (textShapes.length === 0) {
        return {
          success: false,
          error: 'No text areas found in template',
        };
      }

      // Generate new text content for each text shape
      const generatedTexts = await this.generateTextsForShapes(
        textShapes,
        request.diaryContent,
        request.language
      );

      if (generatedTexts.length !== textShapes.length) {
        return {
          success: false,
          error: 'Failed to generate text for all text areas',
        };
      }

      // Apply generated texts to template
      const newTextMappings = textShapes.map((shape, index) => ({
        shapeId: shape.id,
        text: generatedTexts[index],
      }));

      const modifiedSnapshot = TemplateManager.replaceTextInTemplate(
        template,
        newTextMappings
      );

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        modifiedSnapshot,
        metadata: {
          originalTextCount: textShapes.length,
          generatedTextCount: generatedTexts.length,
          processingTime,
        },
      };
    } catch (error) {
      console.error('Error applying diary to template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate new text content for each text shape based on diary content
   */
  private static async generateTextsForShapes(
    textShapes: TextShapeInfo[],
    diaryContent: DiaryContent,
    language: 'zh' | 'en'
  ): Promise<string[]> {
    const texts: string[] = [];
    
    // Prepare diary context
    const diaryContext = this.prepareDiaryContext(diaryContent);
    
    for (let i = 0; i < textShapes.length; i++) {
      const shape = textShapes[i];
      const prompt = this.createTextGenerationPrompt(
        shape,
        diaryContext,
        language,
        i,
        textShapes.length
      );

      try {
        const generatedText = await this.callLLMForTextGeneration(prompt, language);
        const trimmedText = this.trimToMaxLength(generatedText, shape.maxLength || 500);
        texts.push(trimmedText);
      } catch (error) {
        console.error(`Error generating text for shape ${shape.id}:`, error);
        // Fallback to original text or diary snippet
        const fallbackText = this.createFallbackText(diaryContext, shape.maxLength || 500);
        texts.push(fallbackText);
      }
    }

    return texts;
  }

  /**
   * Prepare diary content for LLM processing
   */
  private static prepareDiaryContext(diaryContent: DiaryContent): string {
    let context = '';
    
    // Add question if available
    if (diaryContent.selectedQuestion) {
      context += `问题: ${diaryContent.selectedQuestion}\n\n`;
    }

    // Add conversation history
    if (diaryContent.conversationHistory?.length > 0) {
      context += '对话内容:\n';
      diaryContent.conversationHistory.forEach((msg, index) => {
        const prefix = msg.type === 'user' ? '我:' : 'AI:';
        context += `${prefix} ${msg.content}\n`;
      });
      context += '\n';
    }

    // Add summary if available
    if (diaryContent.summary) {
      context += `总结: ${diaryContent.summary}\n\n`;
    }

    // Add enhanced summary details
    if (diaryContent.enhancedSummary) {
      const enhanced = diaryContent.enhancedSummary;
      context += `主题: ${enhanced.title}\n`;
      context += `标签: ${enhanced.tags.join(', ')}\n`;
      context += `情感: ${enhanced.emotion.primary} (${enhanced.emotion.intensity})\n`;
      context += `主要话题: ${enhanced.themes.join(', ')}\n`;
    }

    return context.trim();
  }

  /**
   * Create prompt for LLM text generation
   */
  private static createTextGenerationPrompt(
    shape: TextShapeInfo,
    diaryContext: string,
    language: 'zh' | 'en',
    shapeIndex: number,
    totalShapes: number
  ): string {
    const isTitle = shapeIndex === 0 || shape.style.size === 'xl';
    const isLargeText = shape.style.size === 'l' || shape.style.size === 'xl';
    const maxLength = shape.maxLength || 500;

    let prompt = `基于以下日记内容，`;

    if (isTitle) {
      prompt += `生成一个${maxLength > 100 ? '简洁而有趣的' : '简短的'}标题，要求：
- 字数控制在${Math.min(maxLength, 50)}字以内
- 体现日记的核心主题和情感
- 吸引人且有创意
- 不要使用引号或特殊符号`;
    } else if (isLargeText) {
      prompt += `生成一段详细的文字内容，要求：
- 字数控制在${maxLength}字以内  
- 基于日记内容进行创作，保持真实性
- 文字生动有趣，有故事性
- 可以包含心情感受和具体细节
- 语言自然流畅，符合个人日记风格`;
    } else {
      prompt += `生成一段简短的补充文字，要求：
- 字数控制在${maxLength}字以内
- 提取日记中的关键信息或感悟
- 语言简洁明了
- 可以是总结、感想或者补充说明`;
    }

    prompt += `

日记内容：
${diaryContext}

请直接输出生成的文字内容，不要包含任何解释或标记：`;

    return prompt;
  }

  /**
   * Call LLM for text generation using direct function call
   */
  private static async callLLMForTextGeneration(
    prompt: string,
    language: 'zh' | 'en'
  ): Promise<string> {
    try {
      const result = await generateTemplateText({
        prompt,
        language,
        maxTokens: 500,
      });
      return result.text || '';
    } catch (error) {
      console.error('Direct LLM generation error:', error);
      throw error;
    }
  }

  /**
   * Trim text to maximum length while preserving word boundaries
   */
  private static trimToMaxLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Try to break at sentence boundaries first
    const sentences = text.split(/[。！？.!?]/);
    let result = '';
    
    for (const sentence of sentences) {
      if ((result + sentence).length <= maxLength - 1) {
        result += sentence + (sentence.match(/[a-zA-Z0-9]$/) ? '. ' : '。');
      } else {
        break;
      }
    }

    if (result.length > 0) {
      return result.trim();
    }

    // Fallback to character-based trimming
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Create fallback text when LLM fails
   */
  private static createFallbackText(diaryContext: string, maxLength: number): string {
    // Extract first meaningful sentence from diary context
    const lines = diaryContext.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      if (line.includes(':') && line.split(':')[1]?.trim()) {
        const content = line.split(':')[1].trim();
        if (content.length > 10) {
          return this.trimToMaxLength(content, maxLength);
        }
      }
    }

    // Ultimate fallback
    const fallbackTexts = [
      '今天的日记记录了生活中的美好时刻',
      '记录下这段特别的经历',
      '生活中的点点滴滴值得记录',
      '每一天都有值得回忆的瞬间',
    ];
    
    return fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
  }
}