"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, useQuizStore } from "../../stores/quizStore";

interface ShortAnswerProps {
  question: Question;
}

export default function ShortAnswer({ question }: ShortAnswerProps) {
  const router = useRouter();
  const { answers, submitAnswer, getNextQuestionId, completeQuiz } = useQuizStore();
  const [textValue, setTextValue] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // 从 store 中恢复答案
  useEffect(() => {
    const savedAnswer = answers.get(question.id);
    if (savedAnswer && typeof savedAnswer === 'string') {
      setTextValue(savedAnswer);
    }
  }, [answers, question.id]);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    // 实时保存答案
    if (value.trim()) {
      submitAnswer(question.id, value);
    }
  };

  const wordCount = textValue.trim().split(/\s+/).filter(word => word.length > 0).length;
  const maxWords = 50; // 可以根据需要调整

  const handleSubmit = () => {
    if (textValue.trim()) {
      submitAnswer(question.id, textValue.trim());
      
      // 对于简答题，我们认为所有合理的答案都是正确的
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
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {/* 文本输入区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <textarea
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={question.placeholder || "Enter your response here..."}
          className="w-full p-4 border border-black bg-[#ebe2d9] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 rounded-2xl"

          rows={3}
        />

        {/* 字数统计 */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{question.placeholder}</span>
          <span className={wordCount > maxWords ? 'text-red-500' : 'text-gray-600'}>
            {wordCount} / {maxWords} words
          </span>
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
          disabled={!textValue.trim() || showFeedback}
          className={`px-8 py-3 border border-black font-medium transition-colors duration-200 rounded-2xl ${
            textValue.trim() && !showFeedback
              ? 'bg-[#ebe2d9] hover:bg-[#e5dccf] text-black'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}

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
          <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-blue-100 text-blue-800 border border-blue-300">
            <span className="mr-2">✓</span>
            Thank you for your response!
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}