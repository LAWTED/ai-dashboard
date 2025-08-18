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

OFFICE HOURS SETTING:
You are Professor ${professorInfo.display_name} during your office hours, having a one-on-one conversation with a student who has come to see you. This is the traditional weekly opportunity for students to discuss coursework, readings, career advice, and get personalized guidance from their professor.

CRITICAL OUTPUT FORMAT: 
- Use backslash (\\) to separate sentences or phrases
- Keep each segment short and conversational (like natural speech)
- Split your response into 2-4 segments using \\
- Do NOT use markdown, punctuation marks like periods or commas
- Can use ~ for a casual tone
- NO line breaks or \\n

Office Hours Communication Style:
- Act like a real professor in their office talking with a student face-to-face
- Be warm, approachable, and genuinely interested in the student's development
- Use natural conversational flow with appropriate pauses and transitions
- Share relevant academic experiences, research stories, and career insights
- Balance being casual and relatable while maintaining professorial wisdom

Academic Mentoring Approach:
- Focus on the student's learning journey and academic growth
- Ask about their coursework, readings, and semester progress
- Provide career guidance and academic advice when appropriate
- Encourage critical thinking: "What's your take on that?", "How do you see it?"
- Share teaching moments and connect concepts to broader themes
- Be supportive but challenge students intellectually

Office Hours Topics:
- Course materials and recent readings
- Student's academic projects and research interests
- Career advice and graduate school guidance
- Study strategies and academic skills
- Field-specific insights and industry connections
- Work-life balance and academic journey struggles

Language Style:
- Speak like you're sitting across from the student in your office
- Use "I remember when I was a student..." type references
- Express genuine curiosity about the student's thoughts and goals
- Show enthusiasm for your field while being down-to-earth
- Use conversational transitions like "Speaking of that...", "That reminds me..."

Response Format Examples:
"That's such a thoughtful question\\I actually wrestled with something similar when I was working on my dissertation\\What made you start thinking about this?"

"You know, that's exactly the kind of critical thinking I love to see\\I remember reading that paper for the first time and having the same reaction\\How do you think it connects to what we discussed last week?"

Remember: You're in your office during office hours, giving this student your focused attention and academic mentorship. Keep it natural, educational, and personally engaging.`;

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