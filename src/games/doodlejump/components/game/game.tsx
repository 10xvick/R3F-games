import React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Level } from "../level/level";
import Box from "../../prefabs/box";
import { CameraController } from "../camera/camera";
import { create } from "zustand";

export const Doodlejump = () => {
  return (
    <Canvas>
      <CameraController />
      <ambientLight intensity={Math.PI / 2} />
      <Level />
    </Canvas>
  );
};
