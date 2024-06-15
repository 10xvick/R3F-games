import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from "three";
import { events, utils } from "./utility/utility";
import TWEEN, { Easing, Tween } from "@tweenjs/tween.js";
import { ease, lerp, tween } from "./utility/lerp";
import { curvedShaderMaterial, texture } from "./utility/materials";

export function shadertest(renderer: WebGLRenderer) {
    initializegameobjects(renderer);
    return logics();
}

function logics() {
    const d = gameobject;
    const geometry = new BoxGeometry(10, 10, 10, 10);
    const material = new MeshBasicMaterial({ color: 0x00fff0 });
    const { camera } = d.three;

    const floor = new Mesh(geometry, curvedShaderMaterial);
    camera.position.y = 20;
    camera.lookAt(floor.position)

    d.three.scene.add(floor);

    let mouseon: MouseEvent | null = null;
    let dragx = 0;
    let dragy = 0;
    addEventListener('mousedown', (e: MouseEvent) => {
        mouseon = e;
    })

    addEventListener('mouseup', () => {
        mouseon = null;
    })

    addEventListener('mousemove', (e) => {
        if (mouseon) {
            dragx += e.screenX - mouseon.screenX;
            dragy += e.screenY - mouseon.screenY;
        }
    })

    events.lifecycle.createRenderLoop(40)(delta => {
        d.three.renderer.render(d.three.scene, d.three.camera)
        if (mouseon) {
            floor.rotation.x = Math.PI * (dragy) / 10000;
            floor.rotation.y = Math.PI * (dragx) / 10000;
            // floor.rotation.y = lerp(floor.rotation.y, Math.PI * (dragy / 1000 + floor.rotation.y), 0.5)
        }
    })
}


const gameobject = {
    three: {
        renderer: {} as WebGLRenderer,
        scene: new Scene(),
        camera: new PerspectiveCamera(75, 1, 0.1, 10000),
    },
    game: {
        score: 0,
        speed: 60,
        gravity: 150,
        takeinput: true,
    },
    level: {
        floors: []
    },
    player: {
        scale: { x: 10, y: 15 },
        mesh: new Mesh,
        floor: null,
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
