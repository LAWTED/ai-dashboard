import OpenAI from "openai";

// 验证环境变量存在
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('Missing DEEPSEEK_API_KEY environment variable. Please check your .env.local file.');
}

export const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});
