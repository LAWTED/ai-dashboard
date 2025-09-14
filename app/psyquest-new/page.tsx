"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function LearningGoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const goals = [
    {
      id: "self-understanding",
      label: "Self-understanding",
      image: "/psyquest-new/self-understanding.png",
    },
    {
      id: "improve-relationships",
      label: "Improve relationships",
      image: "/psyquest-new/improve-relationships.png",
    },
    {
      id: "career-preparation",
      label: "Career preparation",
      image: "/psyquest-new/career-preparation.png",
    },
    {
      id: "exam-preparation",
      label: "Exam preparation",
      image: "/psyquest-new/exam-preparation.png",
    },
    {
      id: "other-reasons",
      label: "Other reasons",
      image: "/psyquest-new/other-reasons.png",
    },
  ];

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
        className="min-h-screen bg-[#ecf0f3] relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        <motion.div
          className="px-2 py-10 max-w-[760px] mx-auto"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.25,
            delay: 0.1,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          {/* Title */}
          <motion.div
            className="text-center mb-10"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: 0.15,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            <motion.h1
              className="text-3xl  font-extrabold text-black mb-5 font-urbanist"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: 0.2,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              Learning Goals
            </motion.h1>
            <motion.div
              className="w-full h-[2px] bg-gray-400/70 mb-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.25,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            ></motion.div>
            <motion.h2
              className="text-xl  font-bold text-black leading-tight font-urbanist"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: 0.3,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              What is your main goal in
              <br />
              learning psychology?
            </motion.h2>
          </motion.div>

          {/* Goal Selection Grid */}
          <motion.div className="mb-16">
            {/* Top Row - 2 items */}
            <motion.div
              className="flex justify-center gap-10 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: 0.35,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {goals.slice(0, 2).map((goal, index) => (
                <motion.div
                  key={goal.id}
                  className="flex flex-col items-center"
                  initial={{ y: 15, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.4 + index * 0.05,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <motion.div
                    className="relative cursor-pointer"
                    onClick={() =>
                      setSelectedGoal(selectedGoal === goal.id ? null : goal.id)
                    }
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1, ease: "easeOut" },
                    }}
                  >
                    <motion.div
                      className="size-30 rounded-full overflow-hidden relative"
                      whileHover={{
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                    >
                      <Image
                        src={goal.image}
                        alt={goal.label}
                        fill
                        className="object-cover"
                      />
                    </motion.div>

                    {/* Selection indicator */}
                    <AnimatePresence>
                      {selectedGoal === goal.id && (
                        <motion.div
                          className="absolute -top-2 -left-2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.215, 0.61, 0.355, 1],
                          }}
                        >
                          <Image
                            src="/psyquest-new/check-mark.svg"
                            alt="Selected"
                            width={42}
                            height={40}
                            className="object-contain"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="mt-3 px-2 py-0 bg-gray-200 rounded-full border border-black/80"
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#e5e5e5",
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <span className="text-xs font-extrabold text-black font-urbanist">
                      {goal.label}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Bottom Row - 3 items */}
            <motion.div
              className="flex gap-6 items-center justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.25,
                delay: 0.5,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {goals.slice(2).map((goal, index) => (
                <motion.div
                  key={goal.id}
                  className="flex flex-col items-center"
                  initial={{ y: 15, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.25,
                    delay: 0.55 + index * 0.05,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <motion.div
                    className="relative cursor-pointer"
                    onClick={() =>
                      setSelectedGoal(selectedGoal === goal.id ? null : goal.id)
                    }
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1, ease: "easeOut" },
                    }}
                  >
                    <motion.div
                      className="size-30 rounded-full overflow-hidden relative"
                      whileHover={{
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: { duration: 0.2, ease: "easeOut" },
                      }}
                    >
                      <Image
                        src={goal.image}
                        alt={goal.label}
                        fill
                        className="object-cover"
                      />
                    </motion.div>

                    {/* Selection indicator */}
                    <AnimatePresence>
                      {selectedGoal === goal.id && (
                        <motion.div
                          className="absolute -top-2 -left-2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.215, 0.61, 0.355, 1],
                          }}
                        >
                          <Image
                            src="/psyquest-new/check-mark.svg"
                            alt="Selected"
                            width={42}
                            height={40}
                            className="object-contain"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="mt-3 px-2 py-0 bg-gray-200 rounded-full border border-black/80"
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "#e5e5e5",
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    <span className="text-xs font-extrabold text-black font-urbanist">
                      {goal.label}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Next Button */}
          <motion.div
            className="flex justify-center mb-20"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: 0.8,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            <motion.button
              className={`cursor-pointer ${selectedGoal ? 'opacity-100' : 'opacity-50'}`}
              disabled={!selectedGoal}
              onClick={() => {
                if (selectedGoal) {
                  router.push('/psyquest-new/research-deep-dive');
                }
              }}
              whileHover={
                selectedGoal
                  ? {
                      scale: 1.05,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }
                  : {}
              }
              whileTap={
                selectedGoal
                  ? {
                      scale: 0.95,
                      transition: { duration: 0.1, ease: "easeOut" },
                    }
                  : {}
              }
            >
              <Image
                src="/psyquest-new/next-step.svg"
                alt="Next Step"
                width={200}
                height={100}
                className="object-contain"
              />
            </motion.button>
          </motion.div>

          {/* Decorative Images */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: 0.85,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            <Image
              src="/psyquest-new/decorative-animal.svg"
              alt="Decorative animal"
              width={300}
              height={80}
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
