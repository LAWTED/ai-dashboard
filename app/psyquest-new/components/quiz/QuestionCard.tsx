"use client";

import { motion } from "framer-motion";
import { Question } from "../../stores/quizStore";
import MultipleChoice from "./MultipleChoice";
import FillInBlank from "./FillInBlank";
import ShortAnswer from "./ShortAnswer";

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const renderQuestionType = () => {
    switch (question.type) {
      case 'multiple-choice':
        return <MultipleChoice question={question} />;
      case 'fill-blank':
        return <FillInBlank question={question} />;
      case 'short-answer':
        return <ShortAnswer question={question} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 问题内容区域 */}
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {/* 问题类型标签 */}
        <div 
          className="font-medium mb-2"
          style={{ 
            fontSize: '19.966px',
            color: '#805433', // Figma 强调色
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {question.type === 'multiple-choice' ? 'Situation Judgment Question' : 
           question.type === 'fill-blank' ? 'Fill in the Blank Question' : 
           'Short Answer Question'}
        </div>

        {/* 问题标题 */}
        <h2 
          className="font-bold italic text-black mb-4"
          style={{ 
            fontSize: '28.522px', 
            lineHeight: '1.25',
            letterSpacing: '-0.2196px', // Figma 字符间距
            fontFamily: 'Inter, sans-serif'
          }}
        >
          {question.title}
        </h2>

        {/* 问题内容 */}
        <p 
          className="text-black mb-6"
          style={{ 
            fontSize: '17.113px',
            lineHeight: '1.36',
            letterSpacing: '-0.1882px', // Figma 字符间距
            textAlign: 'justify' as const,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500
          }}
        >
          {question.content}
        </p>

        {/* 问题类型组件 */}
        <div className="flex-1">
          {renderQuestionType()}
        </div>
      </motion.div>
    </motion.div>
  );
}