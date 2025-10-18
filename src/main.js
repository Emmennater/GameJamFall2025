function setup() {
  createCanvas(windowWidth, windowHeight);
  mouse = { clicked: false };
  keys = {};
  characters = getCharacters();
  soundManager = getSoundManager();
  sceneManager = new SceneManager();
  sceneManager.setScene(new StartingArea());
}

function draw() {
  const dt = min(frameRate() / 60, 1);
  sceneManager.run(dt);
  sceneManager.draw();
  mouse.clicked = false;
  keys[keyCode] = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  mouse.clicked = true;
  // if (sceneManager.currentScene instanceof CaveArea) return;
  // sceneManager.transitionToScene(new CaveArea);
}

function keyPressed() {
  keys[keyCode] = true;
}