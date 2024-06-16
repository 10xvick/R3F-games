import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";
import TWEEN, { Easing, Tween } from "@tweenjs/tween.js";
import { ease, lerp, tween } from "./utility/lerp";
import { curvedshadermaterial, texture } from "./utility/materials";

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
    camera.rotation.x = Math.PI / 2.5
    camera.position.y = -120;


    // d.three.scene.add(new Mesh(geometry, material));

    const toupdate: Array<(delta: number) => void> = [];
    type inputfn = Array<() => void>
    const toinput = {
        any: [] as inputfn, left: [] as inputfn, right: [] as inputfn, up: [] as inputfn
    }

    const x = {
        action: {},
        generate: {
            obstacle: () => {
                let obstacle: Obstacle = { base: new Mesh(geometry, d.level.obstacle.a.material.value) };
                utils.set.xyz(obstacle.base.scale, 0.1, 0.1, 1 / 4);
                utils.set.xyz(obstacle.base.position, utils.number.randomRange(-1, 1) * d.level.row.size / 100, 0, obstacle.base.scale.z / 2.5);
                console.log(obstacle.base.position.x);
                return obstacle;
            },
            floor: () => {
                let floor: Floor = {
                    base: new Mesh(geometry, new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 })),
                    next: null!,
                    prev: null!,
                    obstacle: x.generate.obstacle(),
                    ground: { base: new Mesh(geometry, d.level.floor.material.value) },
                    buildings: {
                        left: {
                            inner: { base: new Mesh(geometry, d.level.obstacle.a.material.value) },
                            outer: { base: new Mesh(geometry, d.level.obstacle.a.material.value) }
                        },
                        right: {
                            inner: { base: new Mesh(geometry, d.level.obstacle.a.material.value) },
                            outer: { base: new Mesh(geometry, d.level.obstacle.a.material.value) }
                        }
                    }
                };

                utils.set.xyz(floor.base.scale, d.level.floor.base.size, d.level.floor.base.size, d.level.floor.base.size);
                utils.set.xyz(floor.ground.base.scale, 2, 1, 1 / d.level.floor.base.size);
                utils.set.xyz(floor.buildings.left.inner.base.position, -1.2, 0, .5);
                utils.set.xyz(floor.buildings.left.outer.base.position, -1.2, 0, .5);
                utils.set.xyz(floor.buildings.right.inner.base.position, 1.2, 0, .5);
                utils.set.xyz(floor.buildings.right.outer.base.position, 1.2, 0, .5);

                d.three.scene.add(floor.base);
                floor.base.add(floor.ground.base,
                    floor.obstacle.base,
                    floor.buildings.left.inner.base,
                    floor.buildings.left.inner.base,
                    floor.buildings.right.outer.base,
                    floor.buildings.right.inner.base,
                );

                const behaviour = {
                    update: () => {

                        return (delta: number) => {

                            if (floor.base.position.y < -100) {
                                floor.base.position.y = floor.prev.base.position.y + 100;
                            } else
                                floor.base.position.y -= delta * d.game.speed;
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
                    floor.base.position.y = 100 * i - 150;
                }

                for (let i = 0; i < d.level.floors.length; i++) {
                    d.level.floors[i].next = d.level.floors[i + 1];
                    d.level.floors[i].prev = d.level.floors[i - 1];
                }

                function updatecurvature() {
                    console.log('xyz')
                    const uniforms = d.level.floor.material.value.uniforms;
                    const getrandom = () => utils.number.randomRange(-2, 2);

                    Promise.all(
                        [tween(uniforms.curvx.value, getrandom(), 1000, (val) => {
                            d.three.materials.forEach(e => e.updatecurv.x(val))
                        }), tween(uniforms.curvz.value, getrandom(), 1000, (val) => {
                            d.three.materials.forEach(e => e.updatecurv.z(val))
                        })
                        ]).then(() => updatecurvature())
                }

                updatecurvature();

                d.level.floors[0].prev = d.level.floors[d.level.floors.length - 1];
                d.level.floors[d.level.floors.length - 1].next = d.level.floors[0];
                d.level.floors = d.level.floors;
                return d.level;
            },
            player: () => {
                const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 0x005500 }));
                mesh.scale.x = d.player.scale.x;
                mesh.scale.y = d.player.scale.y;
                mesh.scale.z = 10;
                mesh.position.y = 0;
                mesh.position.z = 0;
                d.player.mesh = mesh;
                d.three.scene.add(mesh);
                camera.position.y = -80;

                const behaviour = {
                    update: () => {
                        return (delta: number) => {
                            d.three.camera.position.z = lerp(d.three.camera.position.z, d.player.mesh.position.z + 50, 0.1)
                            d.three.camera.position.x = lerp(d.three.camera.position.x, d.player.mesh.position.x, 0.1)
                        }
                    },
                    move: (dir: number) => {
                        return tween(mesh.position.x,
                            mesh.position.x + dir * d.level.row.size, 20,
                            (val) => mesh.position.x = val, ease.cubicIn
                        ).then(val => mesh.position.x = val)
                    },
                    jump: () => {
                        return tween(mesh.position.z, 50, 20, (value) => {
                            mesh.position.z = value;
                        }, ease.cubicOut).then(() => tween(50, 0, 20, (value) => {
                            mesh.position.z = value
                        }, ease.cubicIn))
                    }
                }

                const inputsafe = (fn: any) => {
                    return () => {
                        if (d.game.takeinput) {
                            d.game.takeinput = false;
                            console.log(d.game.takeinput)
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
                    // console.log('input');
                    // toinput.forEach(fn => fn())
                },
                left: () => {
                    console.log('left')
                    toinput.left.forEach(fn => fn());
                },
                right: () => {
                    console.log('right')
                    toinput.right.forEach(fn => fn());
                },
                up: () => {
                    console.log('up')
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
        speed: 60,
        gravity: 150,
        takeinput: true,
    },
    level: {
        row: { size: 40 },
        floors: [] as Floor[],
        floor: {
            base: { size: 100 },
            total: 10,
            curvature: {
                x: 0,
                y: 0,
                z: 0
            }, material: curvedshadermaterial(texture.floor),
        }, obstacle: {
            a: {
                material: curvedshadermaterial(texture.obstacle)
            }
        }
    },
    player: {
        scale: { x: 10, y: 10 },
        mesh: new Mesh,
        floor: null as Floor | null,
        jump: {
            steps: 0,
            maxsteps: 14,
            strength: 20,
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
    buildings: {
        left: {
            outer: MeshObject,
            inner: MeshObject,
        },
        right: {
            outer: MeshObject,
            inner: MeshObject,
        }
    }
}

interface Obstacle extends MeshObject {

};
