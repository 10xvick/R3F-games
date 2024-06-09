export const lib = {
    behaviour: {
        movement: {
            pingpong: (position: any, axis: String, speed: number, range: number) => {
                let dir = 1
                return (delta: number) => {
                    position[axis] += dir * delta * speed;

                    if (Math.abs(position[axis]) > range) {
                        position[axis] = (range - 1) * dir
                        dir = -1 * dir;
                    }
                }
            }
        }
    }
}