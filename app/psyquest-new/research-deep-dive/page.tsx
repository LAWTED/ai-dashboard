"use client";

import { motion, useReducedMotion } from "framer-motion";
import ResearchDeepDiveContent from "../components/ResearchDeepDiveContent";
import { DialogueItem } from "../stores/dialogueStore";

export default function ResearchDeepDivePage() {
  const prefersReducedMotion = useReducedMotion();

  // Define the blog dialogue data
  const blogDialogues: DialogueItem[] = [
    {
      id: '1',
      speaker: 'a',
      text: "Welcome to the deep dive. We're here to pull out the core insights from some really fascinating research, basically giving you a shortcut so you feel seriously well informed, right? Skip the dense papers, we'll make it clear and hopefully engaging too. ",
      highlight: "Exactly, so"
    },
    {
      id: '2',
      speaker: 'b',
      text: "We want to get into the nitty gritty, like the independent variables, what did the researchers actually change?"
    },
    {
      id: '3',
      speaker: 'a',
      text: "Great question! Let's start with the methodology they used. The researchers conducted a controlled experiment with three distinct conditions to test their hypothesis about cognitive load."
    },
    {
      id: '4',
      speaker: 'b',
      text: "And how does this relate to previous studies in the field? I'm curious about the theoretical foundation they built on."
    },
    {
      id: '5',
      speaker: 'a',
      text: "Excellent point. This study builds directly on the seminal work from the 1990s, but introduces a novel twist that challenges some long-held assumptions in cognitive psychology.",
      highlight: "novel twist"
    }
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
        className="min-h-screen relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {/* Background with grayscale filter */}
        <motion.div
          layoutId="background-room"
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/psyquest-new/background-room.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "grayscale(100%)",
          }}
        />
        {/* Content layer - positioned above background */}
        <div className="relative z-10">
          <ResearchDeepDiveContent
            dialogues={blogDialogues}
            autoPlayInterval={3500}
          />
        </div>
      </motion.div>
    </>
  );
}