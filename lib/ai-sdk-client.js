import { createOpenAI } from '@ai-sdk/openai';
import { fetch, ProxyAgent } from 'undici';

// Create proxy agent for fetch requests
const dispatcher = new ProxyAgent('http://127.0.0.1:7890');

// Create OpenAI instance with custom fetch that uses proxy
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: async (url, options) => {
    console.log('Making request to OpenAI API:', url);
    const response = await fetch(url, {
      ...options,
      dispatcher
    });
    return response;
  }
});
