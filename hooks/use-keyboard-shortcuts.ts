import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onCtrlEnter: () => void;
  onCtrlN?: () => void;
  onCtrlS?: () => void;
  onEscape?: () => void;
  onCtrlZ?: () => void;
  conversationHistoryLength: number;
  isGeneratingSummary: boolean;
}

export function useKeyboardShortcuts({
  onCtrlEnter,
  onCtrlN,
  onCtrlS,
  onEscape,
  onCtrlZ,
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
      } else if (e.key === "n" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+N for new conversation
        e.preventDefault();
        onCtrlN?.();
      } else if (e.key === "s" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+S for save draft
        e.preventDefault();
        onCtrlS?.();
      } else if (e.key === "Escape") {
        // Escape to clear input
        e.preventDefault();
        onEscape?.();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Cmd/Ctrl+Z for undo last input
        e.preventDefault();
        onCtrlZ?.();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [conversationHistoryLength, isGeneratingSummary, onCtrlEnter, onCtrlN, onCtrlS, onEscape, onCtrlZ]);
}