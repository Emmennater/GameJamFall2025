function preload() {
  dialogueJSON = {};
  dialogueJSON.lionfish = loadJSON("dialogue/lionfish.json");
  dialogueJSON.lionfishLove = loadJSON("dialogue/lionfishLove.json");
  dialogueJSON.anglerfish = loadJSON("dialogue/anglerfish.json");
  dialogueJSON.octo = loadJSON("dialogue/octo.json");
  dialogueJSON.shopkeeper = loadJSON("dialogue/shopkeeper.json");

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
  images.ship_arriving = loadImage("images/ship_arriving.png");
  images.shop_distance = loadImage("images/shop_distance.png");
  images.shop = loadImage("images/shop.png");
  images.coral1 = loadImage("images/coral1.png");
  images.coral2 = loadImage("images/coral2.png");
  
  // Characters
  images.lion_chan_2 = loadImage("images/lion_chan_2.png");
  
  // gifs = {};
  // gifs.shipwreck = loadImage("images/shipwreck.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  debug = true;
  fonts = {main:"Arial"}
  busy = {};
  mouse = { clicked: false };
  keys = {};
  player = new Player();
  characters = getCharacters();
  soundManager = getSoundManager();
  sceneManager = new SceneManager();
  sceneManager.setScene(new Menu());
  // sceneManager.setScene(new CaveArea());
}

function draw() {
  const dt = min(frameRate() / 60, 1);
  busy = {};
  sceneManager.run(dt);
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
  keys.pressed = true;
}