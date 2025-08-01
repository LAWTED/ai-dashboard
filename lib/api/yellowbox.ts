// YellowBox API service layer

export interface ConversationMessage {
  type: "user" | "ai";
  content: string;
  images?: string[]; // Array of image URLs from Supabase
}

export interface YellowboxEntry {
  id: string;
  entries: {
    selectedQuestion?: string;
    conversationHistory: ConversationMessage[];
    timeOfDay: "morning" | "daytime" | "evening";
    conversationCount: number;
    completedAt: string;
  };
  metadata: {
    currentFont?: string;
    language?: string;
    totalMessages: number;
    aiSummary?: string;
    enhancedSummary?: {
      title: string;
      tags: string[];
      emotion: {
        primary: string;
        intensity: 'low' | 'medium' | 'high';
        confidence: number;
      };
      themes: string[];
    };
  };
  created_at: string;
}

export interface DiaryRequest {
  selectedQuestion: string;
  userEntry: string;
  timeOfDay: "morning" | "daytime" | "evening";
  conversationCount: number;
  images?: string[]; // Array of image URLs from Supabase
}

export interface DiaryResponse {
  response: string;
}

export interface SummaryRequest {
  conversationHistory: ConversationMessage[];
  language: string;
  selectedQuestion: string;
  timeOfDay: "morning" | "daytime" | "evening";
}

export interface SummaryResponse {
  success: boolean;
  summary: string;
  enhanced: {
    title: string;
    tags: string[];
    emotion: {
      primary: string;
      intensity: "low" | "medium" | "high";
      confidence: number;
    };
    themes: string[];
  };
  language: string;
}

export interface SaveEntriesRequest {
  entries: {
    selectedQuestion: string;
    conversationHistory: ConversationMessage[];
    timeOfDay: "morning" | "daytime" | "evening";
    conversationCount: number;
    completedAt: string;
  };
  session_id: string;
  metadata: {
    currentFont: string;
    language: string;
    totalMessages: number;
    aiSummary?: string;
    enhancedSummary?: unknown;
  };
  analytics: unknown;
}

export interface QuoteRequest {
  entryId: string;
  template?: string;
}

export interface QuoteResponse {
  quote: string;
  success: boolean;
}

// API functions
export const yellowboxApi = {
  // Get diary AI response
  async getDiaryResponse(data: DiaryRequest): Promise<DiaryResponse> {
    const response = await fetch("/api/yellowbox/diary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to get diary response: ${response.status}`);
    }

    return response.json();
  },

  // Generate summary
  async generateSummary(data: SummaryRequest): Promise<SummaryResponse> {
    const response = await fetch("/api/yellowbox/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.status}`);
    }

    return response.json();
  },

  // Save entries
  async saveEntries(data: SaveEntriesRequest): Promise<{ success: boolean; error?: string }> {
    const response = await fetch("/api/yellowbox/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save entries: ${response.status}`);
    }

    return response.json();
  },

  // Get all entries
  async getEntries(): Promise<YellowboxEntry[]> {
    const response = await fetch("/api/yellowbox/entries", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to get entries: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? (data.data || []) : [];
  },

  // Get single entry
  async getEntry(id: string): Promise<YellowboxEntry> {
    const response = await fetch(`/api/yellowbox/entries?id=${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to get entry: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data[0];
    }
    throw new Error('Entry not found');
  },

  // Delete entry
  async deleteEntry(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/yellowbox/entries?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete entry: ${response.status}`);
    }

    return response.json();
  },

  // Generate quote
  async generateQuote(data: QuoteRequest): Promise<QuoteResponse> {
    const response = await fetch("/api/yellowbox/generate-quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate quote: ${response.status}`);
    }

    return response.json();
  },
};