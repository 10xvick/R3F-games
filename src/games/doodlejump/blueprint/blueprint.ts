export const game = {
  level: {
    scale: {
      y: 200,
    },
  },
  player: {
    initial: {
      position: { x: 0, y: 0 },
      jump: { active: false, jumpsteps: 0 },
    },
    position: {
      x: 0,
      y: 0,
    },
    scale: {
      y: 25,
      x: 15,
    },
    jump: {
      limit: 20,
      strength: 100,
    },
  },
  speed: 50,
  gravity: 400,
};
