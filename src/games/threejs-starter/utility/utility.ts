export const events = {
    input: {
        any: (fn: () => void) => {
            let keypressed = false;
            ['keydown', 'touchstart'].forEach((eventType) =>
                document.addEventListener(eventType, (e) => {
                    if (!keypressed) {
                        fn();
                        keypressed = true;
                    }
                })
            );
            ['keyup', 'touchend'].forEach((eventType) =>
                document.addEventListener(eventType, (e) => {
                    keypressed = false;
                })
            );
        },

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

            return (fn: (delta: number) => void) => {
                const loop = () => {
                    const now = performance.now();
                    const delta = now - lastrendertime;

                    if (delta >= interval) {
                        lastrendertime = now - (delta % interval);
                        fn(delta / 1000);
                    }

                    requestAnimationFrame(loop);
                };

                requestAnimationFrame(loop);
            };
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