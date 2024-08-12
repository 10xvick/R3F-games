import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";
import TWEEN, { Easing, Tween } from "@tweenjs/tween.js";
import { ease, lerp, tween } from "./utility/lerp";
import { curvedshadermaterial, texture } from "./utility/materials";
import { meshlib } from "./meshes";

export function creategame_test2(renderer: WebGLRenderer, setstats: () => void) {
    initializegameobjects(renderer);
    return logics(setstats);
}

function logics(setstats) {
    const d = gameobject;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const { camera } = d.three;
    camera.position.z = 100
    camera.rotation.x = Math.PI / 2.5
    camera.position.y = -120;


    // d.three.scene.add(new Mesh(geometry, material));

    const toupdate: Array<(delta: number) => void> = [];
    type inputfn = Array<() => void>
    const toinput = {
        any: [] as inputfn, left: [] as inputfn, right: [] as inputfn, up: [] as inputfn
    }

    // const col = (a, b) => {
    //     return (a.position.x == b.position.x && a.position.y == b.position.y)
    // }

    const x = {
        action: {
            collision: {
                player_obstacle: () => {
                    d.level.obstacle.container.forEach(e => {
                        // console.log(d.level.obstacle.container[0].base.position)
                        // if (utils.collision.rect2rect.basic(d.player.mesh, utils.transform.localtoglobal(e.base, e.base.parent))) {
                        //     console.log('collision')
                        // }
                    })
                }
            },
            gameover: () => {

            },
            updatescore: () => {
                d.game.score++;
                setstats('xxxscore:' + Math.floor(d.game.score / 10))
            }
        },
        generate: {
            obstacle: () => {
                let obstacle: Obstacle = { base: new Mesh(geometry, d.level.obstacle.a.material.value) };
                utils.set.xyz(obstacle.base.scale, 0.1, 0.1, 1 / 4);
                utils.set.xyz(obstacle.base.position, utils.number.randomRange(-1, 1) * d.level.row.size / 100, 0, obstacle.base.scale.z / 2.5);
                d.level.obstacle.container.push(obstacle)
                return obstacle;
            },
            floor: () => {
                let floor: Floor = {
                    base: new Mesh(geometry, new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 })),
                    next: null!,
                    prev: null!,
                    obstacle: x.generate.obstacle(),
                    ground: { base: new Mesh(geometry, d.level.floor.material.value) },

                };

                utils.set.xyz(floor.base.scale, d.level.floor.base.size, d.level.floor.base.size, d.level.floor.base.size);
                utils.set.xyz(floor.ground.base.scale, 2, 1, 1 / d.level.floor.base.size);

                const buildings = meshlib.buildings();
                d.three.materials.push(buildings.material);

                d.three.scene.add(floor.base);
                floor.base.add(floor.ground.base,
                    floor.obstacle.base, ...Object.values(buildings.mesh).map(e => e.base)
                );

                const behaviour = {
                    update: () => {

                        return (delta: number) => {
                            if (floor.base.position.y < - floor.base.scale.y) {
                                floor.base.position.y = floor.prev.base.position.y + floor.prev.base.scale.y;

                                x.action.updatescore();
                            }
                        }
                    }
                }
                toupdate.push(behaviour.update());
                return floor
            },
            level: () => {

                for (let i = 1; i < d.level.floor.total; i++) {
                    const floor = x.generate.floor();
                    d.level.floors.push(floor);
                }

                for (let i = 0; i < d.level.floors.length; i++) {
                    d.level.floors[i].next = d.level.floors[i + 1];
                    d.level.floors[i].prev = d.level.floors[i - 1];
                }

                function updatecurvature() {
                    const uniforms = d.level.floor.material.value.uniforms;
                    const getrandom = () => utils.number.randomRange(-2, 2);
                    const steps = 10000 / d.game.speed;
                    Promise.all(
                        [tween(uniforms.curvx.value, getrandom(), steps, (val) => {
                            d.three.materials.forEach(e => e.updatecurv.x(val))
                        }), tween(uniforms.curvz.value, getrandom(), steps, (val) => {
                            d.three.materials.forEach(e => e.updatecurv.z(val))
                        })
                        ]).then(() => updatecurvature())
                }

                updatecurvature();

                d.level.floors[0].prev = d.level.floors[d.level.floors.length - 1];
                d.level.floors[d.level.floors.length - 1].next = d.level.floors[0];
                return d.level;
            },
            player: () => {
                const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 0x005500 }));
                mesh.scale.x = d.player.scale.x;
                mesh.scale.y = d.player.scale.y;
                mesh.scale.z = 10;
                d.player.mesh = mesh;
                d.three.scene.add(mesh);
                camera.position.y = -80;
                mesh.position.z = d.player.base;

                const behaviour = {
                    update: () => {
                        return (delta: number) => {
                            d.three.camera.position.z = lerp(d.three.camera.position.z, d.player.mesh.position.z + 50, 0.1);
                            d.three.camera.position.x = lerp(d.three.camera.position.x, d.player.mesh.position.x, 0.1);
                            d.level.floors.forEach(floor => floor.base.position.y -= delta * d.game.speed);
                        }
                    },
                    move: (dir: number) => {
                        return tween(mesh.position.x,
                            mesh.position.x + dir * d.level.row.size, 4,
                            (val) => mesh.position.x = val, ease.bounceOut
                        )
                    },
                    jump: () => {
                        const jumpHeight = d.player.base + d.player.jump.height;
                        return tween(mesh.position.z, jumpHeight, 2, (value) => {
                            mesh.position.z = value;
                        }, ease.cubicOut).then(() => tween(jumpHeight, d.player.base, 4, (value) => {
                            mesh.position.z = value;
                        }, ease.cubicIn));
                    }
                }

                const inputsafe = (fn: any) => {
                    return () => {
                        if (d.game.takeinput) {
                            d.game.takeinput = false;
                            fn().then(() => d.game.takeinput = true);
                        }
                    }
                }

                toupdate.push(behaviour.update());
                toinput.left.push(inputsafe(() => behaviour.move(-1)));
                toinput.right.push(inputsafe(() => behaviour.move(1)));
                toinput.up.push(inputsafe(() => behaviour.jump()));

                return mesh;
            }
        },
        events: {
            input: {
                action: () => {
                    // toinput.forEach(fn => fn())
                },
                left: () => {
                    toinput.left.forEach(fn => fn());
                },
                right: () => {
                    toinput.right.forEach(fn => fn());
                },
                up: () => {
                    toinput.up.forEach(fn => fn())
                }
            },
            lifecycle: {
                update: (delta: number) => {
                    TWEEN.update()
                    toupdate.forEach(fn => fn(delta));
                    d.three.renderer.render(d.three.scene, d.three.camera);
                }
            }
        }
    }

    toupdate.push(x.action.collision.player_obstacle)
    x.generate.level();
    x.generate.player();
    events.input({ left: x.events.input.left, right: x.events.input.right, up: x.events.input.up });
    events.lifecycle.createRenderLoop(40)((delta) => x.events.lifecycle.update(delta))
    return x;
}


const gameobject = {
    three: {
        renderer: {} as WebGLRenderer,
        scene: new Scene(),
        camera: new PerspectiveCamera(75, 1, 0.1, 10000),
        materials: [] as Array<any>,
    },
    game: {
        score: 0,
        speed: 60 * 4 / 2,
        gravity: 150,
        takeinput: true,
    },
    level: {
        row: { size: 40 },
        floors: [] as Floor[],
        floor: {
            base: { size: 100 },
            total: 6,
            curvature: {
                x: 0,
                y: 0,
                z: 0
            }, material: curvedshadermaterial(texture.floor),
        }, obstacle: {
            a: {
                material: curvedshadermaterial(texture.obstacle)
            },
            container: [] as Array<Obstacle>
        }
    },
    player: {
        scale: { x: 10, y: 10 },
        base: 10,
        mesh: new Mesh,
        floor: null as Floor | null,
        jump: {
            steps: 0,
            height: 50
        },
    }
}

function initializegameobjects(renderer: WebGLRenderer) {
    gameobject.three.renderer = renderer;
    gameobject.three.materials.push(gameobject.level.floor.material, gameobject.level.obstacle.a.material)
}


interface MeshObject {
    base: Mesh;
}
interface Floor extends MeshObject {
    next: Floor,
    prev: Floor,
    obstacle: Obstacle,
    ground: MeshObject,
}

interface Obstacle extends MeshObject {

};
