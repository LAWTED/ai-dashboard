"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CompletionPage() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  const handleNextStep = () => {
    router.push('/psyquest-new/quiz/q1'); // 跳转到第一个问题
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {/* Background in top 50vh - NO grayscale filter for completion */}
        <motion.div
          layoutId="background-room"
          className="absolute top-0 left-0 right-0 h-[50vh]"
          style={{
            backgroundImage: "url('/psyquest-new/background-room.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Content layer */}
        <div className="relative z-10 px-4 py-8 max-w-md mx-auto h-screen flex flex-col items-center pt-[48vh]">
          {/* Avatar Section with circular frames */}
          <motion.div
            className="flex items-center justify-center  mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            {/* Man Avatar with circular frame */}
            <motion.div
              className="w-24 h-24 rounded-full border border-black shadow-lg overflow-hidden bg-white z-20"
              layoutId="man-avatar"
            >
              <motion.img
                src="/psyquest-new/man.png"
                alt="Man"
                className="w-full h-full object-cover"
                animate={{

                  objectPosition: 'center top',
                }}
                layoutId="man-image"
              />
            </motion.div>

            {/* Woman Avatar with circular frame */}
            <motion.div
              className="w-24 h-24 rounded-full border border-black shadow-lg overflow-hidden bg-white -ml-4 z-0"
              layoutId="woman-avatar"
            >
              <motion.img
                src="/psyquest-new/woman.png"
                alt="Woman"
                className="w-full h-full object-cover"
                animate={{
                  objectPosition: 'center top',
                }}
                layoutId="woman-image"
              />
            </motion.div>
          </motion.div>

          {/* Completion Title */}
          <motion.h1
            className="text-2xl font-bold text-black text-center mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.4,
              ease: [0.215, 0.61, 0.355, 1],
            }}
          >
            You've finished your reading.
          </motion.h1>

          {/* Dialogue Bubbles */}
          <div className="w-full space-y-4 mb-8">
            {/* Left bubble - Man */}
            <motion.div
              className="flex justify-start"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.6,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {/* Unified capsule containing both avatar and text */}
              <div className="flex items-center bg-[#f4f0eb] border border-black rounded-full p-1 shadow-sm max-w-[80vw]">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0 border border-black">
                  <img
                    src="/psyquest-new/man.png"
                    alt="Man"
                    className="w-full h-full object-cover"

                    style={{
                      objectPosition: "center top",
                      transform: "scale(2.5) translateY(30%) translateX(-5%)",
                    }}
                  />
                </div>
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold italic text-black leading-tight">
                    I finished reading... and my brain is full!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right bubble - Woman */}
            <motion.div
              className="flex justify-end"
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.8,
                ease: [0.215, 0.61, 0.355, 1],
              }}
            >
              {/* Unified capsule containing both avatar and text - reversed layout */}
              <div className="flex items-center bg-[#f4f0eb] border border-black rounded-full p-1 shadow-sm max-w-[80vw] flex-row-reverse">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex-shrink-0 border border-black">
                  <img
                    src="/psyquest-new/woman.png"
                    alt="Woman"
                    className="w-full h-full object-cover "
                    style={{
                      objectPosition: "center top",
                      transform: "scale(2.5) translateY(28%) translateX(5%)",
                    }}
                  />
                </div>
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold italic text-black leading-tight">
                    Good! That means it's working — let's see what stuck!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Next Step Button */}
          <motion.button
            onClick={handleNextStep}
            className="flex items-center justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.4,
              delay: 1.0,
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
