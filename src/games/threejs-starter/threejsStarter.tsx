import React, { useEffect, useRef, useState } from "react";
import { WebGLRenderer } from "three";
import { creategame_test2 } from "./test-2";
import { creategame_doodlejump } from "./doodlejump";
import { shadertest } from "./shadertest";

const renderer = new WebGLRenderer({ alpha: true });

export default function ThreejsStarter() {
    const ref = useRef(null!);
    const [stats, setstats] = useState('score:');
    const [gameover, setgameover] = useState(true);
    const [game, setgame] = useState<any>({ action: { restart: () => { } } });

    useEffect(() => {
        const mount: HTMLDivElement = ref.current;
        renderer.setSize(400, 400);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        mount.append(renderer.domElement);
        const game = creategame_test2(renderer, [setstats, setgameover]);
        setgame(game);
        return () => {
            mount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <> <div className="pos-absolute">{stats}
        {gameover && <div>
            <button onClick={() => game.action.restart()}>restart</button>
        </div>}
    </div>
        <div className="canvas-container" ref={ref}></div>
    </>
}

function Game(setters: Array<any>) {
    const game = creategame_test2(renderer, setters);
    return [renderer, game];
}