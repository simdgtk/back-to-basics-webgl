import { WebGLRenderer, Timer, AgXToneMapping } from "three";
import { Pane } from "tweakpane";
import SceneDefault from "./SceneDefault";
import * as constants from "./utils/constants.js";

export default class WebGLApplication {
  constructor() {
    this.renderWidth = window.innerWidth;
    this.renderHeight = window.innerHeight;

    this.timer = new Timer();

    // this.debugger = new Pane({ title: "Debug" });

    this.renderer = this.createRenderer();
    this.sceneDefault = this.createSceneDefault();

    this.resize();

    this.setupEventListeners();
  }

  /**
   * Public
   */

  /**
   * Private
   */
  createRenderer() {
    const renderer = new WebGLRenderer({
      canvas: document.querySelector("canvas"),
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      // depth: false,
    });

    renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));
    renderer.toneMapping = AgXToneMapping;
    renderer.setClearColor(constants.BACKGROUND_COLOR_JS);

    return renderer;
  }

  createSceneDefault() {
    const scene = new SceneDefault({
      renderer: this.renderer,
      debugger: this.debugger,
    });

    return scene;
  }

  resize() {
    this.renderer.setSize(this.renderWidth, this.renderHeight);

    this.sceneDefault.resize(this.renderWidth, this.renderHeight);
  }

  update(deltaTime) {
    this.sceneDefault.update(deltaTime);
  }

  render() {
    this.sceneDefault.renderComposer();
  }

  /**
   * Events
   */
  setupEventListeners() {
    window.addEventListener("resize", this.resizeHandler.bind(this));
    this.tickHandler();
  }

  resizeHandler() {
    this.renderWidth = window.innerWidth;
    this.renderHeight = window.innerHeight;

    this.resize();
  }

  tickHandler() {
    window.requestAnimationFrame(this.tickHandler.bind(this));

    this.timer.update();
    const deltaTime = this.timer.getDelta();

    this.update(deltaTime);
    this.render();
  }
}
