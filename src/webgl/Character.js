import { Object3D, AnimationMixer } from "three";
import { clamp, remap } from "./utils/maths";
import { CHARACTER_SPEED } from "./utils/constants";

export default class Character extends Object3D {
  constructor(options = {}, callback) {
    super();

    this.loader = options.loader;
    this.actions = {};
    this.mixer = null;
    this.scene = options.scene;
    this.isLoaded = false;
    this.loading = this.load();
    this.isWalking = false;
  }

  async load() {
    this.gltf = await this.loader.loadAsync("/models/character.glb");
    this.createModel();
    this.setupAnimations();
    this.isLoaded = true;
    this.startAnimation("idle");
  }

  createModel() {
    const object = this.gltf.scene;

    this.rotation.set(0, Math.PI, 0);
    this.scale.set(0.8, 0.8, 0.8);
    this.position.set(-1, -0.5, 2);
    this.add(object);

    this.model = object;
    return object;
  }

  setupAnimations() {
    const animations = this.gltf.animations;
    if (!animations || animations.length === 0) return;

    this.mixer = new AnimationMixer(this.model);

    const idleAction = this.mixer.clipAction(animations[0]);
    const walkAction = animations[4]
      ? this.mixer.clipAction(animations[4])
      : null;

    this.actions = {
      idle: idleAction,
      walk: walkAction,
    };
  }

  async startAnimation(animationName) {
    if (!this.isLoaded && this.loading) {
      await this.loading;
    }

    const action = this.actions[animationName];
    if (action) {
      action.paused = false;
      action.enabled = true;
      action.play();
    }
  }

  playAnimation(animationName) {
    const action = this.actions[animationName];
    if (action) {
      action.paused = false;
    }
  }

  stopAnimation(animationName) {
    const action = this.actions[animationName];
    if (action) {
      action.paused = true;
    }
  }

  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    if (this.isWalking) {
      if (this.position.z < -41) {
        this.position.z = -40.99;
        this.isWalking = false;
        this.stopAnimation("walk");
        this.startAnimation("idle");
        return;
      }

      if (this.position.z > 3) {
        this.position.z = 2;
        this.isWalking = false;
        this.stopAnimation("walk");
        this.startAnimation("idle");
        return;
      }

      if (this.actions.walk.timeScale < 0) {
        this.position.z += CHARACTER_SPEED * deltaTime;
        this.scene.progress += CHARACTER_SPEED * deltaTime;
        this.scene.clampedProgress = clamp(
          remap(this.scene.progress, 2, -41, 0, 1),
          0,
          1,
        );
        this.scene.updateClampedProgress(this.scene.clampedProgress);
      } else {
        this.position.z -= CHARACTER_SPEED * deltaTime;
        this.scene.progress -= CHARACTER_SPEED * deltaTime;
        this.scene.clampedProgress = clamp(
          remap(this.scene.progress, 2, -41, 0, 1),
          0,
          1,
        );
        this.scene.updateClampedProgress(this.scene.clampedProgress);
      }
    }
  }
}
