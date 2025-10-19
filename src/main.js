function preload() {
  dialogueJSON = {};
  dialogueJSON.lionfish = loadJSON("dialogue/lionfish.json");
  dialogueJSON.lionfishItem = loadJSON("dialogue/lionfishItem.json");
  dialogueJSON.lionfishLove = loadJSON("dialogue/lionfishLove.json");

  images = {};
  images.menu = loadImage("images/menu.png");
  images.empty_floor = loadImage("images/empty_floor.png");
  images.cave = loadImage("images/cave.png");
  images.cave_cavern = loadImage("images/cave_cavern.png");
  images.cave_floor_dark = loadImage("images/cave_floor_dark.png");
  images.cave_opening = loadImage("images/cave_opening.png");
  images.cave_lit = loadImage("images/cave_lit.png");
  images.ship = loadImage("images/ship.png");
  images.ship2 = loadImage("images/ship2.png");
  
  // gifs = {};
  // gifs.shipwreck = loadImage("images/shipwreck.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  debug = false;
  hovered = {};
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
  hovered = {};
  sceneManager.draw();
  mouse.clicked = false;
  keys = {};
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