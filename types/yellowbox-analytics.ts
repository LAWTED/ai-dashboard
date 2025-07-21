// Types for YellowBox user behavior analytics

export interface TypingPattern {
  timestamp: number;
  keyCode: string;
  action: 'keydown' | 'keyup';
  textLength: number;
  isBackspace: boolean;
}

export interface EditingBehavior {
  totalBackspaces: number;
  totalCharactersDeleted: number;
  revisionCount: number;
  pasteCount: number;
  textChanges: Array<{
    timestamp: number;
    action: 'insert' | 'delete' | 'paste';
    position: number;
    text: string;
  }>;
}

export interface SessionTiming {
  sessionStart: string;
  sessionEnd?: string;
  totalDuration?: number; // in milliseconds
  activeWritingTime: number; // time actually typing
  pauseDurations: number[]; // array of pause lengths
  longestPause: number;
  firstResponseTime?: number; // time to first user input
}

export interface UserInteractions {
  voiceButtonClicks: number;
  voiceInputUsage: number; // number of times voice was used
  fontSwitches: Array<{
    timestamp: number;
    from: string;
    to: string;
  }>;
  languageSwitches: Array<{
    timestamp: number;
    from: string;
    to: string;
  }>;
  resetButtonClicks: number;
  submitAttempts: number;
}

export interface ContentAnalysis {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  writingSpeed: number; // words per minute
  sentimentScore?: number; // -1 to 1
  topicsDetected?: string[];
  languageDetected?: string;
  readabilityScore?: number;
}

export interface PerformanceMetrics {
  apiResponseTimes: Array<{
    endpoint: string;
    responseTime: number;
    timestamp: number;
    success: boolean;
  }>;
  errorCounts: {
    transcriptionErrors: number;
    aiResponseErrors: number;
    savingErrors: number;
    networkErrors: number;
  };
  loadTimes: {
    pageLoad: number;
    firstInteraction: number;
  };
}

export interface YellowBoxAnalytics {
  sessionId: string;
  userId: string;
  
  // Core behavior tracking
  typingPatterns: TypingPattern[];
  editingBehavior: EditingBehavior;
  sessionTiming: SessionTiming;
  userInteractions: UserInteractions;
  
  // Content insights
  contentAnalysis: ContentAnalysis;
  
  // Performance monitoring
  performance: PerformanceMetrics;
  
  // Device and environment
  deviceInfo?: {
    userAgent: string;
    screenResolution: string;
    isMobile: boolean;
    browserLanguage: string;
  };
  
  // Privacy settings
  analyticsConsent: boolean;
  anonymized: boolean;
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
  analytics?: YellowBoxAnalytics;
  status: string;
  created_at: string;
}