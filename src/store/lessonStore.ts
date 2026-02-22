import { create } from 'zustand';

interface LessonState {
  currentLessonId: string | null;
  mode: 'learn' | 'challenge' | 'playground';
  setCurrentLessonId: (id: string | null) => void;
  setMode: (mode: 'learn' | 'challenge' | 'playground') => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentLessonId: null,
  mode: 'learn',
  setCurrentLessonId: (id) => set({ currentLessonId: id }),
  setMode: (mode) => set({ mode }),
}));
