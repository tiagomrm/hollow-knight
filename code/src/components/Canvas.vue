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
    return {
      keys: {
        W: {
          pressed: 0,
          angleTo: 0
        },
        A: {
          pressed: 0,
          angleTo: Math.PI/2
        },
        S: {
          pressed: 0,
          angleTo: Math.PI
        },
        D: {
          pressed: 0,
          angleTo: 3 * Math.PI/2
        },
      }
    };
  },

  async mounted() {
    // 1. add event listeners
    // 2. initialize scene and geometries
    // 3. animate
    window.addEventListener('resize', this.resizeToWindowSize, false);
    document.addEventListener('keydown', this.onDocumentKeyDown, false);
    document.addEventListener('keyup', this.onDocumentKeyUp, false);
    this.init();
    this.animate();
  },

  beforeUnmount() {
    // remove event listeners
    window.removeEventListener('resize', this.resizeToWindowSize, false)
    document.removeEventListener('keydown', this.onDocumentKeyDown, false);
    document.removeEventListener('keyup', this.onDocumentKeyUp, false);
  },

  methods: {
    init() {
      this.scene = new THREE.Scene();

      this.scene.background = new THREE.Color().setHex(0x1a273b);
      this.scene.fog = new THREE.Fog(this.scene.background, 800, 1000);

      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 30, 2000);


      this.renderer = new THREE.WebGLRenderer();
      this.renderer.shadowMap.enabled = true;
      this.resizeToWindowSize();

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.maxDistance = 500;
      this.controls.maxPolarAngle = Math.PI / 2;


      this.camera.position.set(0, 300, 700);
      this.camera.lookAt(0, 0, 0);

      this.controls.update();


      let hemiLight = new THREE.HemisphereLight(0xa1f2db, 0x3f7675, 0.9);
      hemiLight.position.set(0, 80, 0)
      const helper1 = new THREE.HemisphereLightHelper(hemiLight, 10);


      this.scene.add(hemiLight);
      this.scene.add(helper1);

      let spotLight = new THREE.SpotLight(0xffffff, 0.9, 125, 0.5, 1,1);
      spotLight.position.set(0, 100, 50);
      spotLight.castShadow = true;
      this.scene.add(spotLight);

      const helper = new THREE.SpotLightHelper(spotLight, 10);
      this.scene.add(helper)

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({
        color: 0x999999
      }));
      mesh.rotation.x = - Math.PI / 2;
      mesh.receiveShadow = true;
      mesh.material.side = THREE.DoubleSide;

      this.scene.add(mesh);


      this.loadModel(new GLTFLoader(), '/models/knight.gltf');


      this.renderer.render(this.scene, this.camera);
      this.$refs.canvas.append(this.renderer.domElement)

    },

    animate() {

      if (this.knight !== undefined) {
        const vector = new THREE.Vector3( 0, 0, - 1 );

        vector.applyQuaternion( this.camera.quaternion );
        vector.y = 0;
        vector.normalize();

        let angle = 0;
        let numKeysPressed = 0;


        const axis = new THREE.Vector3( 0, 1, 0 );

        const dirVector = vector.clone();



        // console.log(this.knight.quaternion.angleTo(this.camera.quaternion) * (180.0 / Math.PI))

        for (const [, value] of Object.entries(this.keys)) {
          if (!value.pressed)
            continue

          angle += value.angleTo;
          numKeysPressed++;
        }

        if (numKeysPressed > 0) {
          angle = (angle + this.keys.D.pressed * this.keys.W.pressed * 2 * Math.PI) / numKeysPressed;

          this.knight.rotation.y = angle + Math.PI;

          this.knight.translateZ(0.6);
        }


      }

      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(this.animate);
    },

    resizeToWindowSize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    loadModel(loader, modelPath ) {
      let vm = this;
      loader.load(modelPath, function (gltf) {
        gltf.scene.traverse(function (node) {
          if (node.type === 'Mesh') node.castShadow = true;
        });

        vm.knight = gltf.scene;
        vm.scene.add(vm.knight)
        console.log(vm.knight)
      }, undefined, function (error) {

        console.error(error);

      });
    },

    onDocumentKeyDown(event) {
      switch (event.keyCode) {
        case 68: //d
          this.keys.D.pressed = 1;
          break;
        case 83: //s
          this.keys.S.pressed = 1;
          break;
        case 65: //a
          this.keys.A.pressed = 1;
          break;
        case 87: //w
          this.keys.W.pressed = 1;
          break;
      }
    },
    onDocumentKeyUp(event) {
      switch (event.keyCode) {
        case 68: //d
          this.keys.D.pressed = 0;
          break;
        case 83: //s
          this.keys.S.pressed = 0;
          break;
        case 65: //a
          this.keys.A.pressed = 0;
          break;
        case 87: //w
          this.keys.W.pressed = 0;
          break;
      }
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