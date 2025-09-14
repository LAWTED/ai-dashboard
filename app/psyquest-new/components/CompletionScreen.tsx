"use client";

import { motion } from "framer-motion";

export default function CompletionScreen() {
  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* Background without grayscale filter */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/psyquest-new/background-room.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      
      {/* Content layer */}
      <div className="relative z-10 px-4 py-8 max-w-md mx-auto h-screen flex flex-col justify-center items-center">
        
        {/* Avatar Section with circular frames */}
        <motion.div
          className="flex items-center justify-center space-x-4 mb-8"
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
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white"
            layoutId="man-avatar"
          >
            <motion.img
              src="/psyquest-new/man.png"
              alt="Man"
              className="w-full h-full object-cover"
              layoutId="man-image"
            />
          </motion.div>

          {/* Woman Avatar with circular frame */}
          <motion.div 
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white"
            layoutId="woman-avatar"
          >
            <motion.img
              src="/psyquest-new/woman.png"
              alt="Woman"
              className="w-full h-full object-cover"
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
            <div className="flex items-start space-x-2 max-w-[70%]">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white flex-shrink-0">
                <img
                  src="/psyquest-new/man.png"
                  alt="Man"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-sm text-black">
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
            <div className="flex items-start space-x-2 max-w-[70%] flex-row-reverse">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-white flex-shrink-0">
                <img
                  src="/psyquest-new/woman.png"
                  alt="Woman"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm">
                <p className="text-sm text-black">
                  Good! That means it's working — let's see what stuck!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Next Step Button */}
        <motion.button
          className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-full font-medium shadow-lg transition-colors duration-200"
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
          • Next Step •
        </motion.button>
      </div>
    </motion.div>
  );
}