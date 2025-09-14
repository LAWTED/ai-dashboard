"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useParams, notFound } from "next/navigation";
import { useEffect } from "react";
import QuizContainer from "../../components/quiz/QuizContainer";
import { useQuizStore, Question } from "../../stores/quizStore";

// 示例问题数据 - 每个问题都有唯一的ID
const sampleQuestions: Question[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    title: 'Can We Predict Someone\'s Behavior?',
    content: 'John is walking briskly across campus, heading to an important meeting. On the way, he sees a man collapsed at a doorway, visibly in pain, asking for help.\n\nWill John stop to help, or will he keep going?',
    illustration: '/psyquest-new/illustrations/campus.png',
    options: [
      { id: 'a', label: 'A', text: 'John is a kind person.' },
      { id: 'b', label: 'B', text: 'John is part of a helping group.' },
      { id: 'c', label: 'C', text: 'None.' },
      { id: 'd', label: 'D', text: 'John has helped in the past.' },
    ],
    correctAnswer: 'c'
  },
  {
    id: 'q2',
    type: 'fill-blank',
    title: 'Predicting a person\'s behavior',
    content: 'According to psychological research, when predicting a person\'s behavior in a novel situation, the maximum statistical correlation between individual differences (such as personality traits) and actual behavior is approximately ____.\n\nThis value is referred to as the "predictability ceiling."',
    illustration: '/psyquest-new/fillblank.png',
    placeholder: 'Enter correlation value (e.g., 0.3)',
    correctAnswer: '0.3'
  },
  {
    id: 'q3',
    type: 'short-answer',
    title: 'Core Idea of Situationism',
    content: 'In social psychology, researchers often manipulate specific situational variables to observe their effects on behavior. These studies are known as "experiential parables." Briefly explain why they are important.',
    illustration: '/psyquest-new/short-answer.png',
    placeholder: 'Explain the importance in 1-2 sentences',
  }
];

export default function QuizQuestionPage() {
  const prefersReducedMotion = useReducedMotion();
  const params = useParams();
  const { setQuestions, setCurrentQuestionById, getCurrentQuestion } = useQuizStore();
  
  const questionId = params.questionId as string;

  useEffect(() => {
    // 初始化问题数据
    setQuestions(sampleQuestions);
    
    // 根据路由参数设置当前问题
    const questionExists = sampleQuestions.some(q => q.id === questionId);
    if (!questionExists) {
      notFound();
      return;
    }
    
    setCurrentQuestionById(questionId);
  }, [questionId, setQuestions, setCurrentQuestionById]);

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading question...</div>
      </div>
    );
  }

  return (
    <>
      {/* Accessibility: Disable transforms for users who prefer reduced motion */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <motion.div
        className="min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        style={{
          backgroundColor: '#ecf0f3', // Figma背景色
        }}
      >
        <QuizContainer />
      </motion.div>
    </>
  );
}