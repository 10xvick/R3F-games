import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { usePlayerStore } from "../stores/player";

export const CameraController = () => {
  const { camera } = useThree();
  const { playerdata } = usePlayerStore();
  const [campos, setcampos] = useState([0, 0, 300]);

  useEffect(() => {
    // camera.lookAt(playerdata.position.x, playerdata.position.y, 0);
    if (playerdata.jump.active) {
      setcampos([playerdata.position.x, playerdata.position.y, 1]);
    } else setcampos([0, 0, 300]);
  }, [playerdata.jump.active]);

  useFrame(() => {
    const pos = camera.position;
    pos.lerp({ x: campos[0], y: campos[1], z: campos[2] }, 0.01);
  });
  return null;
};
