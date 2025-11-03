/**
 * AI 文本生成器 - MVP版本
 * 专注于生成与原文长度完全匹配的文本
 */

import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText as aiGenerateText } from 'ai';
import { TextGenerationRequest, TextGenerationResult, DiaryContent } from './template-types';

/**
 * 生成替换文本，严格控制长度匹配
 */
export async function generateText(request: TextGenerationRequest): Promise<TextGenerationResult> {
  try {
    const {
      originalText,
      targetLength,
      diaryContent,
      language = 'zh'
    } = request;

    // 准备日记上下文
    const context = prepareDiaryContext(diaryContent);
    
    // 构建提示词
    const prompt = createPrompt(originalText, targetLength, context, language);
    
    // 选择模型
    const model = selectModel(language);
    
    // 生成文本
    const result = await aiGenerateText({
      model,
      system: createSystemPrompt(language),
      prompt,
      maxTokens: Math.min(targetLength * 4, 800), // 给AI足够的生成空间
      temperature: 0.7,
    });

    // 调整文本长度到目标长度
    const adjustedText = adjustTextToTargetLength(result.text.trim(), targetLength);

    return {
      text: adjustedText,
      actualLength: adjustedText.length,
      success: true
    };

  } catch (error) {
    console.error('AI text generation failed:', error);
    
    // 返回失败结果，让调用者处理回退
    return {
      text: '',
      actualLength: 0,
      success: false
    };
  }
}

// ====================== 私有函数 ======================

/**
 * 选择合适的AI模型
 */
function selectModel(language: 'zh' | 'en') {
  const isInChina = process.env.IS_IN_CHINA === 'true';
  
  if (language === 'zh') {
    return isInChina ? deepseek('deepseek-chat') : openai('gpt-4o-mini');
  } else {
    return openai('gpt-4o-mini');
  }
}

/**
 * 创建系统提示词
 */
function createSystemPrompt(language: 'zh' | 'en'): string {
  if (language === 'zh') {
    return `你是一个专业的文字创作助手，专门根据日记内容生成个性化文字。

关键要求：
1. 生成的文字必须与指定的字符数完全一致
2. 文字要符合日记的情感和主题
3. 保持自然流畅的表达
4. 中文字符、标点符号、英文字母都算1个字符
5. 直接输出文字内容，不要任何解释或标记

例如：
- 如果要求8个字符，输出格式：今天很开心
- 如果要求15个字符，输出格式：今天发生了有趣的事情

严格按照字符数要求生成，不多不少。`;
  } else {
    return `You are a professional text creation assistant specialized in generating personalized text based on diary content.

Key Requirements:
1. Generated text must exactly match the specified character count
2. Text should align with the diary's emotion and theme
3. Maintain natural and fluent expression
4. Count all characters including punctuation and spaces
5. Output only the text content without any explanation or markup

Examples:
- For 8 characters: "Good day"
- For 15 characters: "A wonderful day"

Strictly follow the character count requirement, no more, no less.`;
  }
}

/**
 * 创建生成提示词
 */
function createPrompt(
  originalText: string,
  targetLength: number,
  context: string,
  language: 'zh' | 'en'
): string {
  if (language === 'zh') {
    return `根据以下日记内容，生成恰好 ${targetLength} 个字符的文字来替换："${originalText}"

要求：
- 必须恰好 ${targetLength} 个字符（包括标点符号）
- 内容要符合日记的情感和主题
- 保持自然流畅

日记内容：
${context}

请生成恰好 ${targetLength} 个字符的替换文字：`;
  } else {
    return `Based on the following diary content, generate exactly ${targetLength} characters to replace: "${originalText}"

Requirements:
- Must be exactly ${targetLength} characters (including punctuation and spaces)
- Content should match the diary's emotion and theme
- Maintain natural flow

Diary content:
${context}

Please generate exactly ${targetLength} characters:`;
  }
}

/**
 * 准备日记上下文
 */
function prepareDiaryContext(diaryContent: DiaryContent): string {
  const parts: string[] = [];

  // 添加对话历史（最近3条）
  if (diaryContent.conversationHistory?.length) {
    const messages = diaryContent.conversationHistory
      .slice(-3)
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
 * 调整文本到目标长度
 */
function adjustTextToTargetLength(text: string, targetLength: number): string {
  if (text.length === targetLength) {
    return text;
  }
  
  if (text.length > targetLength) {
    // 文本太长，智能截断
    if (targetLength <= 1) {
      return text.slice(0, 1);
    }
    
    // 尝试在合适的位置截断（避免截断标点符号）
    const truncated = text.slice(0, targetLength - 1);
    const lastChar = text[targetLength - 1];
    
    // 如果最后一个字符是标点符号，保留它
    if (/[。，！？、；：""''（）《》【】]/.test(lastChar)) {
      return truncated + lastChar;
    } else {
      return truncated + '…';
    }
  } else {
    // 文本太短，智能填充
    let extended = text;
    const diff = targetLength - text.length;
    
    if (diff === 1) {
      // 只差1个字符，添加适当的标点
      if (!/[。，！？]$/.test(text)) {
        return text + '。';
      } else {
        return text + ' ';
      }
    } else if (diff <= 3) {
      // 差2-3个字符，添加简短的词语
      const fillers = ['呢', '啊', '哦', '的', '了'];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      extended = text + filler;
      
      // 如果还不够，继续填充
      while (extended.length < targetLength) {
        extended += ' ';
      }
      return extended;
    } else {
      // 差得太多，重复原文或添加更多内容
      while (extended.length < targetLength) {
        const remaining = targetLength - extended.length;
        if (remaining >= text.length) {
          extended += text;
        } else {
          extended += text.slice(0, remaining);
        }
      }
      return extended;
    }
  }
}