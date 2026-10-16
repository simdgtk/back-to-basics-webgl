uniform float grayscaleIntensity;


vec3 greyscale(vec3 color, float str) {
    float g = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(color, vec3(g), str);
}

vec3 adjustBrightness(vec3 color, float value) {
  return color + value;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
	outputColor = vec4(greyscale(adjustBrightness(inputColor.rgb, -grayscaleIntensity * 0.1), grayscaleIntensity), inputColor.a);
}