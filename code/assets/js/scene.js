import * as THREE from 'three';
import { Helper } from "./helper.js";
import { Ambient } from "./ambient.js";
import * as KNIGHT from "./knight.js";

const sceneElements = {
    camera : null,
    sceneGraph : null,
    clock : null,
    renderer : null,
    controls: null,
    stats: null,
    composer: null,
    postprocessing: {
        godRays : {
            properties: {
                sunPosition: new THREE.Vector3( 500, 1000, 0 ),
                clipPosition:  new THREE.Vector4(),
                screenSpacePosition: new THREE.Vector3(),
                materialDepth: new THREE.MeshDepthMaterial()
            }
        },
        enabled: true
    }
}

const keyboardControls = {
    W: 0,
    A: 0,
    S: 0,
    D: 0
}

export function init() {

    Helper.init(sceneElements);

    // KNIGHT
    KNIGHT.knight.position.z = 20;
    sceneElements.sceneGraph.add(KNIGHT.knight);

    // AMBIENT
    sceneElements.sceneGraph.add(Ambient.createAmbient());

    // POSTPROCESSING
    Helper.initPostprocessing(sceneElements, window.innerWidth, window.innerHeight);
    Helper.resizeToWindowSize(sceneElements);

    animate();
}

export function render () {

    if ( sceneElements.postprocessing.enabled ) {

        const postprocessing = sceneElements.postprocessing;

        const sunPosition = sceneElements.postprocessing.godRays.properties.sunPosition;
        const clipPosition = sceneElements.postprocessing.godRays.properties.clipPosition;
        const screenSpacePosition = sceneElements.postprocessing.godRays.properties.screenSpacePosition;

        clipPosition.x = sunPosition.x;
        clipPosition.y = sunPosition.y;
        clipPosition.z = sunPosition.z;
        clipPosition.w = 1;

        clipPosition.applyMatrix4( sceneElements.camera.matrixWorldInverse ).applyMatrix4( sceneElements.camera.projectionMatrix );

        // perspective divide (produce NDC space)

        clipPosition.x /= clipPosition.w;
        clipPosition.y /= clipPosition.w;

        screenSpacePosition.x = ( clipPosition.x + 1 ) / 2; // transform from [-1,1] to [0,1]
        screenSpacePosition.y = ( clipPosition.y + 1 ) / 2; // transform from [-1,1] to [0,1]
        screenSpacePosition.z = clipPosition.z; // needs to stay in clip space for visibilty checks

        // Give it to the god-ray and sun shaders

        postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );
        postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( screenSpacePosition );

        // -- Draw sky and sun --

        // Clear colors and depths, will clear to sky color

        sceneElements.renderer.setRenderTarget( postprocessing.rtTextureColors );
        sceneElements.renderer.clear( true, true, false );

        // Sun render. Runs a shader that gives a brightness based on the screen
        // space distance to the sun. Not very efficient, so i make a scissor
        // rectangle around the suns position to avoid rendering surrounding pixels.

        const sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
        const sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

        screenSpacePosition.x *= window.innerWidth;
        screenSpacePosition.y *= window.innerHeight;

        sceneElements.renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
        sceneElements.renderer.setScissorTest( true );

        postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
        sceneElements.renderer.setRenderTarget( postprocessing.rtTextureColors );
        sceneElements.renderer.render( postprocessing.scene, postprocessing.camera );

        sceneElements.renderer.setScissorTest( false );

        // -- Draw scene objects --

        // Colors

        sceneElements.sceneGraph.overrideMaterial = null;
        sceneElements.renderer.setRenderTarget( postprocessing.rtTextureColors );
        sceneElements.renderer.render( sceneElements.sceneGraph, sceneElements.camera );

        // Depth

        sceneElements.sceneGraph.overrideMaterial = sceneElements.postprocessing.godRays.properties.materialDepth;
        sceneElements.renderer.setRenderTarget( postprocessing.rtTextureDepth );
        sceneElements.renderer.clear();
        sceneElements.renderer.render( sceneElements.sceneGraph, sceneElements.camera );

        //

        postprocessing.godrayMaskUniforms[ 'tInput' ].value = postprocessing.rtTextureDepth.texture;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysDepthMask;
        sceneElements.renderer.setRenderTarget( postprocessing.rtTextureDepthMask );
        sceneElements.renderer.render( postprocessing.scene, postprocessing.camera );

        // -- Render god-rays --

        // Maximum length of god-rays (in texture space [0,1]X[0,1])

        const filterLen = 1.0;

        // Samples taken by filter

        const TAPS_PER_PASS = 4.0;

        // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
        // would start with a small filter support and grow to large. however
        // the large-to-small order produces less objectionable aliasing artifacts that
        // appear as a glimmer along the length of the beams

        // pass 1 - render into first ping-pong target
        filterGodRays( postprocessing.rtTextureDepthMask.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );

        // pass 2 - render into second ping-pong target
        filterGodRays( postprocessing.rtTextureGodRays2.texture, postprocessing.rtTextureGodRays1, getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );

        // pass 3 - 1st RT
        filterGodRays( postprocessing.rtTextureGodRays1.texture, postprocessing.rtTextureGodRays2, getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );

        // final pass - composite god-rays onto colors

        postprocessing.godrayCombineUniforms[ 'tColors' ].value = postprocessing.rtTextureColors.texture;
        postprocessing.godrayCombineUniforms[ 'tGodRays' ].value = postprocessing.rtTextureGodRays2.texture;

        postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

        sceneElements.renderer.setRenderTarget( null );
        sceneElements.renderer.render( postprocessing.scene, postprocessing.camera );
        postprocessing.scene.overrideMaterial = null;

    } else {

        sceneElements.renderer.setRenderTarget( null );
        sceneElements.renderer.clear();
        sceneElements.renderer.render( sceneElements.sceneGraph, sceneElements.camera );

    }
}

function getStepSize( filterLen, tapsPerPass, pass ) {

    return filterLen * Math.pow( tapsPerPass, - pass );

}

function filterGodRays( inputTex, renderTarget, stepSize ) {

    sceneElements.postprocessing.scene.overrideMaterial = sceneElements.postprocessing.materialGodraysGenerate;

    sceneElements.postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
    sceneElements.postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;

    sceneElements.renderer.setRenderTarget( renderTarget );
    sceneElements.renderer.render( sceneElements.postprocessing.scene, sceneElements.postprocessing.camera );
    sceneElements.postprocessing.scene.overrideMaterial = null;

}

export function animate() {
    requestAnimationFrame(animate);

    sceneElements.stats.begin();

    const delta = sceneElements.clock.getDelta();

    Ambient.updateAnimationFrame(delta);

    if (KNIGHT.hasLoaded() && Object.values(keyboardControls).some(isPressed => isPressed)) {
        KNIGHT.moveHorizontally(
            sceneElements.camera.quaternion,
            delta,
            keyboardControls.D + keyboardControls.A,
            keyboardControls.S + keyboardControls.W
        );
    }

    render();

    sceneElements.stats.end();
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
