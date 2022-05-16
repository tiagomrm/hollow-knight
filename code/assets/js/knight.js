import * as THREE from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


const MOVEMENT_SPEED = 0.8;

export let knight = new THREE.Object3D();
getKnight();


export function hasLoaded() {
    return knight !== undefined;
}

export function moveHorizontally(x, z, camera) {

    // calculate the direction of the knight in relation to the cam
    let camDirVector = new THREE.Vector3(x, 0, z).applyQuaternion(camera.quaternion);
    camDirVector.y = 0;
    camDirVector.normalize();

    camDirVector.add(knight.position);

    knight.lookAt(camDirVector)

    // move in that direction
    knight.translateZ(MOVEMENT_SPEED);

}

function getKnight() {
    (new GLTFLoader()).load('/models/knight.gltf', function (gltf) {
        gltf.scene.traverse(function (node) {
            node.frustumCulled = false;
            if (node.type === 'SkinnedMesh') {
                node.castShadow = true;
                node.receiveShadow = true;
                let color = node.material.color;
                node.material = new THREE.MeshToonMaterial({color: color});
            }
        });

        knight.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });
}
