import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useInput } from "../../input/input";
import { game } from "../blueprint/blueprint";
import Box from "../prefabs/box";
import { useLevelstore } from "../stores/level";
import { utils } from "../../../utils/utils";

export default function Player() {
  const [pos, setpos] = useState({ jump: false, jumpsteps: 0, x: 0, y: 0 });
  const { floors, activeFloor, setActiveFloor } = useLevelstore();
  const [xonland, setxonland] = useState(0);

  useInput("up", (e) => {
    pos.jump = true;
    pos.jumpsteps = 0;
    setActiveFloor(-1);
  });

  useFrame((state, delta) => {
    const player = { ...pos };
    if (player.y < -200) player.y = -200;

    if (activeFloor) {
      player.x = activeFloor.position.x + xonland;
      player.y = activeFloor.position.y + 20;
    } else {
      if (player.jump) {
        const jumpstep = game.player.jump.limit - player.jumpsteps++;
        if (jumpstep) player.y += delta * game.player.jump.strength * jumpstep;
        else {
          player.jumpsteps = 0;
          player.jump = false;
        }
      } else {
        for (let i = 0; i < floors.length; i++) {
          const floor = floors[i];
          if (
            utils.collision.rect2rect.basic(floor, {
              position: pos,
              scale: { x: 20, y: 10 },
            })
          ) {
            setActiveFloor(i);
            setxonland(player.x - floor.position.x);
          }
        }
      }
      player.y -= delta * game.gravity;
    }

    setpos({ ...player });
  });

  return (
    <>
      <Box scale={[20, 30, 10]} position={[pos.x, pos.y, 0]} />
    </>
  );
}
