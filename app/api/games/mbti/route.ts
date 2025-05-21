import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { generateText } from "ai";

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { message, mbtiType, isGuessing } = await req.json();

    if (!message || !mbtiType) {
      return NextResponse.json(
        { success: false, message: "Message and MBTI type are required" },
        { status: 400 }
      );
    }

    if (isGuessing) {
      // User is making a guess, compare with AI's MBTI type
      const userGuess = message.toUpperCase();
      const isCorrect = userGuess.includes(mbtiType);

      const responseText = isCorrect
        ? `恭喜你猜对了！我确实是${mbtiType}类型。要再玩一次吗？`
        : `不，我不是${userGuess}类型。再猜猜看！`;

      return NextResponse.json({
        success: true,
        text: responseText,
        isCorrect
      });
    }

    // Generate response using AI SDK
    const prompt = `
    你正在扮演一个MBTI性格类型测试游戏中的角色，你的MBTI类型是${mbtiType}。
    用户正在尝试通过与你的对话来猜测你的MBTI类型。

    请根据${mbtiType}类型的特征来回答用户的问题。回答要简洁、自然，不要明确透露你的MBTI类型。
    不要超过100字。不要在回答中使用"作为一个${mbtiType}"这样的表述。

    MBTI类型特征参考：

    I (内向): 更喜欢独处或小团体，社交会消耗能量
    E (外向): 喜欢社交，与人互动会获得能量

    N (直觉): 关注可能性和创新，思考未来
    S (感觉): 关注细节和现实，依赖经验和事实

    T (思考): 决策基于逻辑和客观分析
    F (情感): 决策考虑人际关系和价值观

    J (判断): 喜欢计划和条理，喜欢确定性
    P (感知): 保持灵活性，适应变化，不喜欢严格规划

    用户问题：${message}

    请给出你作为${mbtiType}类型的回答：`;

    const result = await generateText({
      model: openai.responses("gpt-4o"),
      prompt: prompt,
    });

    // Return the generated response
    return NextResponse.json({
      success: true,
      text: result.text,
      isCorrect: false
    });
  } catch (error) {
    console.error("Error generating MBTI response:", error);
    return NextResponse.json(
      { success: false, message: "Failed to respond" },
      { status: 500 }
    );
  }
}