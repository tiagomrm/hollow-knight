import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

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