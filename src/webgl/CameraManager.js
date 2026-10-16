import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { lerp } from "./utils/maths";
import CameraControls from "camera-controls";

CameraControls.install({ THREE: THREE });

export default class CameraManager {
  constructor(options = {}) {
    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.offset = new THREE.Vector3(3.5, 0.6, 0);

    this.camera = this.createCamera();
    this.cameraControls = this.createCameraControls();
    // this.controls = this.createControls();

    // this.debugFolder = this.createDebugFolder();
    this.setupEventListeners();
  }

  createCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      this.renderWidth / this.renderHeight ||
        window.innerWidth / window.innerHeight,
      0.1,
      500,
    );

    camera.position.set(2.5, 0.1, 2);

    return camera;
  }

  createCameraControls() {
    const cameraControls = new CameraControls(
      this.camera,
      this.renderer.domElement,
    );
    cameraControls.smoothTime = 0.2;
    cameraControls.enabled = false

    return cameraControls;
  }

  createControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enableDamping = true;
    controls.enabled = false;

    controls.target.set(-1, 0.1, 2);
    controls.update();

    return controls;
  }

  update(character, deltaTime) {
    if (this.cameraControls && this.cameraControls.enabled) {
      // this.cameraControls.update();

      return;
    }

    if (character) {
      const charPos = character.position;

      this.cameraControls.setLookAt(
        charPos.x + this.offset.x,
        charPos.y + this.offset.y,
        charPos.z + this.offset.z,
        charPos.x,
        charPos.y + 0.6,
        charPos.z,
        true,
      );

      if (this.cameraControls) {
        this.cameraControls.update(deltaTime);
      }
    }
  }

  resize(width, height) {
    this.renderWidth = width;
    this.renderHeight = height;

    this.camera.aspect = this.renderWidth / this.renderHeight;
    this.camera.updateProjectionMatrix();
  }

  setupEventListeners() {
    this.cameraControls.addEventListener(
      "change",
      this.controlsChangeHandler.bind(this),
    );
  }

  controlsChangeHandler() {
    sessionStorage.setItem(
      "cameraPosition",
      JSON.stringify(this.camera.position),
    );
    sessionStorage.setItem(
      "cameraTarget",
      JSON.stringify(this.cameraControls.target),
    );
  }

  /**
   * Debug
   */
  createDebugFolder() {
    if (!this.debugger) return;

    const cameraFolder = this.debugger.addFolder({ title: "Camera" });

    cameraFolder.addBinding(this.cameraControls, "enabled", {
      label: "Orbit Controls",
    });

    return cameraFolder;
  }
}
