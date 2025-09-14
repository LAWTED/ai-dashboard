"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

// Image assets from Figma
const backgroundImg = "http://localhost:3845/assets/375b572142cc1ee0abb70cb38461208b55670968.png";
const professorImg = "http://localhost:3845/assets/fe864396abd1848fa3ed3d3fa8d5accb92568d5c.png";
const assistantImg = "http://localhost:3845/assets/f384a1d3cd14932911dd3d6d088eecf4464659ca.png";

// UI Icons
const homeIcon = "http://localhost:3845/assets/e031dc59d3bf02940b7d241534ff1fafd9176fa7.svg";
const playIcon = "http://localhost:3845/assets/9fe2a870d034fc7321a7ab846923fab733ba680f.svg";
const arrowIcon = "http://localhost:3845/assets/8b8e4b86847c5e9137bbc31f21e203f44945796c.svg";

// Speech bubble assets
const speechBubbleMain = "http://localhost:3845/assets/2169f003dc441c7187ab628539e8bc771c4427df.svg";
const speechBubbleSecondary = "http://localhost:3845/assets/a1c435bba7bbe26170419d02ee0b23a396b180c3.svg";

interface DialogueStep {
  id: number;
  speaker: "professor" | "assistant";
  text: string;
  highlight?: string;
}

// Learning scenarios data
const scenarios: Record<string, DialogueStep[]> = {
  "1": [
    {
      id: 1,
      speaker: "professor",
      text: "Welcome to the deep dive. We're here to pull out the core insights from some really fascinating research, basically giving you a shortcut so you feel seriously well informed, right?",
      highlight: "Skip the dense papers, we'll make it clear and hopefully engaging too. Exactly, so"
    },
    {
      id: 2,
      speaker: "assistant",
      text: "We want to get into the nitty gritty, like the independent variables, what did the researchers actually change?"
    }
  ],
  "2": [
    {
      id: 1,
      speaker: "professor",
      text: "Now let's examine the methodology. Understanding how researchers design their studies is crucial for interpreting results."
    },
    {
      id: 2,
      speaker: "assistant",
      text: "What about the control groups? How do we know the changes weren't due to other factors?"
    }
  ]
};

export default function LearningScenePage() {
  const router = useRouter();
  const params = useParams();
  const sceneId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentScenario = scenarios[sceneId] || scenarios["1"];
  const totalSteps = currentScenario.length;
  const currentDialogue = currentScenario[currentStep];

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < totalSteps - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 4000); // 4 seconds per dialogue
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, totalSteps]);

  const handlePlay = () => {
    if (currentStep === totalSteps - 1) {
      // If at the end, go to next scene or return
      router.push('/psyquest/city-map');
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/psyquest/city-map');
    }
  };

  const handleHome = () => {
    router.push('/psyquest');
  };

  return (
    <div className="min-h-screen bg-[#ecf0f3] relative overflow-hidden">
      {/* Main Container */}
      <div className="relative w-full max-w-md mx-auto min-h-screen flex flex-col sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl">

        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 z-10">
          {/* Home Button */}
          <motion.button
            onClick={handleHome}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img src={homeIcon} alt="Home" className="w-6 h-6 sm:w-7 sm:h-7" />
          </motion.button>

          {/* Progress Bar */}
          <div className="flex-1 mx-4 sm:mx-6">
            <div className="bg-white rounded-full h-8 sm:h-10 border-2 border-black shadow-lg relative overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4A574] to-[#B8926A] rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / totalSteps) * 100}%`
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
            </div>
          </div>

          {/* Info Badge */}
          <div className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium border border-gray-300">
            Scene {sceneId}
          </div>
        </div>

        {/* Main Scene Area - Full screen immersive background */}
        <div className="absolute inset-0 pt-20 pb-32">
          {/* Large 3D Background Scene */}
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${backgroundImg}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center'
            }}
          >
            {/* Characters positioned within the 3D scene */}
            <div className="absolute inset-0">
              {/* Professor - positioned on the left side of the office floor */}
              <motion.div
                className="absolute w-80 h-96 sm:w-96 sm:h-112 md:w-112 md:h-128 lg:w-128 lg:h-144 xl:w-144 xl:h-160"
                style={{
                  left: '-10%', // Positioned even further left in the office space
                  bottom: '15%', // Lower on the floor
                  transform: 'translateX(-50%)'
                }}
                initial={{
                  scale: 1,
                  filter: "brightness(0.9)"
                }}
                animate={{
                  scale: currentDialogue?.speaker === "professor" ? 1.1 : 1,
                  filter: currentDialogue?.speaker === "professor" ? "brightness(1.1)" : "brightness(0.9)"
                }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={professorImg}
                  alt="Professor"
                  className="w-full h-full object-contain transform rotate-180 scale-y-[-1]"
                />

                {/* Speech bubble above professor when speaking */}
                {currentDialogue?.speaker === "professor" && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 sm:w-80 md:w-96">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-gray-100"
                      >
                        {/* Speech bubble tail */}
                        <div className="absolute top-full left-8 w-3 h-3 bg-white border-r-2 border-b-2 border-gray-100 transform rotate-45 -translate-y-1"></div>

                        <div className="space-y-3">
                          {/* Speaker indicator */}
                          <div className="flex justify-start">
                            <div className="px-3 py-1 bg-blue-50 rounded-full">
                              <span className="text-xs font-semibold text-blue-600">Professor</span>
                            </div>
                          </div>

                          {/* Dialogue text */}
                          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800 font-['Gurajada']">
                            {currentDialogue?.text}
                          </p>

                          {currentDialogue?.highlight && (
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-[#B8926A] font-['Gurajada'] font-semibold italic">
                              {currentDialogue.highlight}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>

              {/* Research Assistant - positioned on the right side */}
              <motion.div
                className="absolute w-72 h-88 sm:w-80 sm:h-96 md:w-96 md:h-112 lg:w-112 lg:h-128 xl:w-128 xl:h-144"
                style={{
                  right: '-10%', // Positioned even further right in the office space
                  bottom: '15%', // Lower on the floor
                  transform: 'translateX(50%)'
                }}
                initial={{
                  scale: 1,
                  filter: "brightness(0.9)"
                }}
                animate={{
                  scale: currentDialogue?.speaker === "assistant" ? 1.1 : 1,
                  filter: currentDialogue?.speaker === "assistant" ? "brightness(1.1)" : "brightness(0.9)"
                }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={assistantImg}
                  alt="Research Assistant"
                  className="w-full h-full object-contain"
                />

                {/* Speech bubble above assistant when speaking */}
                {currentDialogue?.speaker === "assistant" && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 sm:w-80 md:w-96">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-gray-100"
                      >
                        {/* Speech bubble tail */}
                        <div className="absolute top-full right-8 w-3 h-3 bg-white border-r-2 border-b-2 border-gray-100 transform rotate-45 -translate-y-1"></div>

                        <div className="space-y-3">
                          {/* Speaker indicator */}
                          <div className="flex justify-start">
                            <div className="px-3 py-1 bg-purple-50 rounded-full">
                              <span className="text-xs font-semibold text-purple-600">Research Assistant</span>
                            </div>
                          </div>

                          {/* Dialogue text */}
                          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800 font-['Gurajada']">
                            {currentDialogue?.text}
                          </p>

                          {currentDialogue?.highlight && (
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-[#B8926A] font-['Gurajada'] font-semibold italic">
                              {currentDialogue.highlight}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-[#ecf0f3] via-[#ecf0f3] to-transparent">
          <div className="flex justify-center items-center space-x-6 sm:space-x-8">
            {/* Previous Button */}
            <motion.button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 shadow-lg ${
                currentStep === 0
                  ? 'bg-gray-200 border-gray-300 opacity-50 cursor-not-allowed'
                  : 'bg-white border-[#8F7F5C] hover:bg-[#8F7F5C] hover:text-white'
              }`}
              whileHover={{ scale: currentStep > 0 ? 1.1 : 1 }}
              whileTap={{ scale: currentStep > 0 ? 0.9 : 1 }}
            >
              <img
                src={arrowIcon}
                alt="Previous"
                className="w-6 h-6 transform rotate-180"
              />
            </motion.button>

            {/* Main Play/Pause Button */}
            <motion.button
              onClick={handlePlay}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#D4A574] to-[#B8926A] rounded-full flex items-center justify-center shadow-xl border-2 border-white relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentStep === totalSteps - 1 ? (
                <img src={arrowIcon} alt="Continue" className="w-8 h-8 sm:w-10 sm:h-10" />
              ) : isPlaying ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 flex space-x-1">
                  <div className="w-2 bg-white rounded"></div>
                  <div className="w-2 bg-white rounded"></div>
                </div>
              ) : (
                <img
                  src={playIcon}
                  alt="Play"
                  className="w-8 h-8 sm:w-10 sm:h-10 transform rotate-90 ml-1"
                />
              )}

              {/* Progress indicator */}
              {isPlaying && currentStep < totalSteps - 1 && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                >
                  <div className="absolute top-0 left-1/2 w-1 h-2 bg-white rounded transform -translate-x-1/2"></div>
                </motion.div>
              )}
            </motion.button>

            {/* Next Button */}
            <motion.button
              onClick={handleNext}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-[#8F7F5C] rounded-full flex items-center justify-center shadow-lg hover:bg-[#8F7F5C] hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img src={arrowIcon} alt="Next" className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}