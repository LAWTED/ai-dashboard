import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Convert File to a format that OpenAI can process
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a File-like object for OpenAI
    const file = new File([buffer], audioFile.name, {
      type: audioFile.type,
    });

    // Use gpt-4o-mini-transcribe for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "gpt-4o-mini-transcribe",
      response_format: "text",
      language: "zh", // Support Chinese, can be changed to auto-detect
    });

    return NextResponse.json({
      success: true,
      transcription: transcription,
    });

  } catch (error) {
    console.error("Error in transcription API:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: "OpenAI API error", 
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}