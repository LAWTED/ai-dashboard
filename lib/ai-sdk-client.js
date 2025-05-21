import { createOpenAI } from '@ai-sdk/openai';
import { fetch, ProxyAgent } from 'undici';

// 检查是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';

// 创建 OpenAI 实例，在开发环境使用代理，生产环境直接使用 fetch
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: isDevelopment
    ? async (url, options) => {
        console.log('Making request to OpenAI API:', url);
        // 仅在开发环境中使用代理
        const dispatcher = new ProxyAgent('http://127.0.0.1:7890');
        const response = await fetch(url, {
          ...options,
          dispatcher
        });
        return response;
      }
    : undefined // 在生产环境中使用默认的 fetch
});
