import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { events } from "./utility/utility";

export function creategame(renderer: WebGLRenderer) {
    initializegameobjects(renderer);
    return logics();
}

function logics() {
    const d = gameobject;
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);

    d.three.scene.add(cube);

    d.three.camera.position.z = 15;

    cube.position.y = 10

    const x = {
        action: {},
        generator: {},
        events: {
            input: {
                action: () => {
                    console.log('input')
                }
            },
            lifecycle: {
                update: (delta: number) => {
                    d.three.renderer.render(d.three.scene, d.three.camera);
                }
            }
        }
    }
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
        speed: 10
    }
}

function initializegameobjects(renderer: WebGLRenderer) {
    gameobject.three.renderer = renderer;
}