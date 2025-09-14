"use client";

import { motion } from "framer-motion";
import { useDialogueStore } from "../stores/dialogueStore";

export default function AvatarSection() {
  const dialogues = useDialogueStore((state) => state.dialogues);
  const currentIndex = useDialogueStore((state) => state.currentIndex);

  // Get current speaker (default to 'a' if no dialogue exists)
  const currentSpeaker = dialogues[currentIndex]?.speaker || "a";

  return (
    <motion.div
      className="flex w-full py-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: 0.6,
        ease: [0.215, 0.61, 0.355, 1],
      }}
    >
      {/* Man Avatar - Speaker A */}
      <motion.div
        className="w-1/2 flex items-center justify-center relative"
        layoutId="man-avatar"
      >
        <motion.img
          src="/psyquest-new/man.png"
          alt="Man"
          className="w-full h-auto object-contain"
          layoutId="man-image"
          animate={{
            scale: currentSpeaker === "a" ? 1.05 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Woman Avatar - Speaker B */}
      <motion.div
        className="w-1/2 flex items-center justify-center relative"
        layoutId="woman-avatar"
      >
        <motion.img
          src="/psyquest-new/woman.png"
          alt="Woman"
          className="w-full h-auto object-contain"
          layoutId="woman-image"
          animate={{
            scale: currentSpeaker === "b" ? 1.05 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
