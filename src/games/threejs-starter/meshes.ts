import { BoxGeometry, Mesh } from "three";
import { utils } from "./utility/utility";
import { curvedshadermaterial, texture } from "./utility/materials";



export const meshlib = {
    buildings: () => {

        const geometry = new BoxGeometry();
        const material = curvedshadermaterial(texture.obstacle);
        const x = {
            mesh: {
                left_inner: { base: new Mesh(geometry, material.value) },
                left_outer: { base: new Mesh(geometry, material.value) },
                right_inner: { base: new Mesh(geometry, material.value) },
                right_outer: { base: new Mesh(geometry, material.value) }
            },
            material: material
        }

        utils.set.xyz(x.mesh.left_inner.base.position, -1.2, 0, .5);
        utils.set.xyz(x.mesh.left_outer.base.position, -1.2, 0, .5);
        utils.set.xyz(x.mesh.right_inner.base.position, 1.2, 0, .5);
        utils.set.xyz(x.mesh.right_outer.base.position, 1.2, 0, .5);

        return x;
    }



}