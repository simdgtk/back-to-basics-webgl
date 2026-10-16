import { Uniform } from "three";
import { Effect } from "postprocessing";

import fragmentShader from "./shader.frag?raw";

export class GrayscaleEffect extends Effect {
  constructor({ grayscaleIntensity = 1.0 } = {}) {
    super("GrayscaleEffect", fragmentShader, {
      uniforms: new Map([
        ["grayscaleIntensity", new Uniform(grayscaleIntensity)],
      ]),
    });
  }

  get grayscaleIntensity() {
    return this.uniforms.get("grayscaleIntensity").value;
  }

  set grayscaleIntensity(value) {
    this.uniforms.get("grayscaleIntensity").value = value;
  }
}
