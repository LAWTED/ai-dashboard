import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onCtrlEnter: () => void;
  conversationHistoryLength: number;
  isGeneratingSummary: boolean;
}

export function useKeyboardShortcuts({
  onCtrlEnter,
  conversationHistoryLength,
  isGeneratingSummary,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+Enter triggers Done functionality globally
        e.preventDefault();
        if (conversationHistoryLength > 0 && !isGeneratingSummary) {
          onCtrlEnter();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [conversationHistoryLength, isGeneratingSummary, onCtrlEnter]);
}