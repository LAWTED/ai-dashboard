import { openai } from '@ai-sdk/openai';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

export interface TextGenerationRequest {
  prompt: string;
  language: 'zh' | 'en';
  maxTokens?: number;
}

export interface TextGenerationResult {
  text: string;
  usage?: Record<string, unknown>;
}

/**
 * Generate text using LLM - can be called directly from server-side code
 */
export async function generateTemplateText({
  prompt,
  language = 'zh',
  maxTokens = 500
}: TextGenerationRequest): Promise<TextGenerationResult> {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required');
  }

  // Choose model based on language and availability
  const isInChina = process.env.IS_IN_CHINA === 'true';
  let model;
  let systemPrompt = '';

  if (language === 'zh') {
    model = isInChina ? deepseek('deepseek-chat') : openai('gpt-4o-mini');
    systemPrompt = `你是一个专业的文字创作助手，专门帮助用户基于日记内容生成适合的文字。你的任务是：

1. 仔细理解用户提供的日记内容和要求
2. 生成符合要求的中文文字内容
3. 保持内容的真实性和个人化
4. 确保文字自然流畅，符合中文表达习惯
5. 严格控制字数，不要超出限制

请直接输出生成的文字，不要包含任何解释、标记或额外内容。`;
  } else {
    model = openai('gpt-4o-mini');
    systemPrompt = `You are a professional text creation assistant that helps users generate appropriate text based on diary content. Your tasks are:

1. Carefully understand the diary content and requirements provided by the user
2. Generate English text content that meets the requirements
3. Maintain authenticity and personalization of the content
4. Ensure the text is natural and fluent
5. Strictly control word count and don't exceed the limit

Please output the generated text directly without any explanations, markers, or additional content.`;
  }

  const result = await generateText({
    model,
    system: systemPrompt,
    prompt,
    maxTokens,
    temperature: 0.7,
  });

  return {
    text: result.text.trim(),
    usage: result.usage,
  };
}