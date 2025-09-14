"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import QuizContainer from "../components/quiz/QuizContainer";
import { useQuizStore, Question } from "../stores/quizStore";

// 示例问题数据 - 后续会从API或配置文件获取
const sampleQuestions: Question[] = [
  {
    id: '1',
    type: 'multiple-choice',
    title: 'Understanding Research Methods',
    content: 'Based on the research dialogue you just experienced, which methodology was primarily discussed?',
    illustration: '/psyquest-new/illustrations/campus.png',
    options: [
      { id: 'a', label: 'A', text: 'Qualitative research approach' },
      { id: 'b', label: 'B', text: 'Quantitative research approach' },
      { id: 'c', label: 'C', text: 'Mixed methods approach' },
      { id: 'd', label: 'D', text: 'Experimental design' },
    ],
    correctAnswer: 'a'
  },
  {
    id: '2',
    type: 'fill-blank',
    title: 'Key Concept Recall',
    content: 'The researchers mentioned that cognitive load affects learning outcomes. On a scale of 1-10, how would you rate the complexity of the study design?',
    illustration: '/psyquest-new/illustrations/library.png',
    placeholder: 'Please give a number',
    correctAnswer: '7'
  },
  {
    id: '3',
    type: 'short-answer',
    title: 'Critical Thinking',
    content: 'Reflect on the research findings discussed in the dialogue. What implications do you think these results have for educational practice?',
    illustration: '/psyquest-new/illustrations/discussion.png',
    placeholder: 'Summarize your understanding in 1–2 sentences',
  }
];

export default function QuizPage() {
  const prefersReducedMotion = useReducedMotion();
  const setQuestions = useQuizStore(state => state.setQuestions);

  useEffect(() => {
    setQuestions(sampleQuestions);
  }, [setQuestions]);

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
        className="min-h-screen relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
        style={{
          backgroundColor: '#ecf0f3', // Figma设计中的背景色
        }}
      >
        <QuizContainer />
      </motion.div>
    </>
  );
}