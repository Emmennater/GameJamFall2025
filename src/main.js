function preload() {
  dialogueJSON = {};
  dialogueJSON.lionfish = loadJSON("dialogue/lionfish.json");
  dialogueJSON.lionfishItem = loadJSON("dialogue/lionfishItem.json");
  dialogueJSON.lionfishLove = loadJSON("dialogue/lionfishLove.json");

  images = {};
  images.menu = loadImage("images/menu.png");
  images.empty_floor = loadImage("images/empty_floor.png");
  images.cave = loadImage("images/cave.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  debug = false;
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
  
  for (const key in keys) delete keys[key];
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
  keys[key] = true;
}