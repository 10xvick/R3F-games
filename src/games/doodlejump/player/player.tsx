import { useEffect, useState } from "react";
import { useInput } from "../../input/input";
import { game } from "../blueprint/blueprint";
import Box from "../prefabs/box";
import { useLevelstore } from "../stores/level";
import { utils } from "../../../utils/utils";
import { useUpdate } from "../game";
import { useGamestore } from "../stores/game";

export default function Player() {
  const [playerdata, setplayerdata] = useState(game.player.initial);
  const { floors, activeFloor, setActiveFloor } = useLevelstore();
  const [xonland, setxonland] = useState(0);
  const { setpause } = useGamestore();

  useInput("up", (e) => {
    playerdata.jump.active = true;
    playerdata.jump.jumpsteps = 0;
    setActiveFloor(-1);
  });

  useUpdate((state, delta) => {
    const player = { ...playerdata };
    if (player.position.y < -game.level.scale.y)
      player.position.y = -game.level.scale.y;

    if (activeFloor) {
      player.position.x = activeFloor.position.x + xonland;
      player.position.y = activeFloor.position.y + game.player.scale.y / 2;
    } else {
      if (player.jump.active) {
        const jumpstep = game.player.jump.limit - player.jump.jumpsteps++;
        if (jumpstep)
          player.position.y += delta * game.player.jump.strength * jumpstep;
        else {
          player.jump.jumpsteps = 0;
          player.jump.active = false;
        }
      } else {
        for (let i = 0; i < floors.length; i++) {
          const floor = floors[i];
          if (
            utils.collision.rect2rect.basic(floor, {
              position: player.position,
              scale: game.player.scale,
            })
          ) {
            setActiveFloor(i);
            setxonland(player.position.x - floor.position.x);
          }
        }
      }
      player.position.y -= delta * game.gravity;
    }

    if (player.position.y < -game.level.scale.y + game.player.scale.y / 2)
      setpause(true);
    setplayerdata({ ...player });
  });

  return (
    <>
      <Box
        scale={[game.player.scale.x, game.player.scale.y, 10]}
        position={[playerdata.position.x, playerdata.position.y, 0]}
      />
    </>
  );
}
