"use client";

import { motion } from "framer-motion";
import { useQuizStore } from "../../stores/quizStore";
import MultipleChoice from "./MultipleChoice";
import FillInBlank from "./FillInBlank";
import ShortAnswer from "./ShortAnswer";

export default function QuizContainer() {
  const { getCurrentQuestion } = useQuizStore();
  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading quiz...</div>
      </div>
    );
  }

  // 根据问题类型获取对应的图片
  const getQuestionImage = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return "/psyquest-new/choice.png";
      case "fill-blank":
        return "/psyquest-new/fillblank.png";
      case "short-answer":
        return "/psyquest-new/short-answer.png";
      default:
        return "/psyquest-new/choice.png";
    }
  };

  // 渲染不同类型的问题组件
  const renderQuestionType = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return <MultipleChoice question={currentQuestion} />;
      case "fill-blank":
        return <FillInBlank question={currentQuestion} />;
      case "short-answer":
        return <ShortAnswer question={currentQuestion} />;
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: 0.1,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      style={{
        backgroundColor: "#ecf0f3", // Figma背景色
      }}
    >
      {/* 问题类型图片 - 占据顶部 50vh，宽度占满 */}
      <motion.div
        className="w-full h-[50vh] overflow-hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <img
          src={getQuestionImage(currentQuestion.type)}
          alt={`${currentQuestion.type} question`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* 标题和描述内容区域 - 占据下半部分 */}
      <motion.div
        className="px-8 pb-8 pt-0 flex items-center justify-center"
        style={{ minHeight: "50vh" }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="text-center">
          {/* 问题类型标签 */}
          <p className="text-lg font-medium text-gray-700 mb-3 tracking-tight">
            {currentQuestion.type === "multiple-choice"
              ? "Situation Judgment Question"
              : currentQuestion.type === "fill-blank"
              ? "Fill in the Blank Question"
              : "Short Answer Question"}
          </p>

          {/* 问题标题 */}
          <h2 className="text-2xl font-bold italic text-black mb-4 leading-tight tracking-tight">
            {currentQuestion.title}
          </h2>

          {/* 问题描述 */}
          <p className="text-base text-black mb-6 leading-relaxed tracking-tight">
            {currentQuestion.content}
          </p>

          {/* 问题选项/输入区域 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {renderQuestionType()}
          </motion.div>
        </div>
      </motion.div>

    </motion.div>
  );
}
