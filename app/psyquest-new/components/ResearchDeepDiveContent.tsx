"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import DialogueSystem from "./DialogueSystem";
import PlaybackControls from "./PlaybackControls";
import AvatarSection from "./AvatarSection";
import { useDialogueStore, DialogueItem } from "../stores/dialogueStore";

interface ResearchDeepDiveContentProps {
  dialogues: DialogueItem[];
  autoPlayInterval?: number;
}

export default function ResearchDeepDiveContent({ 
  dialogues, 
  autoPlayInterval = 3500 
}: ResearchDeepDiveContentProps) {
  const setDialogues = useDialogueStore(state => state.setDialogues);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize dialogue data when component mounts
  useEffect(() => {
    if (dialogues.length > 0) {
      setDialogues(dialogues);
    }
  }, [dialogues, setDialogues]);

  // Control audio playback based on play state
  const { isPlaying } = useDialogueStore();
  
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.log("Audio play failed:", error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    const stopAutoPlay = useDialogueStore.getState().stopAutoPlay;
    return () => {
      stopAutoPlay();
    };
  }, []);

  return (
    <motion.div
      className="px-4 py-8 max-w-md mx-auto h-screen flex flex-col"
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.25,
        delay: 0.1,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* Top Navigation with Progress Bar */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.25,
          delay: 0.15,
          ease: [0.215, 0.61, 0.355, 1],
        }}
      >
        {/* Home Button */}
        <motion.button
          className="w-12 h-12 flex items-center justify-center"
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
            src="/psyquest-new/home-btn.svg"
            alt="Home"
            width={48}
            height={48}
            className="object-contain"
          />
        </motion.button>

        {/* Progress Bar */}
        <ProgressBar className="flex-1 mx-4" />
      </motion.div>

      {/* Dialogue System - fixed height */}
      <DialogueSystem />

      {/* Avatars Section */}
      <AvatarSection />

      {/* Playback Controls */}
      <PlaybackControls />

      {/* Hidden audio element for background narration */}
      <audio
        ref={audioRef}
        src="/psyquest-new/short-clip.wav"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />
    </motion.div>
  );
}