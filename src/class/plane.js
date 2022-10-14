import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

const WIDTH = 100;
const HEIGHT = 100;

export default class Plane {
  constructor(scene, gui) {
    this.scene = scene;
    this.gui = gui;
    this.geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, WIDTH/2, HEIGHT/2 + 1);
    this.noise2D = createNoise2D();
    this.material = new THREE.MeshPhongMaterial();
    this.plane = new THREE.Mesh(this.geometry, this.material);
    return this._init();
  }

  _init() {
    this.plane.rotation.x = -Math.PI / 2;
    const vertices = this.geometry.attributes.position.array;
    this.scene.add(this.plane);
  }

  getMesh() {
    return this.plane;
  }

  update() {
    const vertices = this.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      vertices[i + 2] = this.noise2D(x, y);
    }

    this.geometry.attributes.position.needsUpdate = true;
  }
}
