import { Canvas, RootState, useFrame } from "@react-three/fiber";
import { Level } from "./level";
import { useGamestore } from "./stores/game";

export const Doodlejump = () => {
  return (
    <Canvas camera={{ position: [0, 0, 300], fov: 75 }}>
      <ambientLight intensity={Math.PI / 2} />
      <Level />
    </Canvas>
  );
};

export const useUpdate = (cb: (state: RootState, delta: number) => void) => {
  const { pause } = useGamestore();
  return useFrame((state, delta) => {
    if (pause) return;
    cb(state, delta);
  });
};
