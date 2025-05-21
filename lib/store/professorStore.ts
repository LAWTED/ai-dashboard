import { create } from 'zustand';

// Types
export type LogEntry = {
  message: string;
  timestamp: number;
  level: "info" | "error" | "warning" | "debug" | "success";
  color?: string;
};

export type Author = {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  last_known_institutions?: {
    id: string;
    display_name: string;
    country_code?: string;
  }[];
};

// Type for individual work/paper from OpenAlex API
export type Work = {
  id: string;
  title: string;
  cited_by_count: number;
  publication_year: number;
  doi: string;
  primary_location?: {
    source?: {
      url?: string;
    };
    url?: string;
  };
};

export type AuthorDetails = {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  summary_stats?: {
    h_index: number;
    i10_index: number;
  };
  affiliations?: {
    institution: {
      display_name: string;
      country_code?: string;
    };
    years: number[];
  }[];
  topics?: {
    display_name: string;
    count: number;
  }[];
  topPapers?: {
    id: string;
    title: string;
    cited_by_count: number;
    publication_year: number;
    doi: string;
    url: string;
  }[];
};

export type Question = {
  question: string;
  storage_key: string;
  storage_type: string;
  example_response: string;
};

type ProfessorFormData = {
  name: string;
  personality: string;
  personalityTags: string[];
  experience: string;
  goal: string;
  questions: Question[];
};

type ProfessorState = {
  currentStep: number;
  formData: ProfessorFormData;
  logs: LogEntry[];
  isSearching: boolean;
  authors: Author[];
  selectedAuthor: Author | null;
  authorDetails: AuthorDetails | null;

  // Actions
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<ProfessorFormData>) => void;
  addLog: (logEntry: LogEntry) => void;
  clearLogs: () => void;
  setIsSearching: (isSearching: boolean) => void;
  setAuthors: (authors: Author[]) => void;
  setSelectedAuthor: (author: Author | null) => void;
  setAuthorDetails: (details: AuthorDetails | null) => void;
  addTag: (type: "personality" | "experience", tag: string) => void;
  removeTag: (type: "personality" | "experience", tag: string) => void;

  // Logger functions
  logger: {
    info: (message: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    debug: (message: string) => void;
  };

  // API functions
  searchAuthors: (name: string) => Promise<void>;
  fetchAuthorDetails: (authorId: string) => Promise<void>;
  handleSubmit: () => Promise<void>;
};

// ANSI color codes constants
const COLORS = {
  RED: "\u001b[31m",
  GREEN: "\u001b[32m",
  YELLOW: "\u001b[33m",
  BLUE: "\u001b[34m",
  MAGENTA: "\u001b[35m",
  CYAN: "\u001b[36m",
  RESET: "\u001b[0m",
};

// Initial form data
const initialFormData: ProfessorFormData = {
  name: "Geoffrey L. Cohen",
  personality:
    "I believe in creating a sense of belonging for all students. My teaching approach focuses on perspective-getting - asking thoughtful questions and truly listening to answers rather than assuming I understand students' experiences. I encourage reflection on core values and provide constructive feedback with high expectations while expressing confidence in students' abilities to meet those standards. I create situations that allow students to thrive by reducing threats to belonging and identity.",
  personalityTags: [
    "Supportive and validating",
    "Focused on creating belonging",
  ],
  experience:
    "I am Geoffrey L. Cohen",
  goal: "My goal is to help students develop a sense of belonging in their academic journey by offering tailored, targeted, and timely guidance. I want to collect information about students' backgrounds, interests, and concerns, then use this to help them navigate the graduate school application process. I aim to identify and address belonging uncertainties, provide constructive feedback that conveys high expectations coupled with belief in their abilities, and help them understand that challenges in the process are normal and not indicative of their potential for success.",
  questions: [
    {
      question: "你是申请PhD吗？还是Master呀？",
      storage_key: "degree_type",
      storage_type: "string",
      example_response: "赞赞！\\读PhD还是挺香的，哈哈，还可以全奖吃喝玩乐～",
    },
    {
      question: "你是什么时候打算申呢？",
      storage_key: "application_cycle",
      storage_type: "year",
      example_response:
        "Okk！\\今年申请季的话，学校是9月份就开始开放网申系统了哈\\到时你就可以提交申请啦\\大部分PhD项目都是12月中截止\\不过有些学校ddl超级早～比如Stanford、普林、Michigan是12月1号就截啦",
    },
    {
      question:
        "你目前科研细分领域有定下来吗？你自己最感兴趣的area或者research keywords这样子～",
      storage_key: "specific_area",
      storage_type: "text",
      example_response: "噢噢，做X方向很酷呀！\\我们系A就是做这个方向的",
    },
  ],
};

export const useProfessorStore = create<ProfessorState>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  logs: [],
  isSearching: false,
  authors: [],
  selectedAuthor: null,
  authorDetails: null,

  // Basic actions
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  addLog: (logEntry) => set((state) => {
    // Keep logs within limit
    const MAX_LOGS = 100;
    const newLogs = [...state.logs, logEntry];
    if (newLogs.length > MAX_LOGS) {
      return { logs: newLogs.slice(-MAX_LOGS) };
    }
    return { logs: newLogs };
  }),
  clearLogs: () => set({ logs: [] }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setAuthors: (authors) => set({ authors }),
  setSelectedAuthor: (author) => set({ selectedAuthor: author }),
  setAuthorDetails: (details) => set({ authorDetails: details }),

  // Tag management
  addTag: (type, tag) => set((state) => {
    if (type === "personality") {
      if (!state.formData.personalityTags.includes(tag)) {
        return {
          formData: {
            ...state.formData,
            personalityTags: [...state.formData.personalityTags, tag],
          }
        };
      }
    } else {
      // Experience tags are removed
      return {};
    }
    return {};
  }),

  removeTag: (type, tagToRemove) => set((state) => {
    if (type === "personality") {
      return {
        formData: {
          ...state.formData,
          personalityTags: state.formData.personalityTags.filter(
            (tag) => tag !== tagToRemove
          ),
        }
      };
    } else {
      // Experience tags are removed
      return {};
    }
  }),

  // Logger functions
  logger: {
    info: (message) => {
      const logEntry = {
        message,
        timestamp: Date.now(),
        level: "info" as const,
      };
      get().addLog(logEntry);
      console.log(`INFO: ${message}`);
    },
    success: (message) => {
      const logEntry = {
        message: `${COLORS.GREEN}Success: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "success" as const,
        color: "green",
      };
      get().addLog(logEntry);
      console.log(`SUCCESS: ${message}`);
    },
    error: (message) => {
      const logEntry = {
        message: `${COLORS.RED}Error: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "error" as const,
        color: "red",
      };
      get().addLog(logEntry);
      console.error(`ERROR: ${message}`);
    },
    warning: (message) => {
      const logEntry = {
        message: `${COLORS.YELLOW}Warning: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "warning" as const,
        color: "yellow",
      };
      get().addLog(logEntry);
      console.warn(`WARNING: ${message}`);
    },
    debug: (message) => {
      const logEntry = {
        message: `${COLORS.BLUE}Debug: ${message}${COLORS.RESET}`,
        timestamp: Date.now(),
        level: "debug" as const,
        color: "blue",
      };
      get().addLog(logEntry);
      console.debug(`DEBUG: ${message}`);
    },
  },

  // API functions
  searchAuthors: async (name) => {
    if (!name.trim()) return;

    const { logger, setIsSearching, setAuthors, setSelectedAuthor } = get();

    setIsSearching(true);
    setAuthors([]);
    setSelectedAuthor(null);

    try {
      logger.info(`Searching for author: ${name}`);
      const response = await fetch(
        `https://api.openalex.org/authors?search=${encodeURIComponent(
          name
        )}&mailto=lawtedwu@gmail.com`
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAuthors(data.results);
        logger.success(
          `Found ${data.results.length} authors matching "${name}"`
        );
      } else {
        logger.info(`No authors found for "${name}"`);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to search authors: ${error.message}`);
      } else {
        logger.error("Failed to search authors: Unknown error");
      }
    } finally {
      setIsSearching(false);
    }
  },

  fetchAuthorDetails: async (authorId) => {
    const { logger, setAuthorDetails } = get();

    try {
      logger.info(`Fetching details for author ID: ${authorId}`);
      logger.info(`Requesting: https://api.openalex.org/people/${authorId.split('/').pop()}?mailto=lawtedwu@gmail.com`);
      const response = await fetch(
        `https://api.openalex.org/people/${authorId.split('/').pop()}?mailto=lawtedwu@gmail.com`
      );

      if (!response.ok) {
        logger.error(`Network response was not ok for: https://api.openalex.org/people/${authorId.split('/').pop()}?mailto=lawtedwu@gmail.com`);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      logger.success(`Retrieved detailed information for ${data.display_name} from OpenAlex API`);

      // Fetch top papers
      logger.info(`Requesting top papers: https://api.openalex.org/works?filter=author.id:${authorId.split('/').pop()}&sort=cited_by_count:desc&per-page=3`);
      const worksRes = await fetch(`https://api.openalex.org/works?filter=author.id:${authorId.split('/').pop()}&sort=cited_by_count:desc&per-page=3`);
      let topPapers = [];
      if (worksRes.ok) {
        const worksData = await worksRes.json();
        topPapers = (worksData.results || []).slice(0, 3).map((paper: Work) => ({
          id: paper.id,
          title: paper.title,
          cited_by_count: paper.cited_by_count,
          publication_year: paper.publication_year,
          doi: paper.doi,
          url: paper.primary_location?.source?.url || paper.primary_location?.url || '',
        }));
        logger.success(`Fetched top ${topPapers.length} papers for author.`);
      } else {
        logger.error('Failed to fetch top papers.');
      }

      setAuthorDetails({ ...data, topPapers });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to fetch author details: ${error.message}`);
      } else {
        logger.error("Failed to fetch author details: Unknown error");
      }
    }
  },

  handleSubmit: async () => {
    const { logger, formData, selectedAuthor, authorDetails } = get();
    const { createClient } = await import('@/lib/supabase/client');
    const { toast } = await import('sonner');

    logger.info("Submitting professor info to Supabase...");
    try {
      const supabase = createClient();
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        logger.error("You must be logged in to create a bot.");
        return;
      }

      // Merge personality tags into personality text
      const personalityFull =
        formData.personalityTags.length > 0
          ? `${formData.personality}\n\nTags: ${formData.personalityTags.join(
              ", "
            )}`
          : formData.personality;

      // Add research topics if available
      let additionalInfo = "";
      if (authorDetails?.topics && authorDetails.topics.length > 0) {
        additionalInfo += "\n\nResearch Topics:\n";
        authorDetails.topics.slice(0, 10).forEach(topic => {
          additionalInfo += `- ${topic.display_name}\n`;
        });
      }

      // Add metrics if available
      if (authorDetails?.summary_stats) {
        additionalInfo += "\n\nAcademic Metrics:\n";
        additionalInfo += `- h-index: ${authorDetails.summary_stats.h_index}\n`;
        additionalInfo += `- i10-index: ${authorDetails.summary_stats.i10_index}\n`;
      }

      // Prepare simplified detail data for storage (only include institution info)
      const detail = selectedAuthor ? {
        institution: selectedAuthor.last_known_institutions?.[0]?.display_name || "",
        country_code: selectedAuthor.last_known_institutions?.[0]?.country_code || "",
        works_count: selectedAuthor.works_count,
        cited_by_count: selectedAuthor.cited_by_count
      } : null;

      // Extract just the ID part from the OpenAlex URL
      const authorId = selectedAuthor?.id ? selectedAuthor.id.split('/').pop() : null;

      logger.info("Saving professor details to database...");

      const { error } = await supabase.from("profinfo").insert([
        {
          name: formData.name,
          experience: formData.experience + additionalInfo,
          personality: personalityFull,
          goal: formData.goal,
          creator_id: user.id,
          author_id: authorId,
          detail // Simplified data with the new field name
        },
      ]);
      if (error) {
        logger.error("Failed to submit professor info: " + error.message);
      } else {
        logger.success("Professor info submitted to Supabase!");
        toast.success("Bot created successfully!");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        logger.error("Unexpected error: " + e.message);
      } else {
        logger.error("Unexpected error: " + String(e));
      }
    }
  },
}));