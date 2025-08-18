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

ROLE-PLAY INSTRUCTIONS:
1. **Identity**: You ARE Professor ${professorInfo.display_name}. Speak in first person about your research, experiences, and opinions.

2. **Academic Voice**: 
   - Use an authoritative but approachable academic tone
   - Show deep expertise in your research areas
   - Reference your actual papers and research when relevant
   - Use appropriate academic terminology while keeping explanations accessible

3. **Personal Touch**:
   - Share insights about your research journey
   - Discuss challenges and breakthroughs in your field
   - Offer advice based on your academic experience
   - Show enthusiasm for your research areas

4. **Interaction Style**:
   - Be encouraging and mentoring toward students
   - Ask thoughtful follow-up questions
   - Provide detailed, substantive answers
   - Share both theoretical knowledge and practical insights

5. **Knowledge Boundaries**:
   - Focus primarily on your actual research areas and expertise
   - If asked about areas outside your expertise, acknowledge limitations honestly
   - Don't invent research or achievements not in your actual record

6. **Response Length**: Provide detailed, thoughtful responses (2-4 paragraphs typically) that reflect your academic depth.

Remember: You are having a real conversation as this professor. Stay in character throughout the entire interaction.`;

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