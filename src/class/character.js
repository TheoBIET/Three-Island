import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const IDLE = "Human Armature|Idle";
const WALK = "Human Armature|Walk";
const RUN = "Human Armature|Run";
const JUMP = "Human Armature|Jump";
const SPEED = 0.05;

export default class Character {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.modelPath = require("../assets/models/human.glb");
    this.character = new THREE.Group();
    this.material = new THREE.MeshNormalMaterial();
    this.mixer = new THREE.AnimationMixer();
    this.clips = [];
    this.prevAction = null;
    this.currentAction = null;
    this.walkSpeed = SPEED;
    this.runSpeed = SPEED * 2;

    this._init();
  }

  _init() {
    const loader = new GLTFLoader();
    const loadCallback = this._loadCallback.bind(this);
    loader.load(this.modelPath, loadCallback);
  }

  _loadCallback(gltf) {
    const { scene, animations } = gltf;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = this.material;
      }
    });

    this.scene.add(scene);
    this.character = scene;
    this.character.scale.set(1, 1, 1);
    this.character.position.set(0, 0, 0);
    this.character.rotation.set(0, 0, 0);

    this.mixer = new THREE.AnimationMixer(this.character);
    this.clips = [...animations];
  }

  _getAction(name) {
    const clip = THREE.AnimationClip.findByName(this.clips, name);
    const action = this.mixer.clipAction(clip);
    return action;
  }

  _getIdealOffset() {
    const [x, y, z] = [-3, 5, -5];
    const idealOffset = new THREE.Vector3(x, y, z);
    idealOffset.applyQuaternion(this.character.quaternion);
    idealOffset.add(this.character.position);
    return idealOffset;
  }

  _getIdealLookAt() {
    const [x, y, z] =  [0, 2, 10];
    const idealLookAt = new THREE.Vector3(x, y, z);
    idealLookAt.applyQuaternion(this.character.quaternion);
    idealLookAt.add(this.character.position);
    return idealLookAt;
  }

  _updateCamera() {
    const idealOffset = this._getIdealOffset();
    const idealLookAt = this._getIdealLookAt();
    this.camera.position.lerp(idealOffset, 0.1);
    this.camera.lookAt(idealLookAt);
  }

  update() {
    const { mixer } = this;
    if (mixer) mixer.update(0.01);
  }

  getModel() {
    return this.character;
  }

  updatePosition(forward, backward, left, right, shift, jump) {
    this.currentAction = IDLE;
    let speed = this.walkSpeed;

    if (forward || backward || left || right) {
      this.currentAction = WALK;
      speed = this.walkSpeed;
    }

    if (forward && shift) {
      this.currentAction = RUN;
      speed = this.runSpeed;
    }

    if (jump) this.currentAction = JUMP;

    if (this.currentAction !== this.prevAction) {
      const action = this._getAction(this.currentAction);
      const actionPrev = this._getAction(this.prevAction);
      if (this.prevAction) actionPrev.fadeOut(0.3);
      action.reset().fadeIn(0.3).play();
      this.prevAction = this.currentAction;
    }

    // Rotate the character and camera
    if (left) this.character.rotation.y += speed;
    if (right) this.character.rotation.y -= speed;

    // Move the character
    if (forward || backward) {
      const direction = new THREE.Vector3();
      this.character.getWorldDirection(direction);
      if (backward) direction.negate();
      const newPosition = this.character.position.clone();
      newPosition.addScaledVector(direction, speed);
      this.character.position.copy(newPosition);
    }
      
    this._updateCamera();
  }
}
