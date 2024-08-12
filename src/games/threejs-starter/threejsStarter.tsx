import React, { useEffect, useRef, useState } from "react";
import { WebGLRenderer } from "three";
import { creategame_test2 } from "./test-2";
import { creategame_doodlejump } from "./doodlejump";
import { shadertest } from "./shadertest";

export default function ThreejsStarter() {
    const ref = useRef(null!);
    const [stats, setstats] = useState('score:');
    useEffect(() => {
        const mount: HTMLDivElement = ref.current;
        const renderer = Game(setstats);
        renderer.setSize(400, 400)
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        mount.append(renderer.domElement);
        return () => {
            mount.removeChild(renderer.domElement);
            renderer.dispose()
        };
    }, [])

    return <> <div className="pos-absolute">{stats}</div>
        <div className="canvas-container" ref={ref}></div>
    </>
}

function Game(setstats) {
    const renderer = new WebGLRenderer({ alpha: true });

    const game = creategame_test2(renderer, setstats);

    return renderer;
}