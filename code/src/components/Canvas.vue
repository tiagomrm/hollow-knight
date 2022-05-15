<template>
  <div id="canvas" ref="canvas"></div>
</template>

<script>
import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as KNIGHT from '../../assets/js/knight.js';

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
      fireflies: []
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
      this.scene.fog = new THREE.Fog(this.scene.background, 400, 1000);

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


      for (let i = 0; i<= 70; i++) {
        this.createRandomFirefly();
      }

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


      const pillar = new THREE.Object3D();
      this.createPillar(pillar, 0x183944);
      pillar.castShadow = true;
      pillar.position.x = 70
      pillar.position.z = 60
      this.scene.add(pillar);


      this.scene.add(KNIGHT.knight)

      const points = [];

      for (let i = 0; i < 6; i++) {
        points.push(new THREE.Vector3( - 60 + 0.015 * Math.exp(i), i * 4.2, 60 + 0.015 * Math.exp(i) ))
      }

      const closedSpline = new THREE.CatmullRomCurve3( points);

      closedSpline.curveType = 'catmullrom';
      closedSpline.closed = false;

      const extrudeSettings1 = {
        steps: 10,
        bevelEnabled: false,
        extrudePath: closedSpline
      };


      const pts1 = [], count = 3;

      for ( let i = 0; i < count; i ++ ) {
        const l = 0.5;
        const a = 2 * i / count * Math.PI;
        pts1.push( new THREE.Vector2( Math.cos( a ) * l, Math.sin( a ) * l ) );

      }

      const shape1 = new THREE.Shape( pts1 );

      const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );

      const material1 = new THREE.MeshToonMaterial( { color: 0x233f40, wireframe: false } );

      const mesh1 = new THREE.Mesh( geometry1, material1 );


      this.scene.add( mesh1 );

      this.renderer.render(this.scene, this.camera);
      this.$refs.canvas.append(this.renderer.domElement)
    },

    createRandomFirefly() {
      const trignometricFuncts = [Math.cos, Math.sin]
      const sphere = new THREE.SphereGeometry( 1, 16, 8 );

      const particle = new THREE.PointLight( 0x80ff80, 1, 4 );
      const sphereMesh =  new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xeaffb9, transparent: true, opacity: 0.8 } ) );
      particle.add(sphereMesh);
      this.scene.add( particle );

      const alphaX = Math.random() * 0.6 + 0.1
      const alphaY = Math.random() * 0.6 + 0.1
      const alphaZ = Math.random() * 0.6 + 0.1
      const funcX = Math.floor(Math.random())
      const funcY = Math.floor(Math.random())
      const funcZ = Math.floor(Math.random())
      const offsetX = Math.random() * 700 - 350
      const offsetY = Math.random() * 30 + 45
      const offsetZ = Math.random() * 700 - 350

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

    animate() {

      this.renderAnimation();

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