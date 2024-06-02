import { RootState, useFrame } from "@react-three/fiber";
import { useGamestore } from "../stores/game";

export const useUpdate = (cb: (state: RootState, delta: number) => void) => {
  const { pause } = useGamestore();
  return useFrame((state, delta) => {
    if (pause) return;
    cb(state, delta);
  });
};
