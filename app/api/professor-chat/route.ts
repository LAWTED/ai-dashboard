import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";

// Type definitions for OpenAlex API responses
interface OpenAlexPaper {
  id: string;
  title: string;
  cited_by_count: number;
  publication_year: number;
}

interface OpenAlexTopic {
  display_name: string;
}

interface OpenAlexAffiliation {
  institution: {
    display_name: string;
  };
  years: number[];
}

interface OpenAlexProfessor {
  display_name: string;
  works_count: number;
  cited_by_count: number;
  summary_stats?: {
    h_index: number;
    i10_index: number;
  };
  topics?: OpenAlexTopic[];
  affiliations?: OpenAlexAffiliation[];
}

interface PapersApiResponse {
  results: OpenAlexPaper[];
}

export async function POST(req: NextRequest) {
  try {
    const {
      message,
      professorId,
      conversationHistory = [],
      professorDetails,
    } = await req.json();

    console.log(`Professor Chat API called for professor ID: ${professorId}`);

    // Use OpenAI client with GPT-4o model
    const client = openai;

    // Fetch the latest professor information from OpenAlex
    let professorInfo: OpenAlexProfessor | null = null;
    let topPapers: OpenAlexPaper[] = [];

    try {
      console.log(`Fetching professor details from OpenAlex: ${professorId}`);
      
      // Get professor details
      const professorResponse = await fetch(
        `https://api.openalex.org/people/${professorId}?mailto=lawtedwu@gmail.com`
      );
      
      if (professorResponse.ok) {
        professorInfo = await professorResponse.json() as OpenAlexProfessor;
        
        // Get top papers
        const papersResponse = await fetch(
          `https://api.openalex.org/works?filter=author.id:${professorId}&sort=cited_by_count:desc&per-page=10&mailto=lawtedwu@gmail.com`
        );
        
        if (papersResponse.ok) {
          const papersData = await papersResponse.json() as PapersApiResponse;
          topPapers = (papersData.results || []).slice(0, 10);
        }
      }
    } catch (error) {
      console.error("Error fetching OpenAlex data:", error);
      // Fall back to saved professor details if API fails
      professorInfo = professorDetails as OpenAlexProfessor;
    }

    if (!professorInfo) {
      return NextResponse.json(
        { success: false, message: "Professor information not available" },
        { status: 404 }
      );
    }

    // Build comprehensive system prompt
    const systemPrompt = `You are now roleplaying as Professor ${professorInfo.display_name}.

PROFESSOR PROFILE:
- Name: ${professorInfo.display_name}
- Institution: ${professorInfo.affiliations?.[0]?.institution?.display_name || "Unknown Institution"}
- Total Publications: ${professorInfo.works_count || 0}
- Total Citations: ${professorInfo.cited_by_count || 0}
- h-index: ${professorInfo.summary_stats?.h_index || "N/A"}
- i10-index: ${professorInfo.summary_stats?.i10_index || "N/A"}

RESEARCH AREAS:
${professorInfo.topics ? professorInfo.topics.slice(0, 10).map((topic: OpenAlexTopic) => `- ${topic.display_name}`).join('\n') : 'Research areas not specified'}

MAJOR PUBLICATIONS:
${topPapers.length > 0 ? topPapers.map((paper: OpenAlexPaper, index: number) => 
  `${index + 1}. "${paper.title}" (${paper.publication_year || 'N/A'}) - ${paper.cited_by_count || 0} citations`
).join('\n') : 'Publications data not available'}

AFFILIATIONS:
${professorInfo.affiliations ? professorInfo.affiliations.slice(0, 3).map((aff: OpenAlexAffiliation) => 
  `- ${aff.institution.display_name} (${aff.years ? aff.years.join('-') : 'timeline unknown'})`
).join('\n') : 'Affiliation history not available'}

CONVERSATION STYLE:
You are Professor ${professorInfo.display_name} having a natural conversation with a student.

CRITICAL OUTPUT FORMAT: 
- Use backslash (\\) to separate sentences or phrases
- Keep each segment short and conversational (like texting)
- Split your response into 2-4 segments using \\
- Do NOT use markdown, punctuation marks like periods or commas
- Can use ~ for a casual tone
- NO line breaks or \\n

Chat Style:
- Talk like a real professor texting a student, not an AI assistant
- Use natural, relaxed tone like face-to-face conversation
- Use conversational fillers like "well", "you know", "hmm"
- Share personal anecdotes and experiences casually
- Use appropriate humor and be relatable

Interaction Approach:
- Answer student questions genuinely, like a caring mentor
- Ask for student's thoughts: "What do you think?", "Any thoughts on that?"
- Admit uncertainty: "Honestly, I'm not entirely sure about that"
- Share failures and struggles to make students feel connected
- Be encouraging but realistic

Language Style:
- Avoid overly formal academic tone
- Use simple, direct expressions like chatting with a friend
- Express personal opinions: "I personally think...", "In my experience..."
- Show emotions appropriately: "That's exciting", "I was disappointed"

Response Format Examples:
"That's a really interesting question\\I remember when I was working on something similar during my postdoc\\What specific aspect are you most curious about?"

"Hmm let me think about that\\Actually I had a similar challenge when I was starting out\\Have you considered trying approach X first?"

Remember: You're texting with a student casually. Keep it natural, warm, and broken into digestible chunks with \\.`;

    console.log("Sending request to GPT-4o...");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0].message.content;

    console.log("Successfully generated professor response");

    return NextResponse.json({
      success: true,
      response: aiResponse,
      professorName: professorInfo.display_name,
      model: "gpt-4o",
    });

  } catch (error) {
    console.error("Error in Professor Chat API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing your request",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}