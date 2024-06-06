import { useState } from "react";
import { game } from "../../blueprint/blueprint";
import Box from "../../prefabs/box";
import { useLevelstore } from "../../stores/level";
import { utils } from "../../../../utils/utils";
import { useGamestore } from "../../stores/game";
import { usePlayerStore } from "../../stores/player";
import { useUpdate } from "../../customHooks/update";
import { useInput } from "../../../input/input";

export default function Player() {
  const { playerdata, setPlayerdata, resetPlayerdata } = usePlayerStore();
  const { setspeed, setscore, speed, score, pause, setpause } = useGamestore();
  const { floors, activeFloor, setActiveFloor } = useLevelstore();
  const [xonland, setxonland] = useState(0);

  function restart() {
    resetPlayerdata();
    setpause(false);
  }

  useInput("up", (e) => {
    if (pause) return restart();
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

            setscore(score + 1);
            setspeed(speed + 1);
          }
        }
      }
      player.position.y -= delta * game.gravity;
    }

    if (player.position.y < -game.level.scale.y + game.player.scale.y / 2)
      setpause(true);

    setPlayerdata({ ...player });
  });

  return (
    <Box
      scale={[game.player.scale.x, game.player.scale.y, 10]}
      position={[playerdata.position.x, playerdata.position.y, 0]}
    />
  );
}
