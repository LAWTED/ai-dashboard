import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { generateText } from "ai";

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate background using AI SDK with web search
    const result = await generateText({
      model: openai.responses("gpt-4.1"),
      prompt: prompt,
    });

    // Return the generated background and sources
    return NextResponse.json({
      success: true,
      text: result.text,
      sources: result.sources || [],
    });
  } catch (error) {
    console.error("Error generating background:", error);
    return NextResponse.json(
      { success: false, message: "Failed to respond" },
      { status: 500 }
    );
  }
}
