export const events = {

    input: ({ left, right, up, any }: any) => {

        let keypressed = false;
        const keydown = (e: Event) => {
            if (keypressed) return;
            keypressed = true;
            if (e instanceof KeyboardEvent)
                switch (e.key) {
                    case 'a': case 'ArrowLeft': {
                        left && left();
                        break;
                    }
                    case 'd': case 'ArrowRight': {
                        right && right();
                        break;
                    }
                    case 'w': case 'ArrowUp': {
                        up && up();
                        break;
                    }
                    default: {
                        any && any()
                    }
                }
        }
        const keyup = (e: Event) => {
            if (!keypressed) return;
            keypressed = false;
        }

        ['keydown', 'touchstart'].forEach((eventType) =>
            document.addEventListener(eventType, (e) => keydown(e))
        );
        ['keyup', 'touchend'].forEach((eventType) =>
            document.addEventListener(eventType, (e) => keyup(e))
        );

        return keydown
    },

    lifecycle: {
        interval: 0,
        lasttimestamp: 0,
        update: function (fn: () => void, timestamp: any) {
            // if (this.lasttimestamp == timestamp) return;
            // this.interval && clearInterval(this.interval);
            // this.interval = setInterval(fn, timestamp);
        },

        createRenderLoop: (fps = 20) => {
            const interval = 1000 / fps;
            let lastrendertime = 0;
            let active = true;

            const x = (fn: (delta: number) => void) => {
                const loop = () => {
                    if (!active) return;
                    // console.log(index);
                    const now = performance.now();
                    const delta = now - lastrendertime;

                    if (delta >= interval) {
                        lastrendertime = now - (delta % interval);
                        fn(delta / 1000);
                    }

                    requestAnimationFrame(loop);
                };

                return loop;
            };

            const start = (fn: (delta: number) => void) => {
                lastrendertime = 0;
                active = true;
                x(fn)();
            }

            const stop = () => {
                active = false;
            }

            return { start, stop }
        },

        render: function (fn: () => void) {
            fn();
            requestAnimationFrame(() => this.render(fn));
        },
    },
};

export const utils = {
    number: {
        randomRange(min: number, max: number) {
            return min + Math.floor(Math.random() * (max - min + 1));
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
    set: {
        xyz: (obj: any, x: number, y: number, z: number) => {
            if (x != undefined) obj.x = x;
            if (y != undefined) obj.y = y;
            if (z != undefined) obj.z = z;
        }
    },
    transform: {
        localtoglobal: (a, b) => {
            const ap = a.position;
            const bp = b.position;
            const ax = a.scale;
            const bx = b.scale;
            return {
                position: { x: ap.x + bp.x, y: ap.y + bp.y, z: ap.z + bp.z },
                scale: { x: 1, y: 1, z: 1 } || { x: ax.x + bx.x, y: ax.y + bx.y, z: ax.z + bx.z }
            }
        }
    }
};