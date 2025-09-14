"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DialogueBubble from "./DialogueBubble";
import { useDialogueStore } from "../stores/dialogueStore";

interface DialogueSystemProps {
  className?: string;
}

export default function DialogueSystem({
  className = ""
}: DialogueSystemProps) {
  const dialogues = useDialogueStore(state => state.dialogues);
  const currentIndex = useDialogueStore(state => state.currentIndex);
  const visibleDialogues = useDialogueStore(state => state.visibleDialogues);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Show only the dialogues up to the current index
  const dialoguesToShow = dialogues.slice(0, Math.max(currentIndex + 1, 1));

  // Auto-scroll to bottom when new dialogues become visible
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleDialogues.size, currentIndex]);

  return (
    <div className={`h-[40vh] ${className}`}>
      {/* Dialogue Content Area */}
      <motion.div
        ref={scrollContainerRef}
        className="flex flex-col justify-start space-y-6 overflow-y-auto overflow-x-hidden h-[40vh] px-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.25,
          delay: 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {dialoguesToShow.map((dialogue, index) => (
          <DialogueBubble
            key={dialogue.id}
            speaker={dialogue.speaker}
            text={dialogue.text}
            highlight={dialogue.highlight}
            isVisible={visibleDialogues.has(index)}
            animationDelay={index * 0.1}
          />
        ))}

        {/* Spacer for better scrolling */}
        <div className="h-8" />
      </motion.div>

    </div>
  );
}