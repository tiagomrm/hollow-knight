import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export const Helper = {
    init: function (sceneElements) {
        sceneElements.sceneGraph = new THREE.Scene();
        sceneElements.clock = new THREE.Clock();

        // CAMERA
        sceneElements.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.01,
            700
        );

        // RENDERER
        sceneElements.renderer = new THREE.WebGLRenderer({antialias: false});
        sceneElements.renderer.setPixelRatio( window.devicePixelRatio );
        sceneElements.renderer.shadowMap.enabled = true;

        // USER CONTROLS
        sceneElements.controls = new OrbitControls(sceneElements.camera, sceneElements.renderer.domElement);
        sceneElements.controls.maxDistance = 350;
        sceneElements.controls.maxPolarAngle = Math.PI / 2;

        // PERFORMANCE STATS
        sceneElements.stats = new Stats();
        document.body.appendChild( sceneElements.stats.dom );

        sceneElements.sceneGraph.background = new THREE.Color().setHex(0x1a273b);
        sceneElements.sceneGraph.fog = new THREE.Fog(sceneElements.sceneGraph.background, 400, 700);

        sceneElements.camera.position.set(-30, 30, 250);
        sceneElements.camera.lookAt(0, 0, 0);

        sceneElements.controls.update();
    }
}