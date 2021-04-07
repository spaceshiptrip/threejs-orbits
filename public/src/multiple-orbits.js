var renderer, scene, camera, controls;

var AXIS = new THREE.Vector3(0.25, 1, 0).normalize();
var clock = new THREE.Clock();
var delta = 0;

var t = 0;

init();
animate();



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
    sun = new Planet(geometry, material1);
    planet = new Planet(geometry, material2);
    planet.position.set(8, 0, 0);
    planet.scale.multiplyScalar(0.5);
    moon = new Planet(geometry, material3);
    moon.position.set(2, 0, 0);
    moon.orbitSpeed = Math.PI;
    moon.scale.multiplyScalar(0.2);

    sun.rotation.z += 1;
    planet.rotation.z += 0.5;
    moon.rotation.z -= 1;

    planet.add(moon);
    sun.add(planet);
    scene.add(sun);

    // axes
    planet.add(new THREE.AxesHelper(2.5));
    moon.add(new THREE.AxesHelper(2.5));

}

/**
 * generates a mesh with the texture.  the `otherImage` is a normal map
 * 
 * @param {*} geometry 
 * @param {*} image 
 * @param {*} otherImage 
 * @returns 
 */
function createTextureMesh(geometry, image, otherImage) {
    let map = new THREE.TextureLoader().load(image);
    let normalMap = new THREE.TextureLoader().load(otherImage);

    let material = new THREE.MeshPhongMaterial();
        material.map = map;//Bottom mapping
        material.normalMap = normalMap;//normal map
        material.normalScale = new THREE.Vector2(0.3, 0.3);//Concavo convex degree

    return new THREE.Mesh(geometry, material);
}

function animate() {

    requestAnimationFrame(animate);
    delta = clock.getDelta();
    //sun.position.y = Math.sin(t++/100);

    renderer.render(scene, camera);

}
