import { create } from 'zustand';

export interface DialogueItem {
  id: string;
  speaker: 'a' | 'b';
  text: string;
  highlight?: string;
}

interface DialogueStore {
  // State
  dialogues: DialogueItem[];
  currentIndex: number;
  isPlaying: boolean;
  visibleDialogues: Set<number>;
  autoPlayInterval: number;
  autoPlayTimer: NodeJS.Timeout | null;
  isCompleted: boolean;
  showCompletion: boolean;

  // Actions
  setDialogues: (dialogues: DialogueItem[]) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  togglePlayPause: () => void;
  setCurrentIndex: (index: number) => void;
  reset: () => void;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  showCompletionScreen: () => void;

  // Computed getters
  getTotalSteps: () => number;
  getCurrentStep: () => number;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  getProgress: () => number;
}

export const useDialogueStore = create<DialogueStore>((set, get) => ({
  // Initial state
  dialogues: [],
  currentIndex: 0,
  isPlaying: false,
  visibleDialogues: new Set([0]),
  autoPlayInterval: 3500,
  autoPlayTimer: null,
  isCompleted: false,
  showCompletion: false,

  // Actions
  setDialogues: (dialogues: DialogueItem[]) => {
    set({
      dialogues,
      currentIndex: 0,
      visibleDialogues: new Set([0]),
      isPlaying: false,
      isCompleted: false,
      showCompletion: false
    });
    get().stopAutoPlay();
  },

  goToNext: () => {
    const { currentIndex, dialogues, visibleDialogues } = get();
    if (currentIndex < dialogues.length - 1) {
      const newIndex = currentIndex + 1;
      const newVisibleDialogues = new Set([...visibleDialogues, newIndex]);
      set({
        currentIndex: newIndex,
        visibleDialogues: newVisibleDialogues
      });
      
      // Check if we've reached the end
      if (newIndex === dialogues.length - 1) {
        set({ isCompleted: true });
      }
    }
  },

  goToPrevious: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1
      });
    }
  },

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().stopAutoPlay();
    } else {
      get().startAutoPlay();
    }
    set({ isPlaying: !isPlaying });
  },

  setCurrentIndex: (index: number) => {
    const { dialogues, visibleDialogues } = get();
    if (index >= 0 && index < dialogues.length) {
      // Make all dialogues up to this index visible
      const newVisibleDialogues = new Set(visibleDialogues);
      for (let i = 0; i <= index; i++) {
        newVisibleDialogues.add(i);
      }
      set({
        currentIndex: index,
        visibleDialogues: newVisibleDialogues
      });
    }
  },

  reset: () => {
    get().stopAutoPlay();
    set({
      currentIndex: 0,
      isPlaying: false,
      visibleDialogues: new Set([0]),
      isCompleted: false,
      showCompletion: false
    });
  },

  startAutoPlay: () => {
    get().stopAutoPlay(); // Clear any existing timer
    
    const timer = setInterval(() => {
      const { currentIndex, dialogues, goToNext, stopAutoPlay } = get();
      if (currentIndex < dialogues.length - 1) {
        goToNext();
      } else {
        // Reached the end, stop playing and mark as completed
        stopAutoPlay();
        set({ isPlaying: false, isCompleted: true });
      }
    }, get().autoPlayInterval);

    set({ autoPlayTimer: timer });
  },

  stopAutoPlay: () => {
    const { autoPlayTimer } = get();
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      set({ autoPlayTimer: null });
    }
  },

  showCompletionScreen: () => {
    set({ showCompletion: true });
  },

  // Computed getters
  getTotalSteps: () => {
    return get().dialogues.length;
  },

  getCurrentStep: () => {
    return get().currentIndex + 1;
  },

  canGoBack: () => {
    return get().currentIndex > 0;
  },

  canGoForward: () => {
    const { currentIndex, dialogues } = get();
    return currentIndex < dialogues.length - 1;
  },

  getProgress: () => {
    const { currentIndex, dialogues } = get();
    return dialogues.length > 0 ? ((currentIndex + 1) / dialogues.length) * 100 : 0;
  },
}));