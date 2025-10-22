function preload() {
  dialogueJSON = {};
  dialogueJSON.anglerfish = loadJSON("dialogue/anglerfish.json");
  dialogueJSON.anglerfishgive = loadJSON("dialogue/anglerfishgive.json");
  dialogueJSON.anglerfishlove = loadJSON("dialogue/anglerfishlove.json");
  dialogueJSON.lionfish = loadJSON("dialogue/lionfish.json");
  dialogueJSON.lionfishgive = loadJSON("dialogue/lionfishgive.json");
  dialogueJSON.lionfishlove = loadJSON("dialogue/lionfishlove.json");
  dialogueJSON.nolight = loadJSON("dialogue/nolight.json");
  dialogueJSON.octo = loadJSON("dialogue/octo.json");
  dialogueJSON.octokill = loadJSON("dialogue/octokill.json");
  dialogueJSON.octolion = loadJSON("dialogue/octolion.json");
  dialogueJSON.octolumi = loadJSON("dialogue/octolumi.json");
  dialogueJSON.octomilk = loadJSON("dialogue/octomilk.json");
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
  images.ship3 = loadImage("images/ship3.png");
  images.ship4 = loadImage("images/ship4.png");
  images.ship_arriving = loadImage("images/ship_arriving.png");
  images.shop_distance = loadImage("images/shop_distance.png");
  images.shop = loadImage("images/shop.png");
  images.coral1 = loadImage("images/coral1.png");
  images.coral2 = loadImage("images/coral2.png");
  images.coral3 = loadImage("images/coral3.png");
  images.coral4 = loadImage("images/coral4.png");
  images.dark1 = loadImage("images/dark1.png");
  images.dark2 = loadImage("images/dark2.png");
  images.dark3 = loadImage("images/dark3.png");
  images.shark = loadImage("images/shark.png");
  images.shark_game_over = loadImage("images/shark_game_over.png");
  
  // Characters
  images["lion-neutral"] = loadImage("images/lion-neutral.png");
  images["lion-blush"] = loadImage("images/lion-blush.png");
  images["lion-upset"] = loadImage("images/lion-upset.png");
  images["lion-upset"] = loadImage("images/lion-upset.png");
  images["lion-talk"] = loadImage("images/lion-talk.png");
  images["lumi-neutral"] = loadImage("images/lumi-neutral.png");
  images["lumi-smile"] = loadImage("images/lumi-smile.png");
  images["lumi-shy"] = loadImage("images/lumi-shy.png");
  images["lumi-talk"] = loadImage("images/lumi-talk.png");
  images["octo-neutral"] = loadImage("images/takara-neutral.png");
  images["octo-intense"] = loadImage("images/takara-intense.png");
  
  // Items
  images.driftglass = loadImage("images/driftglass.png");
  images.moonjellycandy = loadImage("images/moonjellycandy.png");
  images.pearl = loadImage("images/pearl.png");
  images.magicscroll = loadImage("images/magicscroll.png");
  // images.glowrod = loadImage("images/glowrod.png");
  images.ruby = loadImage("images/ruby.png");
  images.poisonedcoralmilk = loadImage("images/poisonedcoralmilk.png");
  images.coralmilk = loadImage("images/poisonedcoralmilk.png");

  // Videos
  videos = {};
  videos.menu = createVideo("videos/menu.mp4");

  for (let video of Object.values(videos)) {
    video.volume(0);
    video.hide();
    video.loop();
  }
  
  // gifs = {};
  // gifs.shipwreck = loadImage("images/shipwreck.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  debug = false;
  fonts = {main:"Arial"}
  busy = {};
  mouse = { clicked: false };
  keys = {};
  player = new Player();
  characters = getCharacters();
  soundManager = getSoundManager();
  sceneManager = new SceneManager();
  sceneManager.setScene(new Menu());
  
  // For mobile devices
  if (isMobile()) initMobileKeyboard();
}

function draw() {
  const dt = min(frameRate() / 60, 1);
  busy = {};
  sceneManager.run(dt);
  sceneManager.draw();
  mouse.clicked = false;
  keys = {};
}

function isLoaded() {
  return document.getElementById("defaultCanvas0") !== null;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Exit if canvas not created
  if (!isLoaded()) return;

  mouse.clicked = true;
  // if (sceneManager.currentScene instanceof CaveArea) return;
  // sceneManager.transitionToScene(new CaveArea);
}

function keyPressed() {
  keys[key] = true;
  keys.pressed = true;
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function initMobileKeyboard() {
  keyboard = new SimpleKeyboard.SimpleKeyboard({
    onChange: () => {},
    onKeyPress: input => {
      if (input == "{bksp}") input = "Backspace";
      else if (input == "{enter}") input = "Enter";
      else if (input == "{lock}") window.capsLock = !window.capsLock;
      else if (input == "{shift}") window.keyShift = !window.keyShift;
      
      if (window.keyShift && input !== "{shift}") { input = input.toUpperCase(); window.keyShift = false; }
      if (window.capsLock && input !== "{lock}") input = input.toUpperCase();
      
      key = input;
      keys[input] = true;
      keys.pressed = true;
    }
  });
}

function hideMobileKeyboard() {
  document.getElementById("keyboard").style.display = "none";
  delete window.keyShift;
  delete window.capsLock;
}

function showMobileKeyboard() {
  document.getElementById("keyboard").style.display = "block";
}