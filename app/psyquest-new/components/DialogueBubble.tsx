"use client";

import { motion } from "framer-motion";

interface DialogueBubbleProps {
  speaker: "a" | "b";
  text: string;
  highlight?: string;
  isVisible: boolean;
  animationDelay?: number;
}

export default function DialogueBubble({
  speaker,
  text,
  highlight,
  isVisible,
  animationDelay = 0,
}: DialogueBubbleProps) {
  // Split text if highlight is provided
  const renderText = () => {
    if (highlight && text.includes(highlight)) {
      const parts = text.split(highlight);
      return (
        <>
          {parts[0]}
          <span className="text-black/40">{highlight}</span>
          {parts[1]}
        </>
      );
    }
    return text;
  };

  const bubbleStyles = {
    a: {
      containerClass: "self-start mr-[20%]",
      bubbleClass: "bg-white border border-black",
    },
    b: {
      containerClass: "self-end ml-[20%]",
      bubbleClass: "border border-black relative overflow-hidden",
    },
  };

  const style = bubbleStyles[speaker];

  return (
    <motion.div
      className={`max-w-xs ${style.containerClass}`}
      initial={{
        opacity: 0,
        x: speaker === "a" ? -50 : 50,
        scale: 0.9,
      }}
      animate={
        isVisible
          ? {
              opacity: 1,
              x: 0,
              scale: 1,
            }
          : {
              opacity: 0,
              x: speaker === "a" ? -50 : 50,
              scale: 0.9,
            }
      }
      transition={{
        duration: 0.4,
        delay: animationDelay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      <div className={`relative rounded-lg shadow-sm p-2 ${style.bubbleClass}`}>
        {/* Speaker B background with texture */}
        {speaker === "b" && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              backgroundImage:
                "url('/psyquest-new/60be46d7751be104eb395972bf22a38fbac4e258.png')",
              backgroundRepeat: "repeat",
              backgroundSize: "80px 80px",
            }}
          />
        )}

        {/* Speaker B overlay for better text readability */}
        {speaker === "b" && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(245,241,232,0.4) 100%)",
            }}
          />
        )}

        <p
          className="relative z-10 text-black text-[28px] leading-[0.78] font-gurajada"
        >
          {renderText()}
        </p>
      </div>
    </motion.div>
  );
}
