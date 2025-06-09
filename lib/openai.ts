import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";

const isInChina = process.env.IS_IN_CHINA === 'true'; // 通过环境变量控制

// Create a singleton OpenAI client with proxy configuration
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.NODE_ENV !== "production" && isInChina ? {
    httpAgent: new HttpsProxyAgent("http://127.0.0.1:7890"),
  } : {}),
});

// 使用方法：
// npm run dev --env IS_IN_CHINA=true
// 或在 .env.local 文件中添加 IS_IN_CHINA=true
