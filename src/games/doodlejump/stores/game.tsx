import { create } from "zustand";
import { game } from "../blueprint/blueprint";

interface igame {
  pause: boolean;
  setpause: (flag: boolean) => void;
  score: number;
  setscore: (score: number) => void;
  speed: number;
  setspeed: (speed: number) => void;
}

export const useGamestore = create<igame>((set) => {
  return {
    pause: false,
    setpause: (flag) => set(() => ({ pause: flag })),
    score: 0,
    setscore: (score) => set(() => ({ score: score })),
    speed: game.speed,
    setspeed: (speed) => set(() => ({ speed: speed })),
  };
});
