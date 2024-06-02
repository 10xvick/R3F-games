import { create } from "zustand";

interface igame {
  pause: boolean;
  setpause: (flag: boolean) => void;
}

export const useGamestore = create<igame>((set) => {
  return {
    pause: false,
    setpause: (flag) => set(() => ({ pause: flag })),
  };
});
