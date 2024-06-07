import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";

export function creategame_test2(renderer: WebGLRenderer) {
    initializegameobjects(renderer);
    return logics();
}

function logics() {
    const d = gameobject;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const { camera } = d.three;
    camera.position.z = 100
    // camera.rotation.x = Math.PI / 3
    // camera.position.y = -100

    d.three.scene.add(new Mesh(geometry, material));

    const toupdate: Array<(delta: number) => void> = [];
    const toinput: Array<() => void> = [];

    const x = {
        action: {},
        generate: {
            obstacle: () => {
                let obstacle = { base: new Mesh(geometry, new MeshBasicMaterial({ color: 0xff0000 })) };
                obstacle.base.scale.x = 10;
                obstacle.base.scale.y = 10;
                obstacle.base.scale.z = 10;
                obstacle.base.position.x = utils.number.randomRange(-1, 1) * 75;
            },
            floor: () => {
                let floor: Floor = { base: new Mesh(geometry, new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 })), next: null!, prev: null! };
                floor.base.scale.x = 100;
                floor.base.scale.y = 45;
                floor.base.scale.z = 10
                floor.base.position.x = 0;

                const behaviour = {
                    update: () => {
                        let dir = 1;
                        const xspeed = utils.number.randomRange(30, 70)
                        return (delta: number) => {
                            floor.base.position.y -= delta * d.game.speed;
                            // floor.base.position.x += dir * delta * xspeed;
                            if (Math.abs(floor.base.position.x) > 50) {
                                floor.base.position.x = 49 * dir
                                dir = -1 * dir;
                            }
                            if (floor.base.position.y < -100) {
                                floor.base.position.y = floor.prev.base.position.y + 50;

                            }
                        }
                    }
                }

                toupdate.push(behaviour.update());
                return floor
            },
            level: () => {

                for (let i = 1; i < 5; i++) {
                    const floor = x.generate.floor();
                    d.level.floors.push(floor);
                    d.three.scene.add(floor.base);
                    floor.base.position.y = 50 * i - 150;
                }

                for (let i = 0; i < d.level.floors.length; i++) {
                    d.level.floors[i].next = d.level.floors[i + 1];
                    d.level.floors[i].prev = d.level.floors[i - 1];
                }

                d.level.floors[0].prev = d.level.floors[d.level.floors.length - 1];
                d.level.floors[d.level.floors.length - 1].next = d.level.floors[0];
                d.level.floors = d.level.floors;
                return d.level;
            },
            player: () => {
                const mesh = new Mesh(geometry, material);
                mesh.scale.x = d.player.scale.x;
                mesh.scale.y = d.player.scale.y;
                mesh.scale.z = 10;
                mesh.position.y = -30
                d.player.mesh = mesh;
                d.three.scene.add(mesh);

                const behaviour = {

                    update: () => {
                        let xland = 0;
                        return (delta: number) => {
                            // if (d.player.floor) {
                            //     mesh.position.y = d.player.floor.base.position.y + mesh.scale.y / 2 + d.player.floor.base.scale.y / 2;
                            //     mesh.position.x = d.player.floor.base.position.x + xland;
                            // } else if (d.player.jump.steps > 0) {
                            //     mesh.position.y += delta * d.player.jump.strength * d.player.jump.steps;
                            //     d.player.jump.steps -= 1;
                            // } else {
                            //     mesh.position.y -= delta * d.game.gravity;
                            //     d.level.floors.forEach(floor => {
                            //         if (utils.collision.rect2rect.basic(mesh, floor.base)) {
                            //             d.player.floor = floor;
                            //             xland = mesh.position.x - floor.base.position.x;
                            //         }
                            //     })
                            // }
                        }
                    },
                    jump: () => {
                        d.player.jump.steps = d.player.jump.maxsteps;
                        d.player.floor = null
                    }
                }

                toupdate.push(behaviour.update());
                toinput.push(behaviour.jump)

                return mesh;
            }
        },
        events: {
            input: {
                action: () => {
                    console.log('input');
                    toinput.forEach(fn => fn())
                }
            },
            lifecycle: {
                update: (delta: number) => {
                    toupdate.forEach(fn => fn(delta));
                    d.three.renderer.render(d.three.scene, d.three.camera);
                }
            }
        }
    }
    const level = x.generate.level();
    const player = x.generate.player();
    events.input.any(() => x.events.input.action())
    events.lifecycle.createRenderLoop(40)((delta) => x.events.lifecycle.update(delta))
    return x;
}


const gameobject = {
    three: {
        renderer: {} as WebGLRenderer,
        scene: new Scene(),
        camera: new PerspectiveCamera(75, 1, 0.1, 10000),
    },
    game: {
        score: 0,
        speed: 20,
        gravity: 150,
    },
    level: {
        floors: [] as Floor[]
    },
    player: {
        scale: { x: 10, y: 15 },
        mesh: new Mesh,
        floor: null as Floor | null,
        jump: {
            steps: 0,
            maxsteps: 14,
            strength: 20,
        }
    }
}

function initializegameobjects(renderer: WebGLRenderer) {
    gameobject.three.renderer = renderer;
}

interface Floor {
    base: Mesh,
    next: Floor,
    prev: Floor
}
