import * as THREE from 'three'
import { Helper } from "./helper.js";
import { Ambient } from "./ambient.js";
import * as KNIGHT from "./knight.js";
import {DDSLoader} from "three/examples/jsm/loaders/DDSLoader";
import {TextureLoader} from "three";

const sceneElements = {
    camera : null,
    sceneGraph : null,
    clock : null,
    renderer : null,
    controls: null,
    stats: null
};

const keyboardControls = {
    W: 0,
    A: 0,
    S: 0,
    D: 0
}

export function init() {

    Helper.init(sceneElements);
    resizeToWindowSize();

    // CIRCLE PLANE
    const geometry = new THREE.CircleGeometry( 350, 16 );
    const material = new THREE.MeshToonMaterial( { color: 0x999999 } );
    const circle = new THREE.Mesh( geometry, material );
    circle.rotation.x = - Math.PI/2;
    sceneElements.sceneGraph.add( circle );

    // ILLUMINATION
    const hemiLight = new THREE.HemisphereLight(0xa1f2db, 0x3f7675, 0.4);
    hemiLight.position.set(0, 80, 0)
    sceneElements.sceneGraph.add( hemiLight );

    const pointBlueLight = new THREE.PointLight( 0x3fa6c1, 2, 200, 4 );
    pointBlueLight.position.set(0, 50, 0)
    sceneElements.sceneGraph.add( pointBlueLight );

    let spotLight = new THREE.SpotLight(0xffffff, 2, 220, 0.5, 1,1);
    spotLight.position.set(0, 200, 50);
    spotLight.castShadow = true;
    sceneElements.sceneGraph.add( spotLight );


    const leafyPositions = [
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: 0,            position: {x: -100, y:0, z:0}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: Math.PI,      position: {x: -50,  y:0, z:0}},
        {scale: {x:1.3, y:1.5, z:1.3},  rotation: - Math.PI/6,  position: {x: -40,  y:0, z:-10}},
        {scale: {x:1,   y:1.2, z:1},    rotation: Math.PI,      position: {x: -30,  y:0, z:-20}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: - Math.PI/6,  position: {x: 70,   y:0, z:0}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: Math.PI,      position: {x: 105,  y:0, z:20}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: 0,            position: {x: 125,  y:0, z:10}},
        {scale: {x:1,   y:1.2, z:1},    rotation: Math.PI,      position: {x: 145,  y:0, z:0}},
    ];

    for (const leafyBladeState of leafyPositions)
        sceneElements.sceneGraph.add(
            Ambient.createLeafyBlade(leafyBladeState.position, leafyBladeState.rotation, leafyBladeState.scale)
        );

    // FLYING PARTICLES
    const randomParticles = new THREE.Object3D();
    for (let i = 0; i<= 30; i++) {
        randomParticles.add(Ambient.createRandomFirefly());
    }
    sceneElements.sceneGraph.add(randomParticles);


    // PILLARS
    const pillar = Ambient.createPillar(0x183944);
    pillar.castShadow = true;
    pillar.position.x = 70
    pillar.position.z = 60
    sceneElements.sceneGraph.add( pillar );

    const clone = pillar.clone(true);
    clone.position.x = -70;
    clone.position.z = 0;
    sceneElements.sceneGraph.add( clone );

    // KNIGHT
    KNIGHT.knight.position.z = 20;
    sceneElements.sceneGraph.add(KNIGHT.knight)

    // BENCH
    sceneElements.sceneGraph.add(Ambient.createBench());

    const sphereGeometry = new THREE.SphereGeometry(
        15,
        32,
        16,
        undefined,
        undefined,
        undefined,
        Math.PI / 2
    );

    // BUSH
    const bush = Ambient.createBush();

    bush.position.z = -60;
    sceneElements.sceneGraph.add(bush);


    render();
}

export function render () {
    sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    document.getElementById("canvas").append(sceneElements.renderer.domElement);
}

export function animate() {
    sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
    requestAnimationFrame(animate);

    const delta = sceneElements.clock.getDelta();

    sceneElements.stats.update();

    Ambient.updateAnimationFrame(delta);

    if (KNIGHT.hasLoaded()) {
        // if any key is being pressed
        if (Object.values(keyboardControls).some(isPressed => isPressed)) {
            KNIGHT.moveHorizontally(
                sceneElements.camera.quaternion,
                delta,
                keyboardControls.D + keyboardControls.A,
                keyboardControls.S + keyboardControls.W
            );
        }
    }
}

export function resizeToWindowSize() {
    sceneElements.camera.aspect = window.innerWidth / window.innerHeight;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function onDocumentKeyDown (event) {
    switch (event.keyCode) {
        case 68: //d
            keyboardControls.D = 1;
            break;
        case 83: //s
            keyboardControls.S = 1;
            break;
        case 65: //a
            keyboardControls.A = -1;
            break;
        case 87: //w
            keyboardControls.W = -1;
            break;
    }
}
export function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            keyboardControls.D = 0;
            break;
        case 83: //s
            keyboardControls.S = 0;
            break;
        case 65: //a
            keyboardControls.A = 0;
            break;
        case 87: //w
            keyboardControls.W = 0;
            break;
    }
}
