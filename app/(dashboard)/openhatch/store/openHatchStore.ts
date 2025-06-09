import { create } from "zustand";

type Professor = {
  id: number;
  name: string;
  university: string;
  department: string;
  research: string;
  match: number;
  feedback?: string;
};

type Candidate = {
  id: number;
  name: string;
  score: number;
  match: string;
  background: string;
  email: string;
};

type OpenHatchStore = {
  // User type
  userType: "professor" | "student" | null;
  setUserType: (type: "professor" | "student" | null) => void;

  // Professor data
  professorPreferences: string;
  setProfessorPreferences: (preferences: string) => void;
  emailConnected: boolean;
  setEmailConnected: (connected: boolean) => void;
  candidates: Candidate[];

  // Student data
  resume: string;
  setResume: (resume: string) => void;
  interests: string;
  setInterests: (interests: string) => void;
  professorMatches: Professor[];

  // AI chat
  messages: {
    id: number;
    content: string;
    sender: "user" | "ai";
    timestamp: Date;
  }[];
  addMessage: (content: string, sender: "user" | "ai") => void;
};

export const useOpenHatchStore = create<OpenHatchStore>((set) => ({
  // User type
  userType: null,
  setUserType: (type) => set({ userType: type }),

  // Professor data
  professorPreferences: "",
  setProfessorPreferences: (preferences) => set({ professorPreferences: preferences }),
  emailConnected: false,
  setEmailConnected: (connected) => set({ emailConnected: connected }),
  candidates: [
    { id: 1, name: "张三", score: 92, match: "高匹配", background: "人工智能 / 清华大学", email: "zhangsan@example.com" },
    { id: 2, name: "李四", score: 85, match: "中高匹配", background: "计算机科学 / 北京大学", email: "lisi@example.com" },
    { id: 3, name: "王五", score: 78, match: "中匹配", background: "数据科学 / 浙江大学", email: "wangwu@example.com" },
  ],

  // Student data
  resume: "",
  setResume: (resume) => set({ resume }),
  interests: "",
  setInterests: (interests) => set({ interests }),
  professorMatches: [
    {
      id: 1,
      name: "王教授",
      university: "斯坦福大学",
      department: "计算机科学系",
      research: "人工智能、机器学习",
      match: 92,
      feedback: "您的背景与我的研究方向高度匹配，特别是在机器学习方面的项目经验非常有价值。"
    },
    {
      id: 2,
      name: "李教授",
      university: "麻省理工学院",
      department: "电子工程系",
      research: "计算机视觉、深度学习",
      match: 85,
      feedback: "您在计算机视觉方面的经验很好，但建议加强算法基础知识。"
    },
    {
      id: 3,
      name: "张教授",
      university: "加州大学伯克利分校",
      department: "数据科学系",
      research: "自然语言处理、大语言模型",
      match: 78,
      feedback: "您的编程能力很强，但需要更多NLP相关的研究经验。"
    },
  ],

  // AI chat
  messages: [
    {
      id: 1,
      content: "你好！我是 OpenHatch AI 助手，我可以帮助你找到最适合的教授和项目，并指导你完成申请流程。请告诉我你对哪个研究领域感兴趣？",
      sender: "ai",
      timestamp: new Date(),
    },
  ],
  addMessage: (content, sender) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: state.messages.length + 1,
          content,
          sender,
          timestamp: new Date(),
        },
      ],
    })),
}));