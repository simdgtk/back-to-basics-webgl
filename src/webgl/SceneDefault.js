import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Scene,
  PlaneGeometry,
  Fog,
  CanvasTexture,
  NearestFilter,
  RepeatWrapping,
  Raycaster,
  Vector2,
  MeshPhysicalMaterial,
  FloatType,
  EquirectangularReflectionMapping,
  Object3D,
  Color,
} from "three";
import { HDRLoader } from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { PMREMGenerator } from "three";
import CameraManager from "./CameraManager.js";
import * as constants from "./utils/constants.js";

import { remap, clamp } from "./utils/maths.js";

import {
  GlitchEffect,
  GlitchMode,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

import { GrayscaleEffect } from "./shaders/postprocessing/GrayscaleEffect.js";

import Character from "./Character.js";

const FLOOR_SIZE = 500;

export default class SceneDefault extends Scene {
  constructor(options = {}) {
    super();

    this.renderer = options.renderer;
    this.debugger = options.debugger;

    this.cameraManager = this.createCameraManager();
    this.envmap = this.createEnvmap();

    this.dracoLoader = this.createDracoLoader();
    this.loader = this.createLoader();

    this.composer = this.createComposer();
    this.glitchEffectPassSmall = this.createGlitchEffectSmallPath();
    this.glitchEffectPassMedium = this.createGlitchEffectMediumPath();
    this.glitchEffectPassStrong = this.createGlitchEffectStrongPath();

    this.postprocessing = this.createPostprocessing();

    this.canvasNoFuture = this.createNoFuture();

    this.character = this.addCharacter();

    this.model = this.createModel();

    this.setupEventListeners();

    this.background = new Color(constants.BACKGROUND_COLOR_JS);

    this.progress = 0;

    this.clampedProgress = 0;
  }

  get camera() {
    return this.cameraManager.camera;
  }

  createDracoLoader() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");

    return dracoLoader;
  }

  createLoader() {
    const loader = new GLTFLoader();

    loader.setDRACOLoader(this.dracoLoader);

    return loader;
  }

  createNoFuture() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = "2";
    overlay.style.pointerEvents = "none";
    overlay.style.mixBlendMode = "difference";

    document.body.appendChild(overlay);

    const canvas = document.createElement("canvas");
    canvas.id = "no-future-canvas";
    overlay.appendChild(canvas);
    const context = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.fillStyle = "#fff";
    context.font = "bold 130px Verdana";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("NO FUTURE", canvas.width / 2, canvas.height / 2);

    return context;
  }

  updateNoFuture(x, y, fontSize, fontName) {
    this.canvasNoFuture.fillStyle = "rgba(0, 0, 0, 0.5)";

    this.canvasNoFuture.fillRect(
      0,
      0,
      this.canvasNoFuture.canvas.width,
      this.canvasNoFuture.canvas.height,
    );

    this.canvasNoFuture.fillStyle = "#fff";

    this.canvasNoFuture.font = `bold ${fontSize}px ${fontName}`;
    this.canvasNoFuture.fillText("NO FUTURE", x, y);
  }

  updateProgress(value) {
    this.updateGrayScaleIntensity(value);
  }

  async createModel() {
    const gltf = await this.loader.loadAsync("/models/scene_full.glb");

    const object = gltf.scene;
    const wrapper = new Object3D();

    wrapper.rotation.set(0, Math.PI / 2, 0);
    wrapper.position.set(0, -0.5, 0);
    wrapper.add(object);

    this.add(wrapper);
  }

  createCameraManager() {
    const cameraManager = new CameraManager({
      renderer: this.renderer,
      debugger: this.debugger,
    });

    return cameraManager;
  }

  addCharacter() {
    const character = new Character({
      loader: this.loader,
      scene: this,
    });

    character.startAnimation("idle");
    this.add(character);

    return character;
  }

  renderComposer() {
    this.composer.render();
  }

  async createEnvmap() {
    const loader = new HDRLoader();
    loader.setDataType(FloatType);

    loader.load("/01.hdr", (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      const generator = new PMREMGenerator(this.renderer);
      this.environment = generator.fromEquirectangular(texture).texture;
      generator.dispose();
    });
  }

  update(deltaTime) {
    if (this.character) {
      this.character.update(deltaTime);
    }

    if (this.cameraManager) {
      this.cameraManager.update(this.character, deltaTime);
    }
  }

  resize(width, height) {
    this.renderWidth = width;
    this.renderHeight = height;

    this.composer.setSize(width, height);

    this.cameraManager.resize(width, height);
  }

  createComposer() {
    const composer = new EffectComposer(this.renderer);

    return composer;
  }

  updateGrayScaleIntensity(value) {
    if (this.grayscaleEffect) {
      this.grayscaleEffect.grayscaleIntensity = value;
      return;
    }

    const grayscaleEffectPass = this.composer.passes.find(
      (pass) =>
        pass instanceof EffectPass &&
        pass.effects.some((effect) => effect instanceof GrayscaleEffect),
    );

    if (grayscaleEffectPass) {
      const grayscaleEffect = grayscaleEffectPass.effects.find(
        (effect) => effect instanceof GrayscaleEffect,
      );
      if (grayscaleEffect) {
        grayscaleEffect.grayscaleIntensity = value;
      }
    }
  }

  updateGlitchEffect(value) {
    // if (value < 0.3 ) {
    //   this.glitchEffectPassSmall.setEnabled(false);
    //   this.glitchEffectPassMedium.setEnabled(false);
    //   this.glitchEffectPassStrong.setEnabled(false);
    // }

    if (value > 0.3 && value < 0.6) {
      this.glitchEffectPassSmall.setEnabled(false);
      this.glitchEffectPassMedium.setEnabled(false);
      this.glitchEffectPassStrong.setEnabled(false);

      this.glitchEffectPassSmall.setEnabled(true);
      console.log("mettre 1er");
    }

    if (value > 0.6 && value < 0.9) {
      this.glitchEffectPassSmall.setEnabled(false);
      this.glitchEffectPassMedium.setEnabled(false);
      this.glitchEffectPassStrong.setEnabled(false);

      this.glitchEffectPassSmall.setEnabled(false);
      this.glitchEffectPassMedium.setEnabled(true);
      console.log("mettre 2e");
    }
    if (value > 0.9) {
      this.glitchEffectPassSmall.setEnabled(false);
      this.glitchEffectPassMedium.setEnabled(false);
      this.glitchEffectPassStrong.setEnabled(false);
      
      this.glitchEffectPassSmall.setEnabled(false);
      this.glitchEffectPassMedium.setEnabled(false);
      this.glitchEffectPassStrong.setEnabled(true);
      console.log("mettre 3");
    }
  }

  createGlitchEffectSmallPath() {
    const glitchEffect = new GlitchEffect({
      delay: constants.glitchSmall.delay,
      duration: constants.glitchSmall.duration,
      strength: constants.glitchSmall.strength,
      ratio: constants.glitchSmall.ratio,
    });

    const glitchEffectPassSmall = new EffectPass(this.camera, glitchEffect);

    glitchEffectPassSmall.setEnabled(false);

    return glitchEffectPassSmall;
  }

  createGlitchEffectMediumPath() {
    const glitchEffect = new GlitchEffect({
      delay: constants.glitchMedium.delay,
      duration: constants.glitchMedium.duration,
      strength: constants.glitchMedium.strength,
      ratio: constants.glitchMedium.ratio,
    });

    const glitchEffectPassMedium = new EffectPass(this.camera, glitchEffect);

    glitchEffectPassMedium.setEnabled(false);

    return glitchEffectPassMedium;
  }

  createGlitchEffectStrongPath() {
    const glitchEffect = new GlitchEffect({
      delay: constants.glitchStrong.delay,
      duration: constants.glitchStrong.duration,
      strength: constants.glitchStrong.strength,
      ratio: constants.glitchStrong.ratio,
    });

    const glitchEffectPassStrong = new EffectPass(this.camera, glitchEffect);

    glitchEffectPassStrong.setEnabled(false);

    return glitchEffectPassStrong;
  }

  createPostprocessing() {
    this.composer.addPass(new RenderPass(this, this.camera));

    this.composer.addPass(this.glitchEffectPassSmall);

    this.grayscaleEffect = new GrayscaleEffect();
    this.composer.addPass(new EffectPass(this.camera, this.grayscaleEffect));

    this.updateGlitchEffect(0);
    this.updateGrayScaleIntensity(0);
  }

  updateClampedProgress(value) {
    this.updateGlitchEffect(value);
    this.updateGrayScaleIntensity(value);
  }

  /**
   * Events
   */
  setupEventListeners() {
    const isUpKey = (e) =>
      e.code === "ArrowUp" ||
      e.code === "KeyW" ||
      e.key === "z" ||
      e.key === "Z";

    const isDownKey = (e) =>
      e.code === "ArrowDown" ||
      e.code === "KeyS" ||
      e.key === "s" ||
      e.key === "S";

    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (isUpKey(e)) {
        this.character.actions.walk.timeScale = 1;
        this.character.isWalking = true;
        this.character.stopAnimation("idle");
        this.character.startAnimation("walk");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      if (
        e.code === "ArrowDown" ||
        e.code === "KeyS" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        this.character.isWalking = true;
        this.character.stopAnimation("idle");
        this.character.startAnimation("walk");
        this.character.actions.walk.timeScale = -1;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (isUpKey(e) || isDownKey(e)) {
        this.character.isWalking = false;
        this.character.stopAnimation("walk");
        this.character.startAnimation("idle");
      }
    });

    setInterval(() => {
      if (this.canvasNoFuture) {
        const fontSize = Math.floor(Math.random() * 300) + 50;
        const x = Math.random() * this.canvasNoFuture.canvas.width;
        const y = Math.random() * this.canvasNoFuture.canvas.height;
        const fontName =
          constants.CROSS_PLATFORM_FONTS[
            Math.floor(Math.random() * constants.CROSS_PLATFORM_FONTS.length)
          ];

        this.updateNoFuture(x, y, fontSize, fontName);
      }
    }, 2500);
  }
}
