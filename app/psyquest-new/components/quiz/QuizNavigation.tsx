"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuizStore } from "../../stores/quizStore";

export default function QuizNavigation() {
  const router = useRouter();
  const {
    canGoPrevious: canGoPreviousFn,
    getNextQuestionId,
    getPreviousQuestionId,
    getCurrentQuestion,
    hasAnswered,
    completeQuiz
  } = useQuizStore();

  const currentQuestion = getCurrentQuestion();
  const nextQuestionId = getNextQuestionId();
  const previousQuestionId = getPreviousQuestionId();
  const canGoPrevious = canGoPreviousFn();
  const hasCurrentAnswer = currentQuestion ? hasAnswered(currentQuestion.id) : false;

  const handleNext = () => {
    if (nextQuestionId) {
      router.push(`/psyquest-new/quiz/${nextQuestionId}`);
    } else {
      // 最后一题，完成测验
      completeQuiz();
      router.push('/psyquest-new/quiz/result');
    }
  };

  const handlePrevious = () => {
    if (previousQuestionId) {
      router.push(`/psyquest-new/quiz/${previousQuestionId}`);
    }
  };

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* Previous Button */}
      <motion.button
        className="w-10 h-10 flex items-center justify-center rounded-full"
        disabled={!canGoPrevious}
        onClick={handlePrevious}
        whileHover={canGoPrevious ? { scale: 1.05 } : {}}
        whileTap={canGoPrevious ? { scale: 0.95 } : {}}
        style={{
          opacity: canGoPrevious ? 1 : 0.3,
          cursor: canGoPrevious ? "pointer" : "not-allowed",
        }}
      >
        <span className="text-lg">‹</span>
      </motion.button>

      {/* Question indicator */}
      <div className="text-sm text-gray-600 px-2">
        {currentQuestion?.id}
      </div>

      {/* Next/Complete Button */}
      <motion.button
        onClick={handleNext}
        disabled={!hasCurrentAnswer}
        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 ${
          hasCurrentAnswer 
            ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={hasCurrentAnswer ? { scale: 1.02 } : {}}
        whileTap={hasCurrentAnswer ? { scale: 0.98 } : {}}
      >
        {nextQuestionId ? 'Next' : 'Complete'}
      </motion.button>
    </motion.div>
  );
}