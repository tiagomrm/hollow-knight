<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as KNIGHT from '../../assets/js/knight.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import Stats from "three/examples/jsm/libs/stats.module";

export default {
  name: 'Canvas',
  data() {
    return {
      keys: {
        W: 0,
        A: 0,
        S: 0,
        D: 0
      },
      fireflies: [],
      animationMixers: []
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
      // initial configuration
      this.scene = new THREE.Scene();
      this.clock = new THREE.Clock();

      // CAMERA
      this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 700);
      // RENDERER
      this.renderer = new THREE.WebGLRenderer({antialias: false});
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.renderer.shadowMap.enabled = true;
      this.resizeToWindowSize();

      // USER CONTROLS
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.maxDistance = 350;
      this.controls.maxPolarAngle = Math.PI / 2;

      // PERFORMANCE STATS
      this.stats = new Stats();
      document.body.appendChild( this.stats.dom );

      this.scene.background = new THREE.Color().setHex(0x1a273b);
      this.scene.fog = new THREE.Fog(this.scene.background, 400, 700);


      this.camera.position.set(-30, 30, 250);
      this.camera.lookAt(0, 0, 0);

      this.controls.update();


      let hemiLight = new THREE.HemisphereLight(0xa1f2db, 0x3f7675, 0.4);
      hemiLight.position.set(0, 80, 0)

      const pointBlueLight = new THREE.PointLight( 0x3fa6c1, 2, 200, 4 );
      pointBlueLight.position.set(0, 50, 0)
      this.scene.add( pointBlueLight );


      for (let i = 0; i<= 30; i++) {
        this.createRandomFirefly();
      }

      this.scene.add(hemiLight);

      let spotLight = new THREE.SpotLight(0xffffff, 2, 220, 0.5, 1,1);
      spotLight.position.set(0, 200, 50);
      spotLight.castShadow = true;
      this.scene.add(spotLight);

      const geometry = new THREE.CircleGeometry( 350, 16 );
      const material = new THREE.MeshToonMaterial( { color: 0x999999 } );
      const circle = new THREE.Mesh( geometry, material );
      circle.rotation.x = - Math.PI/2;
      this.scene.add( circle );


      const pillar = new THREE.Object3D();
      this.createPillar(pillar, 0x183944);
      pillar.castShadow = true;
      pillar.position.x = 70
      pillar.position.z = 60
      this.scene.add(pillar);

      const clone = pillar.clone();
      clone.position.x = -70;
      clone.position.z = 0;
      this.scene.add(clone);


      KNIGHT.knight.position.z = 20;

      this.scene.add(KNIGHT.knight)

      let vm = this;



      const leafyPositions = [
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: 0,            position: {x: -100, y:0, z:0}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: Math.PI,      position: {x: -50,  y:0, z:0}},
        {scale: {x:1.3, y:1.5, z:1.3},  rotation: - Math.PI/6,  position: {x: -40,  y:0, z:-10}},
        {scale: {x:1, y:1.2, z:1},      rotation: Math.PI,      position: {x: -30,  y:0, z:-20}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: - Math.PI/6,  position: {x: 70,   y:0, z:0}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: Math.PI,      position: {x: 105,  y:0, z:20}},
        {scale: {x:1.3, y:1.6, z:1.3},  rotation: 0,            position: {x: 125, y:0, z:10}},
        {scale: {x:1, y:1.2, z:1},      rotation: Math.PI,      position: {x: 145,  y:0, z:0}},
      ];

      for (const leafyblade of leafyPositions)
        this.addLeafyBlade(leafyblade.position, leafyblade.rotation, leafyblade.scale);

      (new GLTFLoader()).load('/models/ambient/bench.glb', function (gltf) {
        gltf.scene.traverse(function (node) {
          node.frustumCulled = false;
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            node.material = new THREE.MeshToonMaterial({color: 0X0d1f34});
          }
        });

        vm.scene.add(gltf.scene)
      }, undefined, function (error) {
        console.error(error);
      });

      this.renderer.render(this.scene, this.camera);
      this.$refs.canvas.append(this.renderer.domElement)
    },

    createRandomFirefly() {
      const trignometricFuncts = [Math.cos, Math.sin]
      const sphere = new THREE.SphereGeometry( 1, 6, 6 );

      const particle = new THREE.PointLight( 0x80ff80, 1, 3 );
      const sphereMesh =  new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xeaffb9, transparent: true, opacity: 0.8 } ) );
      particle.add(sphereMesh);
      this.scene.add( particle );

      const alphaX = Math.random() * 0.6 + 0.1
      const alphaY = Math.random() * 0.6 + 0.1
      const alphaZ = Math.random() * 0.6 + 0.1
      const funcX = Math.floor(Math.random())
      const funcY = Math.floor(Math.random())
      const funcZ = Math.floor(Math.random())
      const offsetX = Math.random() * 500 - 250
      const offsetY = Math.random() * 30 + 45
      const offsetZ = Math.random() * 500 - 250

      this.fireflies.push({
        object: particle,
        movement: {
          x: function (time) {
            return trignometricFuncts[funcX]( time * alphaX ) * 30 + offsetX;
          },
          y: function (time) {
            return trignometricFuncts[funcY]( time * alphaY ) * 30 + offsetY;
          },
          z: function (time) {
            return trignometricFuncts[funcZ]( time * alphaZ ) * 30 + offsetZ;
          }
        }
      });
    },

    createPillar(object3D, color) {

      const material = new THREE.MeshToonMaterial( {color: color} );


      const cylinderGeometry = new THREE.CylinderGeometry( 8, 8, 40, 32 );
      const cylinder = new THREE.Mesh( cylinderGeometry, material );
      cylinder.position.y = 20;
      cylinder.castShadow = true;
      cylinder.receiveShadow = true;

      const torusGeometry = new THREE.TorusGeometry( 7.5, 1.5, 16, 100 );
      const torus = new THREE.Mesh( torusGeometry, material );
      torus.rotation.x = Math.PI / 2;
      torus.position.y = 40;
      torus.castShadow = true;
      torus.receiveShadow = true;

      const sphereGeometry = new THREE.SphereGeometry( 8.5, 20, 20, 0, 6.3, 2, 1.2 );
      const sphere = new THREE.Mesh( sphereGeometry, material );
      sphere.rotation.x = Math.PI;
      sphere.position.y = 37.5;
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      object3D.add( torus );
      object3D.add( cylinder );
      object3D.add( sphere );
    },

    addLeafyBlade(position, rotation, scale) {
      const vm = this;
      (new GLTFLoader()).load('/models/ambient/leafyblade.glb', function (gltf) {
        const obj = {
          scene: gltf.scene,
          animations: gltf.animations
        };

        obj.scene.scale.set(scale.x, scale.y, scale.z);
        obj.scene.position.set(position.x, position.y, position.z);
        obj.scene.rotation.y = rotation

        let mixer = new THREE.AnimationMixer(obj.scene);
        mixer.clipAction(obj.animations[0]).play();
        vm.animationMixers.push(mixer);

        vm.scene.add(obj.scene);

      }, undefined, function (error) {
        console.error(error);
      });
    },

    animate() {

      this.renderAnimation();
      const delta = this.clock.getDelta();

      this.stats.update()

      this.animationMixers.forEach(mixer => {
        if (mixer) mixer.update(delta)
      });

      const time = Date.now() * 0.0005;

      for (const firefly of this.fireflies) {
        firefly.object.position.x = firefly.movement.x(time);
        firefly.object.position.y = firefly.movement.y(time);
        firefly.object.position.z = firefly.movement.z(time);
      }

      if (KNIGHT.hasLoaded()) {
        // if any key is being pressed
        if (Object.values(this.keys).some(isPressed => isPressed)) {

          KNIGHT.moveHorizontally(
              this.keys.D + this.keys.A * - 1,
              this.keys.S + this.keys.W * - 1,
              this.camera
          );
        }


      }
    },

    renderAnimation() {
      this.renderer.render(this.scene, this.camera);

      requestAnimationFrame(this.animate);
    },

    resizeToWindowSize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    onDocumentKeyDown(event) {
      switch (event.keyCode) {
        case 68: //d
          this.keys.D = 1;
          break;
        case 83: //s
          this.keys.S = 1;
          break;
        case 65: //a
          this.keys.A = 1;
          break;
        case 87: //w
          this.keys.W = 1;
          break;
      }
    },
    onDocumentKeyUp(event) {
      switch (event.keyCode) {
        case 68: //d
          this.keys.D = 0;
          break;
        case 83: //s
          this.keys.S = 0;
          break;
        case 65: //a
          this.keys.A = 0;
          break;
        case 87: //w
          this.keys.W = 0;
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