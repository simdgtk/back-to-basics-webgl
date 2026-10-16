import { Vector2 } from "three";

const PostProcessing = {
  name: "PostProcessing",

  uniforms: {
    tDiffuse: { value: null },
  },

  vertexShader: /* glsl */ `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */ `

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 color = texture2D( tDiffuse, vUv );

			gl_FragColor = vec4(mix(color.rgb, vec3(1.000,0.241,0.049).rgb, 0.9), color.a );

		}`,
};

export { PostProcessing };
