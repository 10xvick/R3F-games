import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";
import { lib } from "./utility/helper_lib";

export function creategame_doodlejump(renderer: WebGLRenderer) {
    initializegameobjects(renderer);
    return logics();
}

function logics() {
    const d = gameobject;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });

    d.three.camera.position.z = 100;
    d.three.scene.add(new Mesh(geometry, material));

    const toupdate: Array<(delta: number) => void> = [];
    const toinput: Array<() => void> = [];

    const x = {
        action: {},
        generate: {
            floor: () => {
                let floor: Floor = { base: new Mesh(geometry, material), next: null!, prev: null! };
                floor.base.scale.x = 40;
                floor.base.scale.y = 5;
                floor.base.position.x = 0;

                const behaviour = {
                    update: () => {
                        const x_pingpong = lib.behaviour.movement.pingpong(floor.base.position, 'x', utils.number.randomRange(30, 70), 80);

                        return (delta: number) => {
                            floor.base.position.y -= delta * d.game.speed;
                            x_pingpong(delta)
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
                mesh.position.y = 0;
                d.player.mesh = mesh;
                d.three.scene.add(mesh);

                const behaviour = {

                    update: () => {
                        let xland = 0;
                        return (delta: number) => {
                            if (d.player.floor) {
                                mesh.position.y = d.player.floor.base.position.y + mesh.scale.y / 2 + d.player.floor.base.scale.y / 2;
                                mesh.position.x = d.player.floor.base.position.x + xland;
                            } else if (d.player.jump.steps > 0) {
                                mesh.position.y += delta * d.player.jump.strength * d.player.jump.steps;
                                d.player.jump.steps -= 1;
                            } else {
                                mesh.position.y -= delta * d.game.gravity;
                                d.level.floors.forEach(floor => {
                                    if (utils.collision.rect2rect.basic(mesh, floor.base)) {
                                        d.player.floor = floor;
                                        xland = mesh.position.x - floor.base.position.x;
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
        camera: new PerspectiveCamera(100, 1, 0.1, 10000),
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
