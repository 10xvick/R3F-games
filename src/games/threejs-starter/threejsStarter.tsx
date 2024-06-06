import React, { useEffect, useRef } from "react";
import { WebGLRenderer } from "three";
import { creategame_test1 } from "./game-test1";

export default function ThreejsStarter() {
    const ref = useRef(null!);
    useEffect(() => {
        const mount: HTMLDivElement = ref.current;
        const renderer = Game();
        renderer.setSize(200, 200)
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        mount.append(renderer.domElement);
        return () => {
            mount.removeChild(renderer.domElement);
            renderer.dispose()
        };
    }, [])

    return <div className="canvas-container" ref={ref}></div>
}

function Game() {
    const renderer = new WebGLRenderer({ alpha: true });

    const game = creategame_test1(renderer);

    return renderer;
}