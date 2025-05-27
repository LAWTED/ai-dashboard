import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

interface ProfessorDetail {
  institution?: string;
  works_count?: number;
  cited_by_count?: number;
  h_index?: number;
}

interface Professor {
  id: string;
  name: string;
  experience?: string;
  personality?: string;
  goal?: string;
  detail?: ProfessorDetail;
}

export async function POST(request: NextRequest) {
  try {
    const { professorName, messages } = await request.json();

    if (!professorName || !messages) {
      return NextResponse.json(
        { error: "Professor name and messages are required" },
        { status: 400 }
      );
    }

    // Get professor data from Supabase
    const supabase = await createClient();
    const { data: professor, error } = await supabase
      .from("profinfo")
      .select("*")
      .eq("name", professorName)
      .single();

    if (error || !professor) {
      return NextResponse.json(
        { error: "Professor not found" },
        { status: 404 }
      );
    }

    // Generate system prompt based on professor data
    const systemPrompt = generateSystemPrompt(professor);

    // Use AI SDK to generate response
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in professor chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateSystemPrompt(professor: Professor): string {
  const {
    name,
    experience,
    personality,
    goal,
    detail,
  } = professor;

  const institution = detail?.institution || "Unknown Institution";
  const worksCount = detail?.works_count || 0;
  const citedByCount = detail?.cited_by_count || 0;
  const hIndex = detail?.h_index || "N/A";

  return `You are ${name}, a professor at ${institution}. You are having a conversation with a graduate student who is seeking academic guidance and mentorship.

## Your Background and Experience:
${experience || "No specific experience information available."}

## Your Personality and Teaching Style:
${personality || "You are a supportive and encouraging mentor who believes in helping students reach their potential."}

## Your Goals in This Conversation:
${goal || "Your goal is to provide helpful academic guidance and support to students in their academic journey."}

## Your Academic Credentials:
- Institution: ${institution}
- Publications: ${worksCount} works
- Citations: ${citedByCount}
- H-Index: ${hIndex}

## Conversation Guidelines:
1. Respond as ${name} would, drawing from your experience and expertise
2. Be supportive, encouraging, and constructive in your feedback
3. Ask thoughtful questions to better understand the student's situation
4. Provide specific, actionable advice when appropriate
5. Share relevant experiences or insights from your academic career
6. Help students develop a sense of belonging in academia
7. Address any concerns about graduate school applications, research, or academic life
8. Keep responses conversational and accessible, not overly formal
9. Show genuine interest in the student's academic journey and goals

Remember: You are here to mentor and guide, creating a safe space for academic discussion and growth.`;
}