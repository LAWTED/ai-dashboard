import { create } from 'zustand';

export type QuestionType = 'multiple-choice' | 'fill-blank' | 'short-answer';

export interface AnswerOption {
  id: string;
  label: string; // A, B, C, D
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  illustration: string; // 3D插图路径
  options?: AnswerOption[]; // 多选题选项
  correctAnswer?: string | string[]; // 正确答案
  placeholder?: string; // 填空题或简答题的占位符
}

interface QuizStore {
  // State
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, string | string[]>;
  score: number;
  isCompleted: boolean;
  showResults: boolean;

  // Actions
  setQuestions: (questions: Question[]) => void;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setCurrentQuestionById: (questionId: string) => void;
  calculateScore: () => number;
  completeQuiz: () => void;
  reset: () => void;

  // Getters
  getCurrentQuestion: () => Question | null;
  getTotalQuestions: () => number;
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  hasAnswered: (questionId: string) => boolean;
  getNextQuestionId: () => string | null;
  getPreviousQuestionId: () => string | null;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  score: 0,
  isCompleted: false,
  showResults: false,

  // Actions
  setQuestions: (questions: Question[]) => {
    set({
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      score: 0,
      isCompleted: false,
      showResults: false,
    });
  },

  submitAnswer: (questionId: string, answer: string | string[]) => {
    const { answers } = get();
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    set({ answers: newAnswers });
  },

  goToNextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  goToPreviousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  calculateScore: () => {
    const { questions, answers } = get();
    let score = 0;
    
    questions.forEach((question) => {
      const userAnswer = answers.get(question.id);
      if (userAnswer && question.correctAnswer) {
        if (Array.isArray(question.correctAnswer)) {
          // 多选题比较
          if (Array.isArray(userAnswer) && 
              JSON.stringify(userAnswer.sort()) === JSON.stringify(question.correctAnswer.sort())) {
            score++;
          }
        } else {
          // 单选题比较
          if (userAnswer === question.correctAnswer) {
            score++;
          }
        }
      }
    });

    set({ score });
    return score;
  },

  completeQuiz: () => {
    const score = get().calculateScore();
    set({ 
      isCompleted: true, 
      showResults: true,
      score 
    });
  },

  reset: () => {
    set({
      currentQuestionIndex: 0,
      answers: new Map(),
      score: 0,
      isCompleted: false,
      showResults: false,
    });
  },

  setCurrentQuestionById: (questionId: string) => {
    const { questions } = get();
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      set({ currentQuestionIndex: questionIndex });
    }
  },

  // Getters
  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getTotalQuestions: () => {
    return get().questions.length;
  },

  getProgress: () => {
    const { currentQuestionIndex, questions } = get();
    return questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  },

  canGoNext: () => {
    const { currentQuestionIndex, questions } = get();
    return currentQuestionIndex < questions.length - 1;
  },

  canGoPrevious: () => {
    const { currentQuestionIndex } = get();
    return currentQuestionIndex > 0;
  },

  hasAnswered: (questionId: string) => {
    const { answers } = get();
    return answers.has(questionId);
  },

  getNextQuestionId: () => {
    const { questions, currentQuestionIndex } = get();
    const nextIndex = currentQuestionIndex + 1;
    return nextIndex < questions.length ? questions[nextIndex].id : null;
  },

  getPreviousQuestionId: () => {
    const { questions, currentQuestionIndex } = get();
    const prevIndex = currentQuestionIndex - 1;
    return prevIndex >= 0 ? questions[prevIndex].id : null;
  },
}));