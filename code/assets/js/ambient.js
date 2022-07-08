import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DoubleSide, Vector2} from "three";

export const Ambient = {
    fireflyMovement: [],

    animationMixers: [],

    ambient: new THREE.Object3D(),

    createAmbient: function() {
        // const backgroundGeometry = new THREE.SphereGeometry( 100, 16, 16 );
        // const backgroundMaterial = new THREE.MeshBasicMaterial( { color: 0x00000, side: DoubleSide } );
        // const sphere = new THREE.Mesh( backgroundGeometry, backgroundMaterial );
        // this.ambient.add( sphere );



        // CIRCLE PLANE
        const groundGeometry = new THREE.CircleGeometry( 350, 16 );
        const groundMaterial = new THREE.MeshToonMaterial( { color: 0x999999 } );
        const circle = new THREE.Mesh( groundGeometry, groundMaterial );
        circle.rotation.x = - Math.PI/2;
        circle.receiveShadow = true;
        this.ambient.add( circle );

        // ILLUMINATION
        // const hemiLight = new THREE.HemisphereLight(0xa1f2db, 0x3f7675, 0.4);
        // hemiLight.position.set(0, 80, 0)
        // this.ambient.add( hemiLight );

        const pointBlueLight = new THREE.PointLight( 0x3fa6c1, 2, 200, 4 );
        pointBlueLight.position.set(0, 50, 0)
        this.ambient.add( pointBlueLight );

        let spotLight = new THREE.SpotLight(0xffffff, 2, 220, 0.5, 1,1);
        spotLight.position.set(0, 200, 50);
        spotLight.castShadow = true;
        this.ambient.add( spotLight );


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
            this.ambient.add(
                Ambient.createLeafyBlade(leafyBladeState.position, leafyBladeState.rotation, leafyBladeState.scale)
            );

        // FLYING PARTICLES
        const randomParticles = new THREE.Object3D();
        for (let i = 0; i<= 30; i++) {
            randomParticles.add(Ambient.createRandomFlyingParticle());
        }
        this.ambient.add(randomParticles);

        // PILLARS
        const pillar = Ambient.createPillar(0x183944);
        pillar.castShadow = true;
        pillar.position.x = 70
        pillar.position.z = 60
        this.ambient.add( pillar );

        const clone = pillar.clone(true);
        clone.position.x = -70;
        clone.position.z = 0;
        this.ambient.add( clone );

        // BENCH
        this.ambient.add(Ambient.createBench());

        // BUSH
        const bush = Ambient.createBush();
        bush.translateZ(-40);

        this.ambient.add( bush );

        // LAMPPOST
        this.ambient.add( this.createLampPost() );

        return this.ambient;
    },

    createLampPost: function () {
        const lampPostPoints = [
            new THREE.Vector2(0,0),
            new THREE.Vector2(8,0),
            new THREE.Vector2(5,5.4),
            new THREE.Vector2(5,6),
            new THREE.Vector2(3,16),
            new THREE.Vector2(3,23),
            new THREE.Vector2(4,23.76),
            new THREE.Vector2(4,27),
            new THREE.Vector2(3,28),
            new THREE.Vector2(2,38),
            new THREE.Vector2(2,78),
            new THREE.Vector2(3,80),
            new THREE.Vector2(2,82),
            new THREE.Vector2(4,94.85),
            new THREE.Vector2(4,102),
            new THREE.Vector2(2,109),
            new THREE.Vector2(3,110),
            new THREE.Vector2(3,113),
            new THREE.Vector2(2,114),
            new THREE.Vector2(4,118.25),
            new THREE.Vector2(0,117),
        ]

        const lampPost = new THREE.Object3D();

        const postGeometry = new THREE.LatheGeometry( lampPostPoints );
        const postMaterial = new THREE.MeshPhongMaterial( { color: 0x4c7377 } );
        const post = new THREE.Mesh( postGeometry, postMaterial );
        lampPost.add( post );

        lampPost.name = "LampPost";

        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            shininess: 100,
            side: DoubleSide
        });

        const bigGlobeGeometry = new THREE.SphereGeometry( 15, 16, 16 );
        const bigGlobe = new THREE.Mesh( bigGlobeGeometry, glassMaterial );

        const firefly = this.createFirefly();

        bigGlobe.add( firefly );

        const smallGlobe = bigGlobe.clone( true );

        const scale = 0.55;
        smallGlobe.scale.set( scale, scale, scale );
        bigGlobe.translateY( 132 );
        smallGlobe.translateY( 157 );

        smallGlobe.name = "SmallFireflyGlobe";
        bigGlobe.name = "BigFireflyGlobe";


        lampPost.add( bigGlobe );
        lampPost.add( smallGlobe );

        lampPost.position.set(-60, 0, -50);

        return lampPost;
    },

    createFirefly: function () {
        const firefly = new THREE.Object3D();
        firefly.name = "Firefly";

        const fireflyMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: DoubleSide
        });

        const fireflyBodyGeometry = new THREE.CapsuleGeometry( 1.2, 1, 3, 6 );
        fireflyBodyGeometry.rotateX( Math.PI / 3 );
        const fireflyBody = new THREE.Mesh( fireflyBodyGeometry, fireflyMaterial );

        const fireflyLight = new THREE.PointLight(0xffffff, 0.5, 150, 2);
        fireflyLight.castShadow = true;
        fireflyLight.shadow.bias = 0.0000125;
        fireflyLight.shadow.mapSize.width = 2048;
        fireflyLight.shadow.mapSize.height = 2048;
        fireflyLight.name = "Light";

        fireflyBody.add(fireflyLight);

        fireflyBody.translateY( 0.5 );

        firefly.add(fireflyBody);

        const points = [];
        for ( let i = 0; i < 5; i ++ ) {
            points.push( new THREE.Vector2( Math.sin( i * 0.4 ) * 10 + 5, ( i - 2 ) * 2 ) );
        }

        const fireflyLeftWingGeometry = new THREE.LatheGeometry( points, 5, 0, 2 );
        fireflyLeftWingGeometry.rotateY( Math.PI / 8 );
        fireflyLeftWingGeometry.rotateZ( 3 * Math.PI / 4 );
        fireflyLeftWingGeometry.scale( 0.4,0.15,0.1 );

        const fireflyRightWingGeometry = fireflyLeftWingGeometry.clone();

        fireflyRightWingGeometry.scale(-1, 1, 1);

        const fireflyLeftWing = new THREE.Mesh( fireflyLeftWingGeometry, fireflyMaterial );
        const fireflyRightWing = new THREE.Mesh( fireflyRightWingGeometry, fireflyMaterial );

        fireflyLeftWing.name = "LeftWing";
        fireflyRightWing.name = "RightWing";

        const fireflyWings = new THREE.Object3D();

        fireflyWings.add(fireflyLeftWing);
        fireflyWings.add(fireflyRightWing);

        fireflyWings.rotation.y = Math.PI;
        fireflyWings.rotation.x = - Math.PI / 5;

        firefly.add(fireflyWings);

        return firefly;
    },

    createRandomFlyingParticle: function() {
        const trigonometricFuncts = [Math.cos, Math.sin]

        const sphere = new THREE.SphereGeometry( 1, 5, 5 );
        const particle = new THREE.PointLight( 0x80ff80, 1, 3 );
        const sphereMesh =  new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( {
            color: 0xeaffb9,
            transparent: true,
            opacity: 0.8
        } ) );
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
                alphaTest: 0.1
            });

            self.foaliageDepthMaterial = new THREE.MeshDepthMaterial( {
                depthPacking: THREE.RGBADepthPacking,
                map: texture,
                alphaTest : 0.1
            } );

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

            // correct shadows to exclude transparent texels
            leaves.customDepthMaterial = self.foaliageDepthMaterial;

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

    updateAnimationFrame(delta) {
        this.updateAnimationMixers(delta);
        const time = Date.now() * 0.0005;
        this.updateFirefliesPositioningForClockDelta(time)
        this.updatePostLampForClockDelta(time);
        this.updatePostLampForClockDelta(delta);
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

    updateAnimationMixers(delta) {
        this.animationMixers.forEach(mixer => {
            if (mixer) mixer.update(delta)
        });
    },

    updatePostLampForClockDelta() {
        function updateFireflyFlightState(firefly, phase=0) {
            const wingRotation = (a, p) => Math.sin(a + p) * 3 * Math.PI/16 - Math.PI/16;

            const alpha = Date.now() * 0.025;

            const angle = wingRotation(alpha, phase);

            const leftWing = firefly.getObjectByName("LeftWing");
            leftWing.rotation.z = - angle;

            const rightWing = firefly.getObjectByName("RightWing");
            rightWing.rotation.z = angle;

            firefly.position.y = - Math.sin(alpha + phase) * 0.05;
        }

        function updateFireflyPosition(firefly, maxDistance, phase=0) {
            const alpha = Date.now() * 0.007;

            firefly.position.x = Math.sin(alpha + phase) * maxDistance;
            firefly.position.y = Math.cos(alpha + phase) * maxDistance;
            firefly.position.z = Math.cos(alpha + phase + Math.PI/3) * maxDistance;
        }


        const fireflyGlobes = [
            this.ambient.getObjectByName("BigFireflyGlobe"),
            this.ambient.getObjectByName("SmallFireflyGlobe")
        ]

        fireflyGlobes.forEach( (globe, index) => {
            const firefly = globe.getObjectByName("Firefly");
            const maxFlyingDistance = globe.geometry.parameters.radius / 4;

            const phase = index * Math.PI;

            updateFireflyFlightState(firefly, phase );
            updateFireflyPosition(firefly, maxFlyingDistance, phase);
        })


    }
}
