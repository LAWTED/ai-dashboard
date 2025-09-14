"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, useQuizStore } from "../../stores/quizStore";

interface FillInBlankProps {
  question: Question;
}

export default function FillInBlank({ question }: FillInBlankProps) {
  const router = useRouter();
  const { answers, submitAnswer, getNextQuestionId, completeQuiz } = useQuizStore();
  const [inputValue, setInputValue] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // 从 store 中恢复答案
  useEffect(() => {
    const savedAnswer = answers.get(question.id);
    if (savedAnswer && typeof savedAnswer === 'string') {
      setInputValue(savedAnswer);
    }
  }, [answers, question.id]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // 实时保存答案
    if (value.trim()) {
      submitAnswer(question.id, value);
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      submitAnswer(question.id, inputValue.trim());
      
      // 检查答案是否正确
      const correct = question.correctAnswer?.toLowerCase() === inputValue.trim().toLowerCase();
      setIsCorrect(correct);
      setShowFeedback(true);
      
      // 显示反馈后再跳转
      setTimeout(() => {
        const nextQuestionId = getNextQuestionId();
        if (nextQuestionId) {
          router.push(`/psyquest-new/quiz/${nextQuestionId}`);
        } else {
          // 最后一题，完成测验
          completeQuiz();
          router.push('/psyquest-new/quiz/result');
        }
      }, 2000); // 2秒延迟，让用户看清楚反馈
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {/* 输入框 */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={question.placeholder || "Enter your answer"}
          className="border border-black px-4 py-2 text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: '120px',
            height: '40px',
            borderRadius: '8px',
            fontSize: '17.113px',
          }}
        />
        <div className="text-sm text-gray-500 mt-2">
          {question.placeholder}
        </div>
      </motion.div>

      {/* 提交按钮 */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || showFeedback}
          className={`px-8 py-3 border border-black font-medium transition-colors duration-200 ${
            inputValue.trim() && !showFeedback
              ? 'bg-[#ebe2d9] hover:bg-[#e5dccf] text-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          style={{
            borderRadius: '35.653px', // Figma设计中的大按钮圆角
            minHeight: '49.914px',   // Figma设计中的按钮高度
            minWidth: '200px',
            fontSize: '17.113px',
          }}
        >
          {showFeedback ? 'Submitted' : 'Submit Answer'}
        </button>
      </motion.div>

      {/* 反馈信息 */}
      {showFeedback && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${
            isCorrect 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : "bg-red-100 text-red-800 border border-red-300"
          }`}>
            <span className="mr-2">
              {isCorrect ? "✓" : "✗"}
            </span>
            {isCorrect ? "Correct!" : "Incorrect"}
          </div>
        </motion.div>
      )}

      {!isCorrect && showFeedback && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <p className="text-sm text-gray-600">
            The correct answer is: <strong>{question.correctAnswer}</strong>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}