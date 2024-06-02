import { create } from "zustand";
import { utils } from "../../../utils/utils";

interface floor {
  position: { x: number; y: number };
  scale: { x: number; y: number };
}
interface levelstore {
  floors: floor[];
  setfloorPosition: (i: number, x: number, y: number) => void;
  activeFloor: floor;
  setActiveFloor: (i: number) => void;
}

export const useLevelstore = create<levelstore>((set) => {
  const floors = Array(4)
    .fill(0)
    .map((e, i) => ({
      position: { x: utils.number.randomRange(-100, 100), y: i * 100 },
      scale: { x: 100, y: 10, z: 1 },
    }));
  return {
    floors: floors,
    setfloorPosition: (i, x, y) =>
      set((state) => {
        const floor = state.floors[i];
        floor.position = { x: x, y: y };
        return { floors: state.floors };
      }),
    activeFloor: floors[0],
    setActiveFloor: (i) => set((state) => ({ activeFloor: state.floors[i] })),
  };
});
