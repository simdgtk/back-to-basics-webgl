export function remap(value, x1, y1 = 0, x2, y2 = 1) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}
