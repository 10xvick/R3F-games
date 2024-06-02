import { game } from "./blueprint/blueprint";
import Player from "./player/player";
import { utils } from "../../utils/utils";
import { useLevelstore } from "./stores/level";
import Box from "./prefabs/box";
import { useState } from "react";
import { useUpdate } from "./customHooks/update";
import { useGamestore } from "./stores/game";

export function Level() {
  return (
    <mesh>
      {/* <Box position={[-200, 0, 0]} scale={[10, 410, 10]} />
      <Box position={[200, 0, 0]} scale={[10, 410, 10]} />
      <Box position={[0, 200, 0]} scale={[410, 10, 10]} />
      <Box position={[0, -200, 0]} scale={[410, 10, 10]} /> */}
      {Array(4)
        .fill(0)
        .map((e, i) => (
          <Floor key={i} i={i} />
        ))}
      <Player />
    </mesh>
  );
}

const Floor = ({ i }: { i: number }) => {
  const { floors, setfloorPosition } = useLevelstore();
  const { speed } = useGamestore();
  const { position, scale } = floors[i];
  const [dir, setdir] = useState(1);
  const [xspeed, setxspeed] = useState(utils.number.randomRange(speed, 300));

  utils.number.randomRange(-200 + scale.x / 2, 200 - scale.x / 2);

  useUpdate((state, delta) => {
    if (position.y > -200) position.y -= delta * speed;
    else {
      position.x = utils.number.randomRange(
        -200 + scale.x / 2,
        200 - scale.x / 2
      );
      position.y = 200;
      setxspeed(utils.number.randomRange(speed, 300));
    }
    if (position.x > 200 - scale.x / 2) setdir(-1);
    else if (position.x < -200 + scale.x / 2) setdir(1);

    position.x += delta * dir * xspeed;

    setfloorPosition(i, position.x, position.y);
  });

  return (
    <Box position={[position.x, position.y, 0]} scale={[scale.x, 10, 10]} />
  );
};
