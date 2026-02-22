import { create } from 'zustand';

interface UserState {
  xp: number;
  level: string;
  streak: number;
  badges: string[];
  setXp: (xp: number) => void;
  setLevel: (level: string) => void;
  setStreak: (streak: number) => void;
  setBadges: (badges: string[]) => void;
  hydrate: (data: { xp: number; level: string; streak: number; badges: string[] }) => void;
}

export const useUserStore = create<UserState>((set) => ({
  xp: 0,
  level: 'beginner',
  streak: 0,
  badges: [],
  setXp: (xp) => set({ xp }),
  setLevel: (level) => set({ level }),
  setStreak: (streak) => set({ streak }),
  setBadges: (badges) => set({ badges }),
  hydrate: (data) =>
    set({
      xp: data.xp,
      level: data.level,
      streak: data.streak,
      badges: data.badges,
    }),
}));
