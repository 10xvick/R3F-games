import { Canvas, useFrame } from "@react-three/fiber";
import { Level } from "./level";

export const Doodlejump = () => {
  return (
    <Canvas camera={{ position: [0, 0, 300], fov: 75 }}>
      <ambientLight intensity={Math.PI / 2} />
      <Level />
    </Canvas>
  );
};

const onupdate = () => {
  return useFrame((state, delta) => {});
};
