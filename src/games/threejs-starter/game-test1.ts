import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";

export function creategame_test1(renderer: WebGLRenderer) {
    initializegameobjects(renderer);
    return logics();
}

function logics() {
    const d = gameobject;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });

    d.three.camera.position.z = 120

    const toupdate: Array<(delta: number) => void> = [];
    const toinput: Array<() => void> = [];

    const x = {
        action: {},
        generate: {
            floor: () => {
                const cube = new Mesh(geometry, material) as Floor;
                cube.scale.x = 40;
                cube.scale.y = 5;
                cube.position.x = 0;

                const behaviour = {
                    update: () => {
                        let dir = 1;
                        const xspeed = utils.number.randomRange(30, 70)
                        return (delta: number) => {
                            cube.position.y -= delta * d.game.speed;
                            cube.position.x += dir * delta * xspeed;
                            if (Math.abs(cube.position.x) > 50) {
                                cube.position.x = 49 * dir
                                dir = -1 * dir;
                            }
                            if (cube.position.y < -100) {
                                cube.position.y = cube.prev!.position.y + 50;
                            }
                        }
                    }
                }

                toupdate.push(behaviour.update());
                return cube as Floor;
            },
            level: () => {
                const level = {
                    floors: [] as Floor[]
                }

                for (let i = 1; i < 5; i++) {
                    const floor = x.generate.floor();
                    level.floors.push(floor);
                    d.three.scene.add(floor);
                    floor.position.y = 50 * i - 150;
                }

                for (let i = 0; i < 4; i++) {
                    level.floors[i].next = level.floors[i + 1];
                    level.floors[i].prev = level.floors[i - 1];
                }
                level.floors[0].prev = level.floors[level.floors.length - 1];
                level.floors[level.floors.length - 1].next = level.floors[0];
                d.level.floors = level.floors;
                return level;
            },
            player: () => {
                const mesh = new Mesh(geometry, material);
                mesh.scale.x = 10;
                mesh.scale.y = 15;
                mesh.position.y = 0;
                d.player.mesh = mesh;
                d.three.scene.add(mesh);

                const behaviour = {

                    update: () => {
                        let xland = 0;
                        return (delta: number) => {
                            if (d.player.floor) {
                                mesh.position.y = d.player.floor.position.y + mesh.scale.y / 2 + d.player.floor.scale.y / 2;
                                mesh.position.x = d.player.floor.position.x + xland;
                            } else if (d.player.jump.steps > 0) {
                                mesh.position.y += delta * d.player.jump.strength * d.player.jump.steps;
                                d.player.jump.steps -= 1;
                            } else {
                                mesh.position.y -= delta * d.game.gravity;
                                d.level.floors.forEach(floor => {
                                    if (utils.collision.rect2rect.basic(mesh, floor)) {
                                        d.player.floor = floor;
                                        xland = mesh.position.x - floor.position.x;
                                    }
                                })
                            }
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
        camera: new PerspectiveCamera(75, 1, 0.1, 1000),
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
        mesh: new Mesh,
        floor: null as null | Mesh,
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

interface Floor extends Mesh {
    next?: Floor,
    prev?: Floor
}
