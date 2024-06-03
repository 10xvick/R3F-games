import React from "react";
import { Vector3 } from "three";

export default function Box({
  position = [1, 1, 1],
  scale = [1, 1, 1],
  color = "pink",
}: {
  position?: number[];
  scale?: number[];
  color?: string;
}) {
  return (
    <mesh scale={new Vector3(...scale)} position={new Vector3(...position)}>
      <boxGeometry />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
