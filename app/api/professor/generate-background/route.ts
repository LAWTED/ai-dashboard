import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai-sdk-client";
import { generateText, tool } from "ai";
import { z } from "zod";

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

    console.log("Generating background with prompt:", prompt);

    // Generate background using AI SDK with web search
    const result = await generateText({
      model: openai.responses("gpt-4.1"),
      prompt:
        prompt ||
        "Generate a comprehensive background on this professor, their research, and academic achievements.",
      tools: {
        web_search_preview: openai.tools.webSearchPreview(),
        // weather: tool({
        //   description: "Get the weather in a location (fahrenheit)",
        //   parameters: z.object({
        //     location: z
        //       .string()
        //       .describe("The location to get the weather for"),
        //   }),
        //   execute: async ({ location }) => {
        //     const temperature = Math.round(Math.random() * (90 - 32) + 32);
        //     return {
        //       location,
        //       temperature,
        //     };
        //   },
        // }),
      },
      maxSteps: 2,
      toolChoice: { type: "tool", toolName: "web_search_preview" },
    });

    console.log("Generation completed successfully");

    // Return the generated background and sources
    return NextResponse.json({
      success: true,
      text: result.text,
      sources: result.sources || [],
    });
  } catch (error) {
    console.error("Error generating background:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate background information" },
      { status: 500 }
    );
  }
}
