"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDialogueStore } from "../stores/dialogueStore";

interface PlaybackControlsProps {
  className?: string;
}

export default function PlaybackControls({
  className = "",
}: PlaybackControlsProps) {
  const router = useRouter();
  const currentIndex = useDialogueStore((state) => state.currentIndex);
  const totalDialogues = useDialogueStore((state) => state.getTotalSteps());
  const isPlaying = useDialogueStore((state) => state.isPlaying);

  // Check if we're at the last dialogue
  const isAtEnd = currentIndex === totalDialogues - 1;
  const canGoBack = useDialogueStore((state) => state.canGoBack());
  const canGoForward = useDialogueStore((state) => state.canGoForward());
  const goToPrevious = useDialogueStore((state) => state.goToPrevious);
  const goToNext = useDialogueStore((state) => state.goToNext);
  const togglePlayPause = useDialogueStore((state) => state.togglePlayPause);

  const handleNextStep = () => {
    router.push("/psyquest-new/completion");
  };
  return (
    <motion.div
      className="flex items-center justify-center gap-8 pt-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: 0.8,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* Previous Button */}
      <motion.button
        className="w-12 h-12 flex items-center justify-center"
        disabled={!canGoBack || currentIndex === 0}
        onClick={goToPrevious}
        layout
        transition={{
          layout: { duration: 0.3, ease: "easeOut" },
        }}
        whileHover={
          canGoBack && currentIndex > 0
            ? {
                scale: 1.05,
                transition: { duration: 0.2, ease: "easeOut" },
              }
            : {}
        }
        whileTap={
          canGoBack && currentIndex > 0
            ? {
                scale: 0.95,
                transition: { duration: 0.1, ease: "easeOut" },
              }
            : {}
        }
        style={{
          opacity: canGoBack && currentIndex > 0 ? 1 : 0.5,
          cursor: canGoBack && currentIndex > 0 ? "pointer" : "not-allowed",
        }}
      >
        <Image
          src="/psyquest-new/back.svg"
          alt="Previous"
          width={48}
          height={48}
          className="object-contain"
        />
      </motion.button>

      {/* Play/Pause Button or Next Step Button */}
      <motion.button
        layout
        className={`${
          isAtEnd ? "w-auto h-16" : "w-16 h-16"
        } flex items-center justify-center`}
        onClick={isAtEnd ? handleNextStep : togglePlayPause}
        transition={{
          layout: { duration: 0.3, ease: "easeOut" },
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
        {isAtEnd ? (
          /* Next Step Button */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            key="next-step"
          >
            <Image
              src="/psyquest-new/next-step.svg"
              alt="Next Step"
              width={180}
              height={80}
              className="object-contain"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            key="play-button"
          >
            <Image
              src="/psyquest-new/play.svg"
              alt={isPlaying ? "Pause" : "Play"}
              width={64}
              height={64}
              className={`object-contain transition-transform duration-200 ${
                isPlaying ? "scale-90 opacity-60" : "scale-100 opacity-100"
              }`}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Next Button */}
      <motion.button
        layout
        className="w-12 h-12 flex items-center justify-center"
        disabled={!canGoForward || currentIndex >= totalDialogues - 1}
        onClick={goToNext}
        transition={{
          layout: { duration: 0.3, ease: "easeOut" },
        }}
        whileHover={
          canGoForward && currentIndex < totalDialogues - 1
            ? {
                scale: 1.05,
                transition: { duration: 0.2, ease: "easeOut" },
              }
            : {}
        }
        whileTap={
          canGoForward && currentIndex < totalDialogues - 1
            ? {
                scale: 0.95,
                transition: { duration: 0.1, ease: "easeOut" },
              }
            : {}
        }
        style={{
          opacity: canGoForward && currentIndex < totalDialogues - 1 ? 1 : 0.5,
          cursor:
            canGoForward && currentIndex < totalDialogues - 1
              ? "pointer"
              : "not-allowed",
        }}
      >
        <Image
          src="/psyquest-new/forward.svg"
          alt="Next"
          width={48}
          height={48}
          className="object-contain"
        />
      </motion.button>
    </motion.div>
  );
}
