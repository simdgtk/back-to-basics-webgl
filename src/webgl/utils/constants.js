import { Vector2 } from "three";

export const BACKGROUND_COLOR_JS = 0xe9ecef;
export const BACKGROUND_COLOR_HEXA = "#e9ecef";
export const ANIMATION_TRANSITION_DURATION = 1;
export const CHARACTER_SPEED = 0.9;
export const ANIMATION_SPEED = 2;

export const CROSS_PLATFORM_FONTS = [
  "Arial",
  "Arial Black",
  "Helvetica",
  "Trebuchet MS",
  "Impact",
  "Gill Sans",
];

export const TEXTS = [
  "NO FUTURE",
  "GO AWAY",
  "LEAVE",
  "TECHNOLOGY",
  "WILL",
  "RUIN",
  "THE",
  "WORLD",
  "DATA",
  "KILL",
  "RUN",
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

export const CANVAS_DRAWING_INTERVAL_MS = 25;
