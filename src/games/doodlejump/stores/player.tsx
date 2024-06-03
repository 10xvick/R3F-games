import { create } from "zustand";
import { game } from "../blueprint/blueprint";

type playerdata = typeof game.player.initial;
interface playerdatai {
  playerdata: playerdata;
  setPlayerdata: (data: playerdata) => void;
  resetPlayerdata: () => void;
}

export const usePlayerStore = create<playerdatai>((set) => {
  return {
    playerdata: {
      position: { x: 0, y: 0 },
      jump: { active: false, jumpsteps: 0 },
    },
    setPlayerdata: (data: playerdata) => set(() => ({ playerdata: data })),
    resetPlayerdata: () =>
      set(() => {
        return {
          playerdata: {
            position: {
              x: 0,
              y: game.level.scale.y
            },
            jump: { active: false, jumpsteps: 0 },
          },
        };
      }),
  };
});
