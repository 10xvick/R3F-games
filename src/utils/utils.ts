export const utils = {
  number: {
    randomRange(min: number, max: number) {
      return min + Math.floor(Math.random() * (max - min));
    },
  },
  collision: {
    rect2rect: {
      basic: (a, b) =>
        a.position.x + a.scale.x / 2 > b.position.x - b.scale.x / 2 &&
        a.position.x - a.scale.x / 2 < b.position.x + b.scale.x / 2 &&
        a.position.y + a.scale.y / 2 > b.position.y - b.scale.y / 2 &&
        a.position.y - a.scale.y / 2 < b.position.y + b.scale.y / 2,
      platform: (a, b) =>
        a.position.x + a.scale.x / 2 > b.position.x - b.scale.x / 2 &&
        a.position.x - a.scale.x / 2 < b.position.x + b.scale.x / 2 &&
        b.position.y - b.scale.y / 2 - a.position.y + a.scale.y / 2 < 1,
    },
  },
};
