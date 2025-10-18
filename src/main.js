function setup() {
  createCanvas(windowWidth, windowHeight);
  soundManager = getSoundManager();
  sceneManager = new SceneManager();
  sceneManager.setScene(new StartingArea());
}

function draw() {
  const dt = min(frameRate() / 60, 1);
  sceneManager.run(dt);
  sceneManager.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // if (sceneManager.currentScene instanceof CaveArea) return;
  // sceneManager.transitionToScene(new CaveArea);
}