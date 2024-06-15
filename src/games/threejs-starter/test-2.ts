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
    const curvedShaderMaterial = curvedshadermaterial();
    d.three.materials.push(curvedShaderMaterial);

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
                let obstacle: Obstacle = { base: new Mesh(geometry, curvedShaderMaterial.value) };
                obstacle.base.scale.x = 20 / 100;
                obstacle.base.scale.y = 20 / 100;
                obstacle.base.scale.z = 6000 / 100;
                obstacle.base.position.x = utils.number.randomRange(-1, 2) * 50 / 100
                d.three.scene.add(obstacle.base)
                return obstacle;
            },
            floor: () => {
                let floor: Floor = {
                    base: new Mesh(geometry, curvedShaderMaterial.value),
                    next: null!,
                    prev: null!,
                    obstacle: x.generate.obstacle(),
                    body: { base: new Mesh(geometry, new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.05 })) }
                };
                floor.obstacle.base.parent = floor.base;
                floor.base.scale.x = 100;
                floor.base.scale.y = 100;
                floor.base.scale.z = 2;
                floor.base.position.x = 0;
                d.three.scene.add(floor.body.base);
                floor.base.rotation.y = Math.PI * 90
                floor.body.base.scale.x = 400 / 100;
                floor.body.base.scale.y = 100 / 100;
                floor.body.base.scale.z = 10 / 100;
                floor.body.base.parent = floor.base;

                const tempmesh = new Mesh(geometry, curvedShaderMaterial.value);
                // d.three.scene.add(tempmesh); 
                tempmesh.scale.x = 50;
                tempmesh.scale.y = 50;
                tempmesh.scale.z = 20;
                tempmesh.position.z = 50;


                const behaviour = {
                    update: () => {

                        return (delta: number) => {

                            floor.base.position.y -= delta * d.game.speed;

                            if (floor.base.position.y < -100) {
                                floor.base.position.y = floor.prev.base.position.y + 100;
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
                    d.three.scene.add(floor.base);
                    floor.base.position.y = 100 * i - 150;
                }

                for (let i = 0; i < d.level.floors.length; i++) {
                    d.level.floors[i].next = d.level.floors[i + 1];
                    d.level.floors[i].prev = d.level.floors[i - 1];
                }

                // async function updatecurvature() {
                //     console.log('updating')
                //     const newpos: any = [];
                //     const uniforms = curvedShaderMaterial.value.uniforms
                //     await tween(uniforms.curvx.value, utils.number.randomRange(-4, 4), 1000, val => newpos.push(val));
                //     await tween(uniforms.curvy.value, utils.number.randomRange(-4, 4), 1000, val => newpos.push(val));
                //     await tween(uniforms.curvz.value, utils.number.randomRange(-4, 4), 1000, val => newpos.push(val));
                //     d.three.materials.forEach((e: any) => e.update(...newpos))
                //     await updatecurvature();
                // }

                // updatecurvature();

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
                mesh.position.y = -30;
                d.player.mesh = mesh;
                d.three.scene.add(mesh);
                camera.position.y = -100;


                const behaviour = {
                    update: () => {
                        return (delta: number) => {
                            d.three.camera.position.z = lerp(d.three.camera.position.z, d.player.mesh.position.z + 50, 0.1)
                            d.three.camera.position.x = lerp(d.three.camera.position.x, d.player.mesh.position.x, 0.1)
                        }
                    },
                    move: (dir: number) => {
                        return tween(mesh.position.x,
                            mesh.position.x + dir * 50, 50,
                            (val) => mesh.position.x = val,
                            ease.backIn
                        )
                    },
                    jump: () => {
                        return tween(mesh.position.z, 50, 50, (value) => {
                            mesh.position.z = value;
                        }, ease.cubicOut).then(() => tween(50, 0, 50, (value) => {
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
        floors: [] as Floor[],
        floor: {
            total: 10,
            curvature: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    },
    player: {
        scale: { x: 10, y: 15 },
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
}


interface MeshObject {
    base: Mesh;
}
interface Floor extends MeshObject {
    next: Floor,
    prev: Floor,
    obstacle: Obstacle,
    body: MeshObject
}

interface Obstacle extends MeshObject {

};
