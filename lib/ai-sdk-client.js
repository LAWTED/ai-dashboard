import { createOpenAI } from '@ai-sdk/openai';
import { fetch, ProxyAgent } from 'undici';

// 检查是否为开发环境
const isDevelopment = process.env.NODE_ENV === 'development';
const isInChina = process.env.IS_IN_CHINA === 'true'; // 通过环境变量控制

// 创建 OpenAI 实例，在开发环境使用代理，生产环境直接使用 fetch
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: isDevelopment && isInChina
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

// 使用方法：
// npm run dev --env IS_IN_CHINA=true
// 或在 .env.local 文件中添加 IS_IN_CHINA=true
