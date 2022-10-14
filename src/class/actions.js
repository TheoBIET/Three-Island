import * as THREE from "three";

const FORWARD = ["z", "w", "ArrowUp"];
const BACKWARD = ["s", "ArrowDown"];
const LEFT = ["q", "a", "ArrowLeft"];
const RIGHT = ["d", "ArrowRight"];
const SHIFT = ["Shift"];
const SPACE = [" "];

const config = {
  forward: FORWARD,
  backward: BACKWARD,
  left: LEFT,
  right: RIGHT,
  shift: SHIFT,
  jump: SPACE,
};

export default class Actions {
  constructor(camera, character) {
    this.camera = camera;
    this.character = character;
    this.actions = ["forward", "backward", "left", "right", "shift", "jump"];
    this._init();
  }

  _init() {
    this._initializeActions();
  }

  _handleKeyUp = ({ key }) => {
    this.actions.forEach((action) => {
      if (config[action].indexOf(key) !== -1) {
        this[action].isPressed = false;
      }
    });
  };

  _handleKeyDown = ({ key }) => {
    this.actions.forEach((action) => {
      if (config[action].indexOf(key) !== -1) {
        this[action].isPressed = true;
      }
    });
  };

  _initializeActions() {
    this.actions.forEach((action) => {
      this[action] = {
        keys: config[action],
        element: document.getElementById(action),
        isPressed: false,
      };
    });

    window.addEventListener("keydown", this._handleKeyDown);
    window.addEventListener("keyup", this._handleKeyUp);
  }

  _updateUI() {
    this.actions.forEach((action) => {
      const { element, isPressed } = this[action];
      if (isPressed) element.classList.add("--active");
      else element.classList.remove("--active");
    });
  }

  _doAction() {
    const {
      forward: { isPressed: isForwardPressed },
      backward: { isPressed: isBackwardPressed },
      left: { isPressed: isLeftPressed },
      right: { isPressed: isRightPressed },
      shift: { isPressed: isShiftPressed },
      jump: { isPressed: isJumpPressed },
      character,
    } = this;

    character.updatePosition(isForwardPressed, isBackwardPressed, isLeftPressed, isRightPressed, isShiftPressed, isJumpPressed);
  }

  update() {
    this._updateUI();
    this._doAction();
  }
}
