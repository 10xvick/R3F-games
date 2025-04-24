import { Box3, BoxGeometry, FogExp2, Material, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";
import TWEEN from "@tweenjs/tween.js";
import { ease, lerp, tween } from "./utility/lerp";
import { curvedshadermaterial, texture, texturematerial } from "./utility/materials";
import { meshlib } from "./meshes";

type gc = ReturnType<typeof initializegameobjects>;
export function creategame_test2(renderer: WebGLRenderer, setters: Array<() => void>) {
    const gameobject = initializegameobjects(renderer);
    gameobject.three.renderer = renderer;
    return logics(setters, gameobject);
}
type inputfn = Array<() => void>

function logics(setters: Array<(x: string) => void>, gameobject: gc) {
    // console.log('restart', gameobject)
    const [setstats, setgameover]: any = setters
    const d = gameobject;
    const geometry = new BoxGeometry();

    const mat = (texture: Texture) => curvedshadermaterial(texture, gameobject.three.scene.fog as FogExp2)
    gameobject.three.materials.map(e => {
        return mat(e.texture);
    })

    const x = {
        action: {
            collision: {
                player_obstacle: () => {
                    if (!d.player.invincible)
                        d.level.obstacle.container.forEach(e => {
                            const playerBoundingBox = new Box3().setFromObject(d.player.mesh);
                            const obstacleBoundingBox = new Box3().setFromObject(e.base);

                            if (playerBoundingBox.intersectsBox(obstacleBoundingBox)) {
                                console.log('Collision detected!');
                                // x.action.gameover();
                            }
                        });
                }
            },
            gameover: () => {
                d.game.over = true;
                d.game.loop?.stop();
                setgameover(true);
            },
            restart: () => {
                console.log('restart')
                d.three.scene.clear();
                // return;
                // initializegameobjects(d.three.renderer);

                const mesh2 = new Mesh(geometry, texturematerial(texture.floor, d.three.scene.fog as FogExp2).value);
                utils.set.xyz(mesh2.scale, 800, 500, 10);
                utils.set.xyz(mesh2.position, 0, 350, 0);
                mesh2.rotation.x = Math.PI / 2;
                d.three.scene.add(mesh2);

                d.game.to.update = [];
                d.level.floors = [];
                d.level.obstacle.container = [];
                x.generate.level();
                d.game.to.input = {
                    any: [], left: [], right: [], up: []
                }
                x.generate.player();
                d.game.loop = events.lifecycle.createRenderLoop(40);
                d.game.loop.start((delta: number) => x.events.lifecycle.update(delta));

                d.player.invincible = true;
                setTimeout(() => {
                    d.player.invincible = false;
                }, 4000);
                d.game.to.update.push(x.action.collision.player_obstacle)
                console.log('invincible for 4 seconds');

                d.game.over = false;
                d.game.score = 0;
                d.game.speed.value = d.game.speed.min;
                setgameover(false);
            },
            updatescore: () => {
                d.game.score++;
                setstats('xxxscore:' + Math.floor(d.game.score / 10))
            },
            updatespeed: () => {
                if (d.game.speed.value < d.game.speed.max)
                    d.game.speed.value += 1;
            }
        },
        generate: {
            obstacle: () => {
                let obstacle: Obstacle = { base: new Mesh(geometry, d.level.obstacle.a.material.value), rearrange: () => { } };
                obstacle.rearrange = () => {
                    utils.set.xyz(obstacle.base.scale, 0.1, 0.1, 1 / 4);
                    utils.set.xyz(obstacle.base.position, utils.number.randomRange(-1, 1) * d.level.row.size / 100, 0, obstacle.base.scale.z / 2.5);
                }

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

                const buildings = meshlib.buildings(gameobject.three.scene.fog as FogExp2);
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
                                floor.obstacle.rearrange();
                                x.action.updatescore();
                                x.action.updatespeed();
                            }
                        }
                    }
                }
                d.game.to.update.push(behaviour.update());
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

                // move it to separate section 
                function updatecurvature() {
                    const uniforms = d.level.floor.material.value.uniforms;
                    const getrandom = () => utils.number.randomRange(-2, 2);
                    const steps = 50;

                    Promise.all(
                        [tween(uniforms.curvx.value, getrandom(), steps, (val) => {
                            if (!d.game.over)
                                d.three.materials.forEach(e => e.updatecurv.x(val))
                        }), tween(uniforms.curvz.value, getrandom(), steps, (val) => {
                            if (!d.game.over)
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
                const mesh = new Mesh(geometry, new MeshBasicMaterial({ color: 0x0055ff }));
                utils.set.xyz(mesh.scale, d.player.scale.x, d.player.scale.y, 10)
                d.player.mesh = mesh;
                d.three.scene.add(mesh);

                d.three.camera.position.z = 100;
                d.three.camera.rotation.x = Math.PI / 2.5;
                d.three.camera.position.y = -80;
                mesh.position.z = d.player.base;
                d.player.invincible = true;

                const behaviour = {
                    update: () => {
                        return (delta: number) => {
                            d.three.camera.position.z = lerp(d.three.camera.position.z, d.player.mesh.position.z + 50, 0.1);
                            d.three.camera.position.x = lerp(d.three.camera.position.x, d.player.mesh.position.x, 0.1);
                            d.level.floors.forEach(floor => floor.base.position.y -= delta * d.game.speed.value);
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

                d.game.to.update.push(behaviour.update());
                d.game.to.input.left.push(inputsafe(() => behaviour.move(-1)));
                d.game.to.input.right.push(inputsafe(() => behaviour.move(1)));
                d.game.to.input.up.push(inputsafe(() => behaviour.jump()));
                return mesh;
            }
        },
        events: {
            input: {
                action: () => {
                    // toinput.forEach(fn => fn())
                },
                left: () => {
                    d.game.to.input.left.forEach(fn => fn());
                },
                right: () => {
                    d.game.to.input.right.forEach(fn => fn());
                },
                up: () => {
                    d.game.to.input.up.forEach(fn => fn())
                }
            },
            lifecycle: {
                update: (delta: number) => {
                    TWEEN.update()
                    if (!d.game.over) d.game.to.update.forEach(fn => fn(delta));
                    d.three.renderer.render(d.three.scene, d.three.camera);

                    // console.log(d.player.mesh.position.x)
                }
            }
        }
    }


    // x.action.restart();
    events.input({ left: x.events.input.left, right: x.events.input.right, up: x.events.input.up });
    return x;
}

function initializegameobjects(renderer: WebGLRenderer) {
    const scene = new Scene();
    scene.fog = new FogExp2(0xfaffff, 0.004);

    const mat = (texture: Texture) => curvedshadermaterial(texture, scene.fog as FogExp2)

    const gameobject = {
        three: {
            renderer: {} as WebGLRenderer,
            scene: scene,
            camera: new PerspectiveCamera(75, 1, 0.1, 10000),
            materials: [] as Array<any>,
        },
        game: {
            score: 0,
            speed: { max: 60 * 10, min: 60 * 2, value: 60 * 2 },
            gravity: 150,
            takeinput: true,
            over: false,
            loop: null! as any,
            to: {
                update: [] as Array<(delta: number) => void>,
                input: {
                    any: [] as inputfn, left: [] as inputfn, right: [] as inputfn, up: [] as inputfn
                }
            }
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
                },
                material: mat(texture.floor),
            }, obstacle: {
                a: {
                    material: mat(texture.obstacle),
                },
                container: [] as Array<Obstacle>
            }
        },
        player: {
            scale: { x: 10, y: 10 },
            base: 10,
            mesh: null! as Mesh,
            floor: null as Floor | null,
            jump: {
                steps: 0,
                height: 50
            },
            invincible: true,
        },
    }

    gameobject.three.renderer = renderer;
    gameobject.three.materials.push(gameobject.level.floor.material, gameobject.level.obstacle.a.material);

    return gameobject;
}

function resetgameobjects(gameobject: gc) {

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
    rearrange: () => void
};
