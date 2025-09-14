"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuizResultPage() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const handleNextStep = () => {
    // Navigate to wherever the next step should go
    router.push('/psyquest-new');
  };

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
        style={{
          backgroundColor: '#ecf0f3',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {/* Ending image - occupies top 50vh */}
        <motion.div
          className="w-full h-[50vh] flex items-center justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.4,
            delay: prefersReducedMotion ? 0 : 0.2,
            ease: [0.215, 0.61, 0.355, 1],
          }}
        >
          <img
            src="/psyquest-new/ending.png"
            alt="Laboratory setup with beakers and notebooks"
            className="max-w-sm max-h-full object-contain"
          />
        </motion.div>

        {/* Content section */}
        <div className="px-4 py-8 flex flex-col items-center justify-center" style={{ minHeight: "50vh" }}>
          {/* Congratulation title with decorative font */}
          <motion.h1
            className="text-center mb-6 text-7xl text-black"
            style={{
              color: "#000",
              fontFamily: "Inspiration ",
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              delay: prefersReducedMotion ? 0 : 0.4,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            Congratulation!
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg text-black text-center mb-8 font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              delay: prefersReducedMotion ? 0 : 0.6,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            You&apos;ve finished your reading.
          </motion.p>

          {/* Next Step Button */}
          <motion.button
            onClick={handleNextStep}
            className="flex items-center justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.4,
              delay: prefersReducedMotion ? 0 : 0.8,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.1, ease: "easeOut" },
            }}
          >
            <img
              src="/psyquest-new/next-step.svg"
              alt="Next Step"
              width={180}
              height={64}
              className="object-contain"
            />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}