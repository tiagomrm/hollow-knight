<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script>
import * as THREE from 'three'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default {
  name: 'Canvas',
  data() {
    return {};
  },
  mounted() {
    this.init();
    window.addEventListener("resize", this.resizeToWindowSize, false);
    this.animate();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeToWindowSize, false)
  },
  methods: {
    init() {
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 10, 2000 );


      this.renderer = new THREE.WebGLRenderer();
      this.resizeToWindowSize();

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.maxDistance = 1600;

      this.camera.position.set( 0, 300, 700 );
      this.camera.lookAt( 0, 0, 0 );

      this.controls.update();


      let hlight = new THREE.DirectionalLight(0x404040,10);
      hlight.castShadow = true;

      this.scene.add(hlight);

      let directionalLight = new THREE.DirectionalLight(0xffffff,1);
      directionalLight.position.set(0,200,200);
      directionalLight.castShadow = true;
      this.scene.add(directionalLight);

      const helper = new THREE.DirectionalLightHelper( directionalLight, 10 );
      this.scene.add(helper)

      const geometry1 = new THREE.CircleGeometry( 400, 70 );
      const material1 = new THREE.MeshStandardMaterial( { color: 0xffff00 } );
      const plane = new THREE.Mesh( geometry1, material1 );
      plane.rotation.x = - Math.PI / 2;
      plane.receiveShadow = true;
      this.scene.add( plane );

      this.loadModel(this.scene, new GLTFLoader(), '/models/knight.gltf')

      this.renderer.render(this.scene, this.camera);
      this.$refs.canvas.append(this.renderer.domElement)
    },
    animate() {
      requestAnimationFrame( this.animate );
      this.renderer.render( this.scene, this.camera );
    },
    resizeToWindowSize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( window.innerWidth, window.innerHeight );
    },

    loadModel(scene, loader, modelPath) {
      loader.load(modelPath, function ( gltf ) {

        scene.add( gltf.scene );

      }, undefined, function ( error ) {

        console.error( error );

      });
    }
  }
}
</script>

<style scoped>
#canvas {
  height: 100vh;
  width: 100vw;
}
</style>