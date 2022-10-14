import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "dat.gui";

import Plane from "./plane";
import Character from "./character";
import Actions from "./actions";

const BASE_POSITION_CAMERA = new THREE.Vector3(0, 5, 10);
const BASE_POSITION_LIGHTS = new THREE.Vector3(0, 10, -1);
const FOV = 75;
const ASPECT_RATIO = window.innerWidth / window.innerHeight;
const NEAR = 0.1;
const FAR = 1000;

export default class App {
  constructor(isDev = true) {
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR, FAR);

    this.plane = new Plane(this.scene);
    this.character = new Character(this.scene, this.camera);
    this.actions = new Actions(this.camera, this.character);

    this.light = new THREE.PointLight(0xffffff, 1, 1000);

    if (isDev) {
      const { camera, renderer } = this;
      this.statistics = new Stats();
      this.gui = new GUI();
      this.orbitControls = new OrbitControls(camera, renderer.domElement);
    }
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(this.statistics.dom);

    this.light.position.set(
      BASE_POSITION_LIGHTS.x,
      BASE_POSITION_LIGHTS.y,
      BASE_POSITION_LIGHTS.z
    );
    this.camera.position.copy(BASE_POSITION_CAMERA);

    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.25;
    this.orbitControls.enableZoom = true;

    this.scene.add(new THREE.AxesHelper(5));
    this.scene.add(this.camera);
    this.scene.add(this.light);

    this._resize();
    this._createGUI();
    this._step();
  }

  _resize() {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _addElementToGUI(folder, element, key, name) {
    folder.add(element, key, 0, 10).name(name).listen();
  }

  _step() {
    setTimeout(() => {
      requestAnimationFrame(this._step.bind(this));

      // Update all the components
      this.character.update();
      this.actions.update();
      this.plane.update();
      this.statistics.update();

      // Render the scene
      this.renderer.render(this.scene, this.camera);
    }, 10);
  }

  _createGUI() {
    const add = this._addElementToGUI.bind(this);
    /*##############################################################*/
    /*########################### CAMERA ###########################*/
    /*##############################################################*/
    const camera = this.gui.addFolder("Camera");
    add(camera, this.camera.position, "x", "Position X");
    add(camera, this.camera.position, "y", "Position Y");
    add(camera, this.camera.position, "z", "Position Z");
    add(camera, this.camera.rotation, "x", "Rotation X");
    add(camera, this.camera.rotation, "y", "Rotation Y");
    add(camera, this.camera.rotation, "z", "Rotation Z");

    /*##############################################################*/
    /*########################### LIGHT ############################*/
    /*##############################################################*/
    const light = this.gui.addFolder("Light");
    add(light, this.light.position, "x", "Position X");
    add(light, this.light.position, "y", "Position Y");
    add(light, this.light.position, "z", "Position Z");
    add(light, this.light.rotation, "x", "Rotation X");
    add(light, this.light.rotation, "y", "Rotation Y");
    add(light, this.light.rotation, "z", "Rotation Z");

    /*##############################################################*/
    /*########################### PLANE ############################*/
    /*##############################################################*/
    const planeMesh = this.plane.getMesh();
    const plane = this.gui.addFolder("Plane");
    add(plane, planeMesh.position, "x", "Position X");
    add(plane, planeMesh.position, "y", "Position Y");
    add(plane, planeMesh.position, "z", "Position Z");
    add(plane, planeMesh.material.color, "r", "Color R");
    add(plane, planeMesh.material.color, "g", "Color G");
    add(plane, planeMesh.material.color, "b", "Color B");
    add(plane, planeMesh.material, "wireframe", "Wireframe");
    plane.open();
  }
}
