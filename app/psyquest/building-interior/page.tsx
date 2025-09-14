"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

// Image assets from Figma
const buildingBackground =
  "http://localhost:3845/assets/6f7ca7f78ef3433c8aacdba558315c7c28ff3b66.png";

// Step circle assets (from Figma)
const stepBgOuter =
  "http://localhost:3845/assets/e6d61f1942080e11a8db79263298fb93a204beb7.svg";
const stepBgInner =
  "http://localhost:3845/assets/39570dd8634962eead54fcead1f5f47540b6817c.svg";
const stepBgGreen =
  "http://localhost:3845/assets/cad4c4cd3e0eb61ad43cbd93d5006b61bf550622.svg";
const stepBgBlue =
  "http://localhost:3845/assets/31179347cb1cd46bd06958a3f1402646646be35a.svg";
const arrowBlue =
  "http://localhost:3845/assets/5c226cf9d2150cc393349254234ac81f54f74b9e.svg";

// Modal assets (from Figma)
const imgEllipse1338 =
  "http://localhost:3845/assets/cf819a0990a67c2581f868e9908ecfffd61883b6.png";
const imgEllipse1339 =
  "http://localhost:3845/assets/86b99a24d09ad2f01ad1068db8680fc071367a29.png";
const imgEllipse1348 =
  "http://localhost:3845/assets/b68284ea63736318c9a016febb47a590d1633f3d.svg";

interface LearningStep {
  id: string;
  number: number;
  x: number; // percentage from left
  y: number; // percentage from top
  isActive?: boolean;
}

interface StepContent {
  id: string;
  title: string;
  duration: string;
  questions: string;
  xp: string;
}

export default function BuildingInteriorPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<string>("");
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showModal) return;

      const target = event.target as HTMLElement;
      
      // Don't close if clicking on step markers
      if (target.closest('[data-step-marker="true"]')) {
        return;
      }
      
      // Don't close if clicking inside the modal
      if (modalRef.current && modalRef.current.contains(target)) {
        return;
      }
      
      // Close the modal
      handleModalClose(false);
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Exact positions from Figma design (converted to percentages)
  // Background image: left: -15.69px, top: 231.03px, size: 566.165px x 566.165px
  // Converting absolute positions to percentages relative to background image
  const learningSteps: LearningStep[] = [
    {
      id: "step-1",
      number: 1,
      x: 60.6, // 往左移动3个百分点
      y: 54.5, // 往上移动3个百分点
      isActive: true,
    },
    {
      id: "step-2",
      number: 2,
      x: 54.7, // 59.3 - 4.6 = 54.7
      y: 35.1, // 42.6 - 7.5 = 35.1
      isActive: false,
    },
    {
      id: "step-3",
      number: 3,
      x: 32.8, // 37.4 - 4.6 = 32.8
      y: 49.9, // 57.4 - 7.5 = 49.9
      isActive: false,
    },
    {
      id: "step-4",
      number: 4,
      x: 52.7, // 61.3 - 4.6 = 56.7
      y: 20.6, // 12.1 - 7.5 = 4.6
      isActive: false,
    },
    {
      id: "step-5",
      number: 5,
      x: 20.9, // 25.5 - 4.6 = 20.9
      y: 28.7, // 23.2 - 7.5 = 15.7
      isActive: false,
    },
  ];

  // Step content data
  const stepContents: StepContent[] = [
    {
      id: "step-1",
      title: "01. The Weakness of Individual Differences",
      duration: "15min",
      questions: "7Questions",
      xp: "10xp",
    },
    {
      id: "step-2",
      title: "02. Social Psychology Methods",
      duration: "20min",
      questions: "8Questions",
      xp: "15xp",
    },
    {
      id: "step-3",
      title: "03. Research Design Principles",
      duration: "18min",
      questions: "6Questions",
      xp: "12xp",
    },
    {
      id: "step-4",
      title: "04. Statistical Analysis",
      duration: "25min",
      questions: "10Questions",
      xp: "20xp",
    },
    {
      id: "step-5",
      title: "05. Interpretation Methods",
      duration: "22min",
      questions: "9Questions",
      xp: "18xp",
    },
  ];

  const handleStepClick = (stepId: string) => {
    // Always allow switching to different steps
    setModalStep(stepId);
    setShowModal(true);

    // Use the library's zoomToElement function for proper centering
    if (transformComponentRef.current) {
      const { zoomToElement } = transformComponentRef.current;
      zoomToElement(stepId, 2.5, 800, "easeInOutQuad");
    }
  };

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    // Reset zoom when modal closes
    if (!open && transformComponentRef.current) {
      const { resetTransform } = transformComponentRef.current;
      resetTransform(800, "easeInOutQuad");
    }
  };

  const getCurrentStepContent = () => {
    return stepContents.find((content) => content.id === modalStep);
  };

  return (
    <div className="min-h-screen bg-[#ecf0f3] relative overflow-hidden">
      {/* Background color layer */}
      <div className="absolute inset-0 bg-[#f3f3f3]" />

      {/* Main container */}
      <div className="relative w-full h-screen flex flex-col">
        {/* Zoomable Building Image with Step Markers */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative w-full h-full flex-1 overflow-hidden"
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            smooth={true}
            wheel={{ step: 0.1 }}
            pinch={{ step: 0.1 }}
            doubleClick={{ disabled: false, step: 0.7 }}
            centerOnInit={true}
            ref={transformComponentRef}
          >
            {() => (
              <>
                <TransformComponent>
                  <div className="relative w-full h-full">
                    {/* Building Background Image */}
                    <img
                      src={buildingBackground}
                      alt="Learning Building Interior"
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                      style={{ width: "100vw", height: "80vh" }}
                    />

                    {/* Learning Step Markers */}
                    {learningSteps.map((step) => {
                      return (
                        <motion.div
                          key={step.id}
                          id={step.id}
                          data-step-marker="true"
                          className="absolute cursor-pointer z-30"
                          style={{
                            left: `${step.x}%`,
                            top: `${step.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                          onClick={() => handleStepClick(step.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + (step.number - 1) * 0.1 }}
                        >
                          {/* Step Circle - Exact Figma Design with Multiple Layers */}
                          <div className="relative w-[53px] h-[53px]">
                            {/* Outer background circle */}
                            <div className="absolute inset-0">
                              <img
                                src={stepBgOuter}
                                alt=""
                                className="w-full h-full"
                              />
                            </div>

                            {/* Middle colored circle - different colors for different steps */}
                            <div className="absolute inset-[4px]">
                              <img
                                src={
                                  step.number === 2 || step.number === 3
                                    ? stepBgBlue
                                    : stepBgGreen
                                }
                                alt=""
                                className="w-full h-full"
                              />
                            </div>

                            {/* Inner white circle */}
                            <div className="absolute inset-[8px]">
                              <img
                                src={stepBgInner}
                                alt=""
                                className="w-full h-full"
                              />
                            </div>

                            {/* Step number */}
                            <div
                              className="absolute inset-0 flex flex-col justify-center leading-[0] text-[#565656] text-[71.305px] text-center"
                              style={{ fontFamily: "Gurajada, sans-serif" }}
                            >
                              <p className="leading-[0.78]">{step.number}</p>
                            </div>

                            {/* Arrow indicator below circle */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                              <div className="w-5 h-5 rotate-180">
                                <img
                                  src={arrowBlue}
                                  alt=""
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </motion.div>

        {/* Bottom fixed area with title and icon - hide when modal is open */}
        {!showModal && (
          <div className="flex-shrink-0 py-8 flex flex-col items-center">
            {/* Title - exact Figma styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-center mb-8"
            >
              <h1
                className="leading-[0] italic text-[28.641px] text-black max-w-[462px] mx-auto px-6"
                style={{ fontFamily: "Gurajada, sans-serif" }}
              >
                <p className="leading-[0.78]">
                  Introduction to Social Psychology, Methodological Quandaries
                </p>
              </h1>
            </motion.div>

            {/* Zoom Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
            >
              <motion.div
                className="w-[98px] h-[98px] cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
              >
                <img
                  src="/Zoom.svg"
                  alt="Reset zoom"
                  className="w-full h-full"
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom Modal using Radix UI Dialog with custom animations */}
      <Dialog.Root
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            handleModalClose(false);
          }
        }}
      >
        <Dialog.Portal>
          <AnimatePresence>
            <Dialog.Content asChild>
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-center p-4 pointer-events-none"
              >
                {/* Modal content - responsive design with exact same styling */}
                <div 
                  ref={modalRef}
                  className="relative w-full max-w-md pointer-events-auto"
                >
                  <div className="bg-[#ebe2d9] rounded-[3.75rem] border-2 border-black px-8 pt-16 pb-8 relative">
                    {/* Overlapping Avatars */}
                    <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      {/* Grandma Avatar */}
                      <div className="relative w-20 h-20 -mr-4 z-10 transform rotate-180 scale-y-[-1]">
                        <img
                          alt="Grandma"
                          className="w-full h-full object-cover rounded-full"
                          src={imgEllipse1339}
                        />
                      </div>
                      {/* Professor Avatar */}
                      <div className="relative w-20 h-20">
                        <img
                          alt="Professor"
                          className="w-full h-full object-cover rounded-full"
                          src={imgEllipse1338}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-6">
                      {/* Title */}
                      <h2
                        className="font-['Urbanist'] font-extrabold text-black leading-normal"
                        style={{
                          fontSize: "clamp(24px, 6vw, 34.227px)",
                          letterSpacing: "-0.1369px",
                        }}
                      >
                        {getCurrentStepContent()?.title.includes(
                          "Individual"
                        ) ? (
                          <>
                            <span>01. The Weakness of </span>
                            <br />
                            <span className="text-[#826339]">
                              Individual Differences
                            </span>
                          </>
                        ) : (
                          <span>{getCurrentStepContent()?.title}</span>
                        )}
                      </h2>

                      {/* Course info */}
                      <p
                        className="font-['Urbanist'] font-extrabold text-[grey] leading-normal"
                        style={{
                          fontSize: "clamp(18px, 4.5vw, 25.67px)",
                          letterSpacing: "-0.1027px",
                        }}
                      >
                        {getCurrentStepContent()?.duration}丨
                        {getCurrentStepContent()?.questions}丨
                        {getCurrentStepContent()?.xp}
                      </p>

                      {/* Get Start Button */}
                      <div className="pt-4 relative">
                        <Dialog.Close asChild>
                          <button 
                            onClick={() => {
                              // Close modal first, then navigate to the specific learning scene
                              const stepNumber = modalStep.split('-')[1]; // Extract number from "step-1"
                              setTimeout(() => router.push(`/psyquest/learning-scene/${stepNumber}`), 100);
                            }}
                            className="relative group transition-transform duration-200 hover:scale-105 active:scale-95"
                          >
                            {/* Outer button layer */}
                            <div
                              className="bg-[#b1916d] rounded-[34.94px] relative border-[#6d481d] border-solid"
                              style={{
                                height: "clamp(50px, 12vw, 59.897px)",
                                width: "clamp(180px, 45vw, 211.064px)",
                                borderWidth: "clamp(2px, 0.5vw, 2.424px)",
                              }}
                            />

                            {/* Inner button layer */}
                            <div
                              className="absolute bg-[#b1916d] rounded-[34.94px] border-[#6d481d] border-solid"
                              style={{
                                height: "clamp(42px, 10vw, 48.488px)",
                                width: "clamp(170px, 42vw, 199.655px)",
                                left: "clamp(5px, 1.2vw, 5.71px)",
                                top: "clamp(4px, 1vw, 5.71px)",
                                borderWidth: "clamp(1px, 0.3vw, 1.426px)",
                              }}
                            />

                            {/* Button text layer */}
                            <div
                              className="absolute inset-0 flex items-center justify-center font-['Urbanist'] font-extrabold text-white z-10"
                              style={{
                                fontSize: "clamp(20px, 5vw, 37.079px)",
                                letterSpacing: "-0.1483px",
                              }}
                            >
                              Get Start
                            </div>

                            {/* Decorative dots */}
                            <div
                              className="absolute top-1/2 -translate-y-1/2 z-10"
                              style={{
                                left: "clamp(12px, 3vw, 18px)",
                                width: "clamp(4px, 1vw, 5.704px)",
                                height: "clamp(4px, 1vw, 5.704px)",
                              }}
                            >
                              <img
                                alt=""
                                className="w-full h-full object-contain"
                                src={imgEllipse1348}
                              />
                            </div>

                            <div
                              className="absolute top-1/2 -translate-y-1/2 z-10"
                              style={{
                                right: "clamp(12px, 3vw, 18px)",
                                width: "clamp(4px, 1vw, 5.704px)",
                                height: "clamp(4px, 1vw, 5.704px)",
                              }}
                            >
                              <img
                                alt=""
                                className="w-full h-full object-contain"
                                src={imgEllipse1348}
                              />
                            </div>
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
