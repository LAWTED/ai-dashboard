/**
 * 模板系统共享工具函数
 * 提供 Tldraw snapshot 处理、文本处理等通用功能
 */

import { TldrawRichText, TldrawTextShape, TldrawRecord, DiaryContent } from './types/template';

/**
 * 判断记录是否为文本形状
 */
export function isTextShape(record: TldrawRecord): boolean {
  return record.typeName === 'shape' && record.type === 'text';
}

/**
 * 从富文本中提取纯文本
 */
export function extractPlainText(richText: TldrawRichText): string {
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
    text += '\n';
  }

  return text.trim();
}

/**
 * 创建富文本结构
 */
export function createRichText(text: string): TldrawRichText {
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
 * 判断文本是否应该被替换
 * MVP 版本：简化逻辑，大部分可见文本都替换
 */
export function shouldReplaceText(text: string, _shape: TldrawTextShape): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
  const trimmedText = text.trim();
  
  // 空文本不替换
  if (!trimmedText) {
    return false;
  }

  // 纯 emoji 或符号不替换（扩展支持更多 emoji 范围）
  const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]+$/u;
  if (emojiRegex.test(trimmedText)) {
    return false;
  }

  // 纯标点符号不替换
  if (/^[^\w\s\u4e00-\u9fff]+$/.test(trimmedText)) {
    return false;
  }
  
  // 单个数字或字母不替换（如页码、标号等）
  if (/^[0-9a-zA-Z]$/.test(trimmedText)) {
    return false;
  }
  
  // 日期格式不替换（如 2024-01-01, 01/01 等）
  if (/^\d{1,4}[-/]\d{1,2}([-/]\d{1,4})?$/.test(trimmedText)) {
    return false;
  }

  // MVP: 超过2个字符的有意义文本都替换
  return trimmedText.length > 2;
}

/**
 * 确定文本类型 - 简化版本
 */
export function determineTextType(text: string, shape: TldrawTextShape): 'title' | 'body' {
  // 根据字体大小判断
  if (['xl', 'l'].includes(shape.props.size)) {
    return 'title';
  }

  // 根据文本长度判断  
  if (text.length <= 30) {
    return 'title';
  }

  // 默认为正文
  return 'body';
}

/**
 * 计算最大文本长度
 */
export function calculateMaxLength(originalText: string, width: number, size: string): number {
  // 基础长度估算
  const baseLengthPerWidth = {
    'xs': 0.8,
    's': 0.6,
    'm': 0.4,
    'l': 0.3,
    'xl': 0.2
  };

  const ratio = baseLengthPerWidth[size as keyof typeof baseLengthPerWidth] || 0.4;
  const estimatedMaxLength = Math.floor(width * ratio);

  // 考虑原文长度，给一定的弹性
  const originalLength = originalText.length;
  const flexibleLength = Math.max(originalLength * 1.5, estimatedMaxLength);

  // 设置合理的上下限
  return Math.max(10, Math.min(flexibleLength, 500));
}

/**
 * 将文本截断到指定长度，保持句子完整性
 */
export function trimTextToLength(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // 尝试在句号处截断
  const sentences = text.split(/[。！？.!?]/);
  let result = '';
  
  for (let i = 0; i < sentences.length - 1; i++) {
    const sentence = sentences[i];
    const withPunctuation = result + sentence + (sentence.match(/[a-zA-Z0-9]$/) ? '.' : '。');
    
    if (withPunctuation.length <= maxLength) {
      result = withPunctuation;
    } else {
      break;
    }
  }

  if (result.length > 0) {
    return result;
  }

  // 回退到字符截断
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 准备日记上下文用于文本生成
 */
export function prepareDiaryContext(diaryContent: DiaryContent): string {
  let context = '';
  
  if (diaryContent.selectedQuestion) {
    context += `问题: ${diaryContent.selectedQuestion}\n\n`;
  }

  if (diaryContent.conversationHistory?.length > 0) {
    context += '对话内容:\n';
    diaryContent.conversationHistory.forEach((msg) => {
      const prefix = msg.type === 'user' ? '我:' : 'AI:';
      context += `${prefix} ${msg.content}\n`;
    });
    context += '\n';
  }

  if (diaryContent.summary) {
    context += `总结: ${diaryContent.summary}\n\n`;
  }

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
 * 创建回退文本
 */
export function createFallbackText(
  diaryContext: string,
  textType: 'title' | 'body',
  maxLength: number
): string {
  if (textType === 'title') {
    const fallbackTitles = [
      '今日心情记录',
      '生活随笔',
      '今天的故事',
      '心情小记',
      '日常片段'
    ];
    return fallbackTitles[Math.floor(Math.random() * fallbackTitles.length)];
  }

  // 尝试从日记内容中提取第一句话
  const lines = diaryContext.split('\n').filter(line => line.trim().length > 0);
  for (const line of lines) {
    if (line.includes(':') && line.split(':')[1]?.trim()) {
      const content = line.split(':')[1].trim();
      if (content.length > 10) {
        return trimTextToLength(content, maxLength);
      }
    }
  }

  const fallbackTexts = [
    '记录生活中的美好时刻',
    '今天有很多值得记录的事情',
    '生活中的点点滴滴',
    '每一天都有新的收获'
  ];
  
  return fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
}

/**
 * 创建生成提示词
 */
export function createGenerationPrompt(
  textType: 'title' | 'body',
  maxLength: number,
  diaryContext: string,
  _language: 'zh' | 'en' // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  const isTitle = textType === 'title';
  
  let prompt = `基于以下日记内容，`;

  if (isTitle) {
    prompt += `生成一个简洁有趣的标题，要求：
- 字数控制在${Math.min(maxLength, 30)}字以内
- 体现日记的核心主题和情感
- 吸引人且有创意
- 不要使用引号或特殊符号`;
  } else {
    prompt += `生成一段内容文字，要求：
- 字数控制在${maxLength}字以内  
- 基于日记内容，保持真实性
- 文字生动有趣，有故事性
- 可以包含心情感受和具体细节
- 语言自然流畅`;
  }

  prompt += `

日记内容：
${diaryContext}

请直接输出生成的文字，不要包含任何解释或标记：`;

  return prompt;
}