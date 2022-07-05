import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Vector2} from "three";

export const Ambient = {
    fireflyMovement: [],

    animationMixers: [],

    createRandomFirefly: function() {
        const trigonometricFuncts = [Math.cos, Math.sin]

        const sphere = new THREE.SphereGeometry( 1, 5, 5 );
        const particle = new THREE.PointLight( 0x80ff80, 1, 3 );
        const sphereMesh =  new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xeaffb9, transparent: true, opacity: 0.8 } ) );
        particle.add(sphereMesh);

        const alphaX = Math.random() * 0.6 + 0.1
        const alphaY = Math.random() * 0.6 + 0.1
        const alphaZ = Math.random() * 0.6 + 0.1
        const funcX = Math.floor(Math.random())
        const funcY = Math.floor(Math.random())
        const funcZ = Math.floor(Math.random())
        const offsetX = Math.random() * 500 - 250
        const offsetY = Math.random() * 30 + 45
        const offsetZ = Math.random() * 500 - 250

        this.fireflyMovement.push({
            object: particle,
            movement: {
                x: function (time) {
                    return trigonometricFuncts[funcX]( time * alphaX ) * 30 + offsetX;
                },
                y: function (time) {
                    return trigonometricFuncts[funcY]( time * alphaY ) * 30 + offsetY;
                },
                z: function (time) {
                    return trigonometricFuncts[funcZ]( time * alphaZ ) * 30 + offsetZ;
                }
            }
        });

        return particle;
    },

    updateAnimationFrame(delta) {
        this.updateAnimationMixers(delta);

        const time = Date.now() * 0.0005;
        this.updateFirefliesPositioningForClockDelta(time)
    },

    updateFirefliesPositioningForClockDelta: function (delta) {
        for (const firefly of this.fireflyMovement) {
            firefly.object.position.set(
                firefly.movement.x(delta),
                firefly.movement.y(delta),
                firefly.movement.z(delta),
            )
        }
    },

    createPillar(color) {

        const object3D = new THREE.Object3D();

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

        return object3D;
    },

    createBench() {
        const bench = new THREE.Object3D();
        (new GLTFLoader()).load('/models/ambient/bench.glb', function (gltf) {
            gltf.scene.traverse(function (node) {
                node.frustumCulled = false;
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.material = new THREE.MeshToonMaterial({color: 0X0d1f34});
                }
            });
            bench.add(gltf.scene)
        }, undefined, function (error) {
            console.error(error);
        });
        return bench;
    },

    createBush() {
        function init() {
            const texture = new THREE.TextureLoader().load( "textures/ambient/bush/cut-leaves.png");
            texture.rotation = Math.PI / 2;
            texture.center = new Vector2(0.5, 0.5);

            const bumpMap = new THREE.TextureLoader().load( "textures/ambient/bush/cut-leaves-bump.png" );
            bumpMap.rotation = Math.PI / 2;
            bumpMap.center = new Vector2(0.5, 0.5);

            self.planeGeometry = new THREE.PlaneBufferGeometry( 30, 30 );
            self.planeMaterial = new THREE.MeshToonMaterial({
                map: texture,
                bumpMap: bumpMap,
                side: THREE.DoubleSide,
                transparent: false,
                alphaTest: 0.5
            });

            self.planeGeometry.attributes.position.array[2] = 2;
            self.planeGeometry.attributes.position.array[11] = 2;

            self.planeGeometry.rotateZ(- Math.PI / 4);
            self.planeGeometry.translate(0, 15, 0);

        }

        function createFoliage(quantity=80, destination=new THREE.Object3D()) {
            const foliageGeometry = self.planeGeometry.clone();

            foliageGeometry.translate(0, 0, -3);
            foliageGeometry.rotateX( Math.random() * Math.PI / 2 - Math.PI / 3 );
            foliageGeometry.rotateY( Math.random() * Math.PI * 2);

            const leaves = new THREE.Mesh( foliageGeometry, self.planeMaterial );
            leaves.castShadow = true;
            leaves.receiveShadow = true;

            destination.add(leaves);

            if (--quantity > 0)
                return createFoliage(quantity, destination);

            return destination;
        }

        const self = this;
        init();
        return createFoliage();
    },


    createLeafyBlade(position, rotation, scale) {
        let leafyBlade = new THREE.Object3D;
        const vm = this;
        (new GLTFLoader()).load('/models/ambient/leafyblade.glb', function (gltf) {
            const obj = {
                scene: gltf.scene,
                animations: gltf.animations
            };

            obj.scene.scale.set(scale.x, scale.y, scale.z);
            obj.scene.position.set(position.x, position.y, position.z);
            obj.scene.rotation.y = rotation

            const mixer = new THREE.AnimationMixer(obj.scene);
            mixer.clipAction(obj.animations[0]).play();
            vm.animationMixers.push(mixer);

            leafyBlade.add(obj.scene);

        }, undefined, function (error) {
            console.error(error);
        });
        return leafyBlade;
    },

    updateAnimationMixers(delta) {
        this.animationMixers.forEach(mixer => {
            if (mixer) mixer.update(delta)
        });
    }
}