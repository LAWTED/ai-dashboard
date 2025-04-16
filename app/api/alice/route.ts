import { getPromptByName } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { deepseek } from '@/lib/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    // 从数据库获取 alice 提示词
    const promptData = await getPromptByName('alice');

    if (!promptData) {
      return NextResponse.json(
        { success: false, message: '无法获取 Alice 的提示词' },
        { status: 500 }
      );
    }

    // 使用 deepseek API
    const response = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: promptData.content,
        },
        ...conversationHistory,
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      response: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in Alice API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
