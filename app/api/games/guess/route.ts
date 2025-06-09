import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { generateText } from "ai";
import {
  ConversationMessage,
  ApiGameConfig,
  mbtiApiConfig,
  foodApiConfig,
  companyApiConfig
} from "@/app/(dashboard)/games/config";

// Game configurations
const gameConfigs: Record<string, ApiGameConfig> = {
  mbti: mbtiApiConfig,
  food: foodApiConfig,
  company: companyApiConfig,
  // 可以在这里添加更多游戏类型
};

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { message, gameType = 'mbti', gameParam, isGuessing, conversationHistory = [] } = await req.json();

    // Validate game type
    if (!gameConfigs[gameType]) {
      return NextResponse.json(
        { success: false, message: `Unsupported game type: ${gameType}` },
        { status: 400 }
      );
    }

    const gameConfig = gameConfigs[gameType];

    if (!message || !gameParam) {
      return NextResponse.json(
        { success: false, message: `Message and ${gameType} parameters are required` },
        { status: 400 }
      );
    }

    if (isGuessing) {
      // User is making a guess
      const userGuess = gameType === 'mbti' ? message.toUpperCase() : message;
      const isCorrect = gameConfig.validateGuess(userGuess, gameParam);

      const responseText = isCorrect
        ? gameConfig.generateCorrectResponse(gameParam)
        : gameConfig.generateIncorrectResponse(userGuess);

      return NextResponse.json({
        success: true,
        text: responseText,
        isCorrect
      });
    }

    // Create system message with game instructions
    const systemMessage = {
      role: "system",
      content: gameConfig.generateSystemMessage(gameParam)
    };

    // Format conversation history for the messages array
    const formattedMessages = [
      systemMessage,
      ...conversationHistory.map((msg: ConversationMessage) => msg),
      { role: "user", content: message }
    ];

    // Generate response using AI SDK with messages
    const result = await generateText({
      model: openai.responses("gpt-4.1"),
      messages: formattedMessages,
    });

    // Return the generated response
    return NextResponse.json({
      success: true,
      text: result.text,
      isCorrect: false
    });
  } catch (error) {
    console.error(`Error generating ${error instanceof Error ? error.message : 'unknown error'}:`, error);
    return NextResponse.json(
      { success: false, message: "Failed to respond" },
      { status: 500 }
    );
  }
}