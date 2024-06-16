import { DoubleSide, ShaderMaterial, Texture, TextureLoader } from "three";
import { lerp } from "./lerp";

const textureloader = new TextureLoader();
export const texture = {
    floor: textureloader.load('https://static.vecteezy.com/system/resources/previews/025/466/041/original/cartoon-stone-pavement-seamless-pattern-brick-wall-texture-cracked-rock-paver-gray-street-tiles-top-view-vector.jpg'),//'https://static.vecteezy.com/system/resources/previews/001/339/603/non_2x/stone-brick-wall-seamless-texture-for-jungle-theme-vector.jpg'),
    obstacle: textureloader.load('https://st4.depositphotos.com/6615378/25088/v/450/depositphotos_250885572-stock-illustration-seamless-texture-of-green-stone.jpg')//'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnKHTeFEcrSJOf8CKWIGb1gcqD03VJ2n9HSA&s')
}

const shaders = {
    sintexture: {
        vertex: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
        `, fragment: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float curveAmount;
        
        void main() {
            vec2 uv = vUv;
            uv.x = uv.x + curveAmount * sin(uv.y * 10.0);
            vec4 color = texture2D(uTexture, uv);
            gl_FragColor = color;
        }
        `
    },
    sinvertex: {
        vertex: `
        uniform float amplitude; // Amount of displacement
        uniform float frequency; // Frequency of displacement

        void main() {
            vec3 newPosition = position; // Initialize the new position
            
            // Apply displacement in the direction perpendicular to the surface
            newPosition.z += amplitude * sin(position.y * frequency);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0); // Set the new position
        }
        `
        , fragment: `
        uniform sampler2D texture; // Texture uniform

        void main() {
            vec4 texColor = texture2D(texture, vec2(1.0 - gl_PointCoord.x, 1.0 - gl_PointCoord.y)); // Fetch texture color
            gl_FragColor = texColor; // Output texture color
        }`
    }, test1: {
        vertex: `   
        uniform float rollAmount;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            vUv = uv;

            // Identify top and bottom faces
                float angle = position.x * rollAmount;
                float radius = 1.0 / rollAmount;

                // Transform the position into cylindrical coordinates
                vec3 transformedPosition = position;
                transformedPosition.x = radius * sin(angle);
                transformedPosition.z = radius * cos(angle) - radius;
            
                // Preserve the thickness by offsetting along the normal
                vec3 offset = normal * (1.0 / rollAmount);
                transformedPosition += offset;


            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
        }
        `,
        fragment: `
        uniform sampler2D texturex;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(texturex, vUv);
        }
      `
    }, curvedworld: {
        vertex: `
        varying vec2 vUv;
        uniform float curvx;
        uniform float curvy;
        uniform float curvz;

        void main() {
            vUv = uv;

            // Adjust the amount of curvature
            float curveAmount = 0.001;

            // Transform the position to world space
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);

            // Calculate the distance from the world origin in the YZ plane
            float distance = length(worldPosition.yz);
            float offset = curveAmount * distance * distance;

            // Apply the offset to the x position to create a curve
            worldPosition.x += offset * curvx;
            worldPosition.y += offset * curvy;
            worldPosition.z += offset * curvz;

            // Transform the position back to view space and then to clip space
            vec4 viewPosition = viewMatrix * worldPosition;
            gl_Position = projectionMatrix * viewPosition;
        }
        `,
        fragment: `
        uniform sampler2D texturex;
        varying vec2 vUv;
        
        void main() {
            gl_FragColor = texture2D(texturex, vUv);
        }`
    }
}

export const curvedshadermaterial = (texture: Texture) => {
    const mat = new ShaderMaterial({
        wireframe: false,
        // side: DoubleSide,
        vertexShader: shaders.curvedworld.vertex,
        fragmentShader: shaders.curvedworld.fragment,
        uniforms: {
            texturex: { value: texture }, // Your texture goes here
            curvx: { value: 1 },
            curvy: { value: 1 },
            curvz: { value: 2 },
        }
    })
    return {
        value: mat,
        updatecurv: {
            x: (value: number) => {
                mat.uniforms.curvx.value = value;
            },
            y: (value: number) => {
                mat.uniforms.curvy.value = value;
            },
            z: (value: number) => {
                mat.uniforms.curvz.value = value;
            },
            all: (x: number, y: number, z: number) => {
                mat.uniforms.curvx.value = x;
                mat.uniforms.curvx.value = y;
                mat.uniforms.curvx.value = z;
            }
        },
    }
}


