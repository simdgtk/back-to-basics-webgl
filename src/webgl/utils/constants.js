import { Vector2 } from "three";

export const BACKGROUND_COLOR_JS = 0xe9ecef;
export const BACKGROUND_COLOR_HEXA = "#e9ecef";
export const ANIMATION_TRANSITION_DURATION = 1;
export const CROSS_PLATFORM_FONTS = [
  "Arial",
  "Arial Black",
  "Helvetica",
  "Trebuchet MS",
  "Impact",
  "Gill Sans",
];

export const glitchNone = {
  delay: new Vector2(2, 4),
  duration: new Vector2(0, 0),
  strength: new Vector2(0, 0),
  ratio: 0,
};

export const glitchSmall = {
  delay: new Vector2(2, 4),
  duration: new Vector2(0.2, 0.3),
  strength: new Vector2(0.1, 0.3),
  ratio: 0.9,
};

export const glitchMedium = {
  delay: new Vector2(1, 3),
  duration: new Vector2(0.2, 0.8),
  strength: new Vector2(0.8, 2.5),
  ratio: 0.8,
};

export const glitchStrong = {
  delay: new Vector2(0, 0.4),
  duration: new Vector2(0.2, 0.8),
  strength: new Vector2(2, 5.5),
  ratio: 0.8,
};
