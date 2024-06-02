import { create } from "zustand";
import { game } from "../blueprint/blueprint";

type playerdata = typeof game.player.initial;
interface playerdatai {
  playerdata: playerdata;
  setPlayerdata: (data: playerdata) => void;
}
export const usePlayerStore = create<playerdatai>((set) => {
  return {
    playerdata: game.player.initial,
    setPlayerdata: (data: playerdata) => set(() => ({ playerdata: data })),
  };
});
