import { ShaderMaterial, TextureLoader } from "three";

// Vertex shader
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
`;

// Fragment shader
const fragmentShader = `
varying vec2 vUv;
uniform sampler2D texture;
uniform float curveAmount;

void main() {
    vec2 uv = vUv;
    uv.x = uv.x + curveAmount * sin(uv.y * 10.0);
    vec4 color = texture2D(texture, uv);
    gl_FragColor = color;
}
`;

const textureloader = new TextureLoader();
export const texture = textureloader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY1v_bA1tNL2TrOx2LTLublMxF5BuSr6alHw&s')
// Create a Three.js ShaderMaterial
export const curvedShaderMaterial = new ShaderMaterial({
    uniforms: {
        texture: { value: texture },
        curveAmount: { value: 0.5 } // Adjust this value to control the curvature
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

