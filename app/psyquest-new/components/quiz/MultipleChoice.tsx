"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question, useQuizStore } from "../../stores/quizStore";

interface MultipleChoiceProps {
  question: Question;
}

export default function MultipleChoice({ question }: MultipleChoiceProps) {
  const router = useRouter();
  const { answers, submitAnswer, getNextQuestionId, completeQuiz } = useQuizStore();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();

  // 从 store 中恢复选择
  useEffect(() => {
    const savedAnswer = answers.get(question.id);
    if (savedAnswer && typeof savedAnswer === "string") {
      setSelectedOption(savedAnswer);
    }
  }, [answers, question.id]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    submitAnswer(question.id, optionId);
    
    // 检查答案是否正确
    const correct = question.correctAnswer === optionId;
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
  };

  return (
    <motion.div
      className="flex flex-col items-center space-y-3" // 舒适的间距，支持深思熟虑
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: prefersReducedMotion ? 0 : 0.3, 
        duration: prefersReducedMotion ? 0.01 : 0.4 
      }}
    >
      {question.options?.map((option, index) => {
        const isSelected = selectedOption === option.id;
        const isCorrectOption = question.correctAnswer === option.id;
        
        // 根据反馈状态决定颜色
        let buttonColor = "bg-[#f4f0eb] hover:bg-[#f0ece7] border-black";
        if (showFeedback && isSelected) {
          buttonColor = isCorrect 
            ? "bg-green-100 border-green-600" 
            : "bg-red-100 border-red-600";
        } else if (showFeedback && isCorrectOption && !isSelected) {
          buttonColor = "bg-green-50 border-green-400";
        } else if (isSelected && !showFeedback) {
          buttonColor = "bg-[#f4f0eb] border-black";
        }
        
        return (
          <motion.button
            key={option.id}
            onClick={() => !showFeedback && handleOptionSelect(option.id)}
            disabled={showFeedback}
            className={`flex items-center w-full max-w-md border-2 rounded-full transition-all duration-200 p-1 ${buttonColor}`}
            whileHover={
              prefersReducedMotion || showFeedback
                ? {}
                : {
                    scale: 1.02, // 轻微缩放，鼓励交互
                    y: -1,
                  }
            }
            whileTap={prefersReducedMotion || showFeedback ? {} : { scale: 0.98 }}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: prefersReducedMotion ? 0 : 0.1 * index, 
              duration: prefersReducedMotion ? 0.01 : 0.3 
            }}
          >
          {/* 字母圆圈 - 视觉和语义双重提示 */}
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-black ${
              selectedOption === option.id ? "bg-[#B8956A]" : "bg-[#B8956A]"
            }`}
          >
            <span
              className="text-white font-bold text-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {option.label}
            </span>
          </div>

          {/* 选项文本 - 支持仔细阅读 */}
          <span
            className="ml-4 text-gray-900 font-medium leading-relaxed flex-1 text-left"
            style={{ fontSize: "1rem", lineHeight: "1.6" }}
          >
            {option.text}
          </span>
          </motion.button>
        );
      })}

      {/* 反馈信息 */}
      {showFeedback && (
        <motion.div
          className="mt-6 text-center"
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
          {!isCorrect && (
            <p className="mt-3 text-sm text-gray-600">
              The correct answer is: {question.options?.find(opt => opt.id === question.correctAnswer)?.text}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
