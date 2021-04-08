var renderer, scene, camera, controls;

var AXIS = new THREE.Vector3(0.25, 1, 0).normalize();
var clock = new THREE.Clock();
var delta = 0;

var t = 0;

const gltbModel = 'src/assets/Phobos_1_1000.glb';
// const gltbModel = 'src/assets/Ingenuity_v3.glb';

// --- data input ---
let yRotation =  0; 
let xPosition = -3.2;	 
let zPosition =  3.5;

let theta = -10;
// -----         -----

let model = new THREE.Object3D();
let c, size; // model center and size
 
let x0 = xPosition;
let dx;


init();
animate();

// const OBJLoader =require('https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js');



function init() {

    // info
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = 'Drag mouse to rotate camera';
    document.body.appendChild(info);

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(15, 15, 15);

    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // axes
    scene.add(new THREE.AxesHelper(20));

    // geometry
    var geometry = new THREE.SphereGeometry(2, 16, 8);

    // material
    var material1 = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        wireframe: true
    });
    var material2 = new THREE.MeshBasicMaterial({
        color: 0x00aa00,
        wireframe: true
    });
    var material3 = new THREE.MeshBasicMaterial({
        color: 0xc0c0c0,
        wireframe: true
    });



    var Planet = function (geometry, material) {

        THREE.Mesh.call(this, geometry, material);
        this.type = 'Planet';

        this.rotationAxis = new THREE.Vector3(0, 1, 0).normalize(); // always orbit on Y
        this.rotationSpeed = Math.PI / 2; // length of planet day

        this.orbitAxis = new THREE.Vector3(0, 0.1, 1).normalize(); // y,z for orbit AXIS
        this.orbitSpeed = Math.PI / 8; // length of planet year
    };
    Planet.prototype = Object.create(THREE.Mesh.prototype);
    Planet.prototype._matrixUpdate = THREE.Object3D.prototype.updateMatrix;
    Planet.prototype._updateMatrixWorld = THREE.Object3D.prototype.updateMatrixWorld;
    Planet.prototype.updateMatrix = function () {

        var dta = delta || 0;

        if (this.parent instanceof Planet) {
            this.position.applyAxisAngle(this.orbitAxis, this.orbitSpeed * dta);
        }

        this.rotateOnAxis(this.rotationAxis, this.rotationSpeed * dta);

        this._matrixUpdate();
    };
    Planet.prototype.updateMatrixWorld = function () {
        if (this.matrixAutoUpdate === true) this.updateMatrix();

        if (this.matrixWorldNeedsUpdate === true || force === true) {

            if (this.parent === undefined) {
                this.matrixWorld.copy(this.matrix);
            } else {
                v = new THREE.Vector3();
                v.applyMatrix4(this.parent.matrixWorld);
                v.add(this.position);

                this.matrixWorld.compose(v, this.quaternion, this.scale);

            }

            this.matrixWorldNeedsUpdate = false;
            force = true;

        }

        // update children
        for (var i = 0, l = this.children.length; i < l; i++) {
            this.children[i].updateMatrixWorld(force);
        }
    };

    // mesh
    sunTexture = new THREE.TextureLoader().load('src/assets/sunmap.jpg');
    // sunMaterial = new THREE.MeshPhongMaterial();
    // sunMaterial = new THREE.MeshLambertMaterial({map: sunTexture, emissive: 0xac3d25});
    sunMaterial = new THREE.MeshLambertMaterial({ map: sunTexture, emissive: 0xffffff });
    // sunMaterial.map = sunTexture;
    sun = new Planet(geometry, material1);


    planetMaterial = createMaterialWithBump('src/assets/earthmap1k.jpg', 'src/assets/earthbump1k.jpg');
    planet = new Planet(geometry, planetMaterial);
    planet.receiveShadow = true;
    planet.castShadow = true;
    planet.position.set(8, 0, 0);
    planet.scale.multiplyScalar(0.5);

    moonMaterial = createMaterialWithBump('src/assets/moonmap2k.jpg', 'src/assets/moonbump2k.jpg');
    moon = new Planet(geometry, moonMaterial);
    moon.castShadow = true;
    moon.receiveShadow = true;
    moon.position.set(4, 0, 0);
    moon.orbitSpeed = Math.PI / 2;
    moon.scale.multiplyScalar(0.1);

    sun.rotation.z += 1;
    planet.rotation.z += 0.5;
    moon.rotation.z -= 0.5;

    planet.add(moon);
    sun.add(planet);
    scene.add(sun);

    // axes
    planet.add(new THREE.AxesHelper(2.5));
    moon.add(new THREE.AxesHelper(2.5));


    // pointLight = new THREE.PointLight(0xffffff, 0.1)
    // pointLight.position.x = 0
    // pointLight.position.y = 0
    // pointLight.position.z = 0
    pointLight = new THREE.PointLight(0xffffff);
    pointLight.castShadow = true;
    // pointLight.shadowDarkness = 0.5;
    // pointLight.shadowCameraVisible = true;
    var shadowHelper = new THREE.CameraHelper( pointLight.shadow.camera);
    scene.add(shadowHelper);


    scene.add(pointLight)

    const light = new THREE.AmbientLight(0x404040, 1); // soft white light
    scene.add(light);


    // load obj files
    // phobosShape = new OBJLoader().load('src/assets/deimos.obj.bin');
    //phobosShape = new THREE.OBJLoader();

    // var phobosRoot;
    // phobosShape.load('src/assets/StarWarsCorvette.obj', function (object) {
    //     object.position.set(0, 0, 0);
    //     object.rotation.z = Math.PI;
    //     // scene.add(root);
    //     scene.add(object);
    //   });

    // phobosRoot.position.set(1, 1, 1);
    // scene.add(phobosRoot);


    const phobosShape = new THREE.GLTFLoader();
    phobosShape.load(gltbModel, (gltf) => {

        // const root = gltf.scene;
        // root.scale.multiplyScalar(0.05);
        // root.rotation.z += 1;
        // root.position.x = 5;
        // root.position.y = 2;

        gltf.scene.traverse( child => {

            if ( child.material ) child.material.metalness = 0;

        } );
        // const light = new THREE.AmbientLight(0x404040); // soft white light
        // root.add(light);
        // root.rotation.z = Math.PI;

        // root.rotationAxis = new THREE.Vector3(0, 1, 0).normalize(); // always orbit on Y
        // root.rotationSpeed = Math.PI / 2; // length of planet day

        // root.orbitAxis = new THREE.Vector3(0, 0.1, 1).normalize(); // y,z for orbit AXIS
        // root.orbitSpeed = Math.PI / 8; // length of planet year

        // gltf.updateMatrix = function () {

        //     var dta = delta || 0;


        //     root.position.applyAxisAngle(root.orbitAxis, root.orbitSpeed * dta);


        //     root.rotateOnAxis(root.rotationAxis, root.rotationSpeed * dta);

        //     root._matrixUpdate();
        // };


        gltf.scene.scale.multiplyScalar(0.1);


        const box = new THREE.Box3( ).setFromObject( gltf.scene );		 
        const boxHelper = new THREE.Box3Helper( box, 0xffff00 );
        // scene.add( boxHelper );
        
        c = box.getCenter( new THREE.Vector3( ) );
        size = box.getSize( new THREE.Vector3( ) );
        
        gltf.scene.position.set( -c.x, size.y / 2 - c.y, -c.z );
    
        model.add( gltf.scene );


        // model.add(root);
        model.castShadow = true;
        model.receiveShadow = true;

        scene.add(model);


    });



}

/**
 * generates a mesh with the texture.  the `otherImage` is a normal map
 * 
 * @param {*} geometry 
 * @param {*} image 
 * @param {*} otherImage 
 * @returns 
 */
function createTextureMeshWithNormal(geometry, image, otherImage) {
    let map = new THREE.TextureLoader().load(image);
    let normalMap = new THREE.TextureLoader().load(otherImage);

    let material = new THREE.MeshPhongMaterial();
    material.map = map;//Bottom mapping
    material.normalMap = normalMap;//normal map
    // scale determines how much the normal will affect the image default is 1
    // material.normalScale = new THREE.Vector2(0.3, 0.3);//Concavo convex degree

    return new THREE.Mesh(geometry, material);
}

function createTextureMeshWithBump(geometry, image, otherImage) {
    let map = new THREE.TextureLoader().load(image);
    let bumpMap = new THREE.TextureLoader().load(otherImage);

    let material = new THREE.MeshPhongMaterial();
    material.map = map;//Bottom mapping
    material.bumpMap = bumpMap;//normal map
    // scale determines how much the normal will affect the image default is 1
    material.bumpScale = new THREE.Vector2(0.3, 0.3);//Concavo convex degree

    return new THREE.Mesh(geometry, material);
}

function createMaterialWithBump(image, bumpImage) {
    let map = new THREE.TextureLoader().load(image);
    let bumpMap = new THREE.TextureLoader().load(bumpImage);
    let material = new THREE.MeshPhongMaterial();
    material.map = map;
    material.bumpMap = bumpMap;
    // material.bumpScale = new THREE.Vector2(0.3, 0.3);//Concavo convex degree
    // material.bumpScale = new THREE.Vector2(0.1, 0.1);


    return material;
}



function animate() {

    requestAnimationFrame(animate);
    delta = clock.getDelta();
    // sun.position.y = Math.sin(t++/100);
    // pointLight.position.y = sun.position.y;

    // circle
    // xPosition = Math.sqrt(Math.sqr(modelRadius) - Math.sqr(yPosition - yOrigin)) - xOrigin;
    // x = radius *  cos(angle)
    // y = radius *  sin(angle)

    let modelRadius = 15;

	yRotation += 0.005;	
	t += 0.1;
	dx = Math.sin( t )	
	xPosition = x0 + dx;	
 	
	model.rotation.y = yRotation;
	
	// model.position.x = xPosition
	// model.position.z = zPosition

    theta += 0.005;
    model.position.x = modelRadius * Math.cos(theta);
    model.position.y = modelRadius * Math.sin(theta);

console.log('x:' + xPosition + '  z:' + zPosition);

    renderer.render(scene, camera);

}
