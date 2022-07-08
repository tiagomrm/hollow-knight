import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import {
    GodRaysCombineShader,
    GodRaysDepthMaskShader, GodRaysFakeSunShader,
    GodRaysGenerateShader
} from "three/examples/jsm/shaders/GodRaysShader";
import {EdgeDetectionMode, EffectPass, GodRaysEffect, KernelSize, SMAAEffect, SMAAPreset} from "postprocessing";
import {Mesh, MeshBasicMaterial, SphereBufferGeometry} from "three";

const godrayRenderTargetResolutionMultiplier = 1.0 / 6.0;

const bgColor = 0x000000;
const sunColor = 0xffee00;

export const Helper = {

    init: function (sceneElements) {
        sceneElements.clock = new THREE.Clock();

        // CAMERA
        sceneElements.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.01,
            700
        );
        sceneElements.camera.position.set(-30, 30, 250);

        // RENDERER
        sceneElements.renderer = new THREE.WebGLRenderer();
        sceneElements.renderer.setClearColor( 0xffffff );
        sceneElements.renderer.setPixelRatio( window.devicePixelRatio );
        sceneElements.renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById("canvas").append(sceneElements.renderer.domElement);
        sceneElements.renderer.shadowMap.enabled = true;

        sceneElements.renderer.autoClear = false;

        // USER CONTROLS
        sceneElements.controls = new OrbitControls(sceneElements.camera, sceneElements.renderer.domElement);
        sceneElements.controls.maxDistance = 350;
        sceneElements.controls.maxPolarAngle = Math.PI / 2;


        // PERFORMANCE STATS
        sceneElements.stats = new Stats();
        document.body.appendChild( sceneElements.stats.dom );

        sceneElements.sceneGraph = new THREE.Scene();
        sceneElements.controls.update();

        window.addEventListener( 'resize', () => this.resizeToWindowSize(sceneElements), false );
    },

    initPostprocessing: function ( sceneElements, renderTargetWidth, renderTargetHeight ) {

        sceneElements.postprocessing.scene = new THREE.Scene();

        sceneElements.postprocessing.camera = new THREE.OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
        sceneElements.postprocessing.camera.position.z = 100;

        sceneElements.postprocessing.scene.add( sceneElements.postprocessing.camera );

        sceneElements.postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight );

        sceneElements.postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight );
        sceneElements.postprocessing.rtTextureDepthMask = new THREE.WebGLRenderTarget( renderTargetWidth, renderTargetHeight );

        // The ping-pong render targets can use an adjusted resolution to minimize cost

        const adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
        sceneElements.postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight );
        sceneElements.postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( adjustedWidth, adjustedHeight );

        // god-ray shaders

        const godraysMaskShader = GodRaysDepthMaskShader;
        sceneElements.postprocessing.godrayMaskUniforms = THREE.UniformsUtils.clone( godraysMaskShader.uniforms );
        sceneElements.postprocessing.materialGodraysDepthMask = new THREE.ShaderMaterial( {

            uniforms: sceneElements.postprocessing.godrayMaskUniforms,
            vertexShader: godraysMaskShader.vertexShader,
            fragmentShader: godraysMaskShader.fragmentShader

        } );

        const godraysGenShader = GodRaysGenerateShader;
        sceneElements.postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
        sceneElements.postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

            uniforms: sceneElements.postprocessing.godrayGenUniforms,
            vertexShader: godraysGenShader.vertexShader,
            fragmentShader: godraysGenShader.fragmentShader

        } );

        const godraysCombineShader = GodRaysCombineShader;
        sceneElements.postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
        sceneElements.postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

            uniforms: sceneElements.postprocessing.godrayCombineUniforms,
            vertexShader: godraysCombineShader.vertexShader,
            fragmentShader: godraysCombineShader.fragmentShader

        } );

        const godraysFakeSunShader = GodRaysFakeSunShader;
        sceneElements.postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
        sceneElements.postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

            uniforms: sceneElements.postprocessing.godraysFakeSunUniforms,
            vertexShader: godraysFakeSunShader.vertexShader,
            fragmentShader: godraysFakeSunShader.fragmentShader

        } );

        sceneElements.postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
        sceneElements.postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

        sceneElements.postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.15;

        sceneElements.postprocessing.quad = new THREE.Mesh(
            new THREE.PlaneGeometry( 1.0, 1.0 ),
            sceneElements.postprocessing.materialGodraysGenerate
        );
        sceneElements.postprocessing.quad.position.z = - 9900;
        sceneElements.postprocessing.scene.add( sceneElements.postprocessing.quad );



    },

    resizeToWindowSize: function( sceneElements ) {
        const renderTargetWidth = window.innerWidth;
        const renderTargetHeight = window.innerHeight;

        sceneElements.camera.aspect = window.innerWidth / window.innerHeight;
        sceneElements.camera.updateProjectionMatrix();

        sceneElements.camera.aspect = renderTargetWidth / renderTargetHeight;
        sceneElements.camera.updateProjectionMatrix();

        sceneElements.renderer.setSize( renderTargetWidth, renderTargetHeight );
        sceneElements.postprocessing.rtTextureColors.setSize( renderTargetWidth, renderTargetHeight );
        sceneElements.postprocessing.rtTextureDepth.setSize( renderTargetWidth, renderTargetHeight );
        sceneElements.postprocessing.rtTextureDepthMask.setSize( renderTargetWidth, renderTargetHeight );

        const adjustedWidth = renderTargetWidth * godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = renderTargetHeight * godrayRenderTargetResolutionMultiplier;
        sceneElements.postprocessing.rtTextureGodRays1.setSize( adjustedWidth, adjustedHeight );
        sceneElements.postprocessing.rtTextureGodRays2.setSize( adjustedWidth, adjustedHeight );
    }
}
