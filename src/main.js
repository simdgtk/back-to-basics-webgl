import WebglApplication from "./webgl";

const launchButton = document.getElementById("launch-button");
const audioElement = document.getElementById("audio");

const webgl = new WebglApplication({ audioElement: audioElement });

launchButton?.addEventListener("click", () => {
  launchButton.classList.add("hide");
  webgl.hasBeenCliqued = true;
});
