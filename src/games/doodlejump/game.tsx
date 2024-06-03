import React from "react";
import { Canvas } from "@react-three/fiber";
import { Level } from "./level";
import Box from "./prefabs/box";
import { CameraController } from "./camera/camera";

export const Doodlejump = () => {
  return (
    <Canvas>
      <CameraController />
      <Box position={[0, 0, 0]} scale={[1, 2, 1]} />
      <ambientLight intensity={Math.PI / 2} />
      <Level />
    </Canvas>
  );
};
