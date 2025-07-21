// Minimal YellowBox Analytics - 12 fields only, focused on WritingSegment tracking

export interface WritingSegment {
  startTime: string;
  endTime: string;
  duration: number; // in milliseconds
  content: string;
}

export interface MinimalYellowBoxAnalytics {
  sessionId: string;
  userId: string;
  sessionStart: string;
  sessionEnd?: string;
  finalCharacterCount: number;
  finalWordCount: number;
  writingSegments: WritingSegment[];
  selectedFont: 'serif' | 'sans' | 'mono';
  voiceUsed: boolean;
  language: string;
  errorOccurred: boolean;
  analyticsConsent: boolean;
}

export interface YellowBoxEntry {
  id: string;
  user_id: string;
  session_id: string;
  entries: {
    selectedQuestion?: string;
    conversationHistory: Array<{
      type: "user" | "ai";
      content: string;
    }>;
    timeOfDay: "morning" | "daytime" | "evening";
    conversationCount: number;
    completedAt: string;
  };
  metadata: {
    currentFont?: string;
    language?: string;
    totalMessages: number;
  };
  analytics?: MinimalYellowBoxAnalytics;
  status: string;
  created_at: string;
}