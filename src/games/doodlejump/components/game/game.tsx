import React from "react";
import { Canvas } from "@react-three/fiber";
import { Level } from "../level/level";
import { CameraController } from "../camera/camera";

export const Doodlejump = () => {
  return (
    <Canvas>
      <CameraController />
      <ambientLight intensity={Math.PI / 2} />
      <Level />
    </Canvas>
  );
};
