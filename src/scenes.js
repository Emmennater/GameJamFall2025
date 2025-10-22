const MAX_DEPTH = 30;

class Scene {
  constructor(parent) {
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
    this.bgImg = images.menu;
    this.lastScene = null;
    this.scenes = []; // List of nested scenes
    this.characterEntities = [];
    this.items = [];
    this.isDark = false;
    this.scrollEffectiveness = 1.0; // How effective the magic scroll is at detecting danger in this scene
    
    if (this.depth < MAX_DEPTH) {
      this.addScenes();
    }
  }
  
  addCharacter(characterName, sprite, relativeX, relativeY, relativeScale = 1, rarity = 1) {
    if (Math.random() > rarity) return;
    const character = getCharacter(characterName);
    const transform = () => {
      let {x, y} = this.worldToScreen(relativeX, relativeY);
      let s = this.worldToScreenScale(relativeScale);
      let h = 1000 * s;
      let w = 600 * s;

      if (sprite && images[sprite]) {
        let aspect = images[sprite].width / images[sprite].height;
        w = h * aspect;
        // w = images[sprite].width * s;
        // h = images[sprite].height * s;
      }

      return {x, y, w, h};
    }
    const entity = new CharacterEntity(character, sprite, transform);

    this.characterEntities.push(entity);
  }

  addScene(scenes, relativeX, relativeY, count=1) {
    for (let i = 0; i < count; i++) {
      // Pop random scene
      const idx = Math.floor(Math.random() * scenes.length);
      const SceneClass = scenes.splice(idx, 1)[0];
      const scene = new SceneClass(this);

      const transform = () => {
        const {x, y} = this.worldToScreen(relativeX, relativeY);
        const w = 100;
        const h = 100;
        return {x, y, w, h};
      }
      const entity = new SceneEntity(scene, transform);
      this.scenes.push(entity);
    }
  }

  addItem(items, relativeX, relativeY, tags={}, rarity=0.5) {
    const item = items[Math.floor(Math.random() * items.length)];
    if (!item) return;
    if (Math.random() > rarity) return;
    const transform = () => {
      const {x, y} = this.worldToScreen(relativeX, relativeY);
      const w = 100;
      const h = 100;
      return {x, y, w, h};
    }
    const entity = new ItemEntity(item, transform, tags);
    this.items.push(entity);
  }

  addScenes() {}

  isDangerous() {
    return false;
  }

  onEnter() {}

  onExit() {}

  setBackground(img) {
    this.bgImg = img;
  }

  setLastScene(scene) {
    this.lastScene = scene;
  }

  getLastScene() {
    return this.lastScene;
  }

  createRandomScene(sceneList) {
    const Scene = sceneList[Math.floor(Math.random() * sceneList.length)];
    return new Scene(this);
  }

  worldToScreenScale(x) {
    let {x: a, y: b} = this.worldToScreen(0, 0);
    let {x: c, y: d} = this.worldToScreen(x, 0);
    return (c - a) / 2000;
  }

  worldToScreen(x, y) {
    // x and y are between 0 and 1
    let aspect = this.bgImg.width / this.bgImg.height;
    let w = width;
    let h = width / aspect;
    if (h > height) {
      w = height * aspect;
      h = height;
    }

    // if x is 0.5 then the mapped x should be width/2
    // if y is 0.5 then the mapped y should be height/2
    // if x is 0 then the mapped x should be width/2 - w/2
    // if y is 0 then the mapped y should be height/2 - h/2
    // if x is 1 then the mapped x should be width/2 + w/2
    // if y is 1 then the mapped y should be height/2 + h/2
    let mappedX = x * w + width/2 - w/2;
    let mappedY = y * h + height/2 - h/2;
    return {x: mappedX, y: mappedY};
  }

  screenToWorld(x, y) {
    // x is between 0 and width
    // y is between 0 and height
    let aspect = this.bgImg.width / this.bgImg.height;
    let w = width;
    let h = width / aspect;
    if (h > height) {
      w = height * aspect;
      h = height;
    }

    // if x is width/2 then the mapped x should be 0.5
    // if y is height/2 then the mapped y should be 0.5
    // if x is width/2 - w/2 then the mapped x should be 0
    // if y is height/2 - h/2 then the mapped y should be 0
    // if x is width/2 + w/2 then the mapped x should be 1
    // if y is height/2 + h/2 then the mapped y should be 1
    let mappedX = (x - width/2 + w/2) / w;
    let mappedY = (y - height/2 + h/2) / h;
    return {x: mappedX, y: mappedY};
  }

  run(dt) {
    if (!this.isDark) {
      this.characterEntities.forEach(entity => entity.run(dt));
      this.scenes.forEach(entity => entity.run(dt));
      this.items.forEach(entity => entity.run(dt));
    }

    // Destroy items that have been destroyed
    this.items = this.items.filter(entity => !entity.isDestroyed);

    if (debug) {
      if (mouse.clicked) {
        let { x, y } = this.screenToWorld(mouseX, mouseY);
        x = Math.round(x * 100) / 100;
        y = Math.round(y * 100) / 100;
        print(x, y);
      }
    }
  }

  draw(layer) {
    if (layer == 0) {
      imageMode(CENTER);
      let aspect = this.bgImg.width / this.bgImg.height;
      let w = width;
      let h = width / aspect;
      if (h > height) {
        w = height * aspect;
        h = height;
      }
      image(this.bgImg, width/2, height/2, w, h);
      if (this.isDark) {
        fill(0, 0, 0, 200);
        rect(0, 0, width, height);
      }
    }
    if (layer == 1) {
      if (!this.isDark) {
        this.scenes.forEach(entity => entity.draw());
      }
    }
    if (layer == 2) {
      this.items.forEach(entity => entity.draw());
    }
    if (layer == 3) {
      this.characterEntities.forEach(entity => {
        if (!entity.character.isSpeaking()) {
          entity.draw()
        }
      });
    }

    // Test
    // let pos = this.worldToScreen(0, 0);
    // stroke(255, 0, 0);
    // strokeWeight(10);
    // point(pos.x, pos.y);
  }
}

class Menu extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(videos.menu || images.menu);
    this.nameText = "";
    this.nameSet = false;
  }

  onEnter() {
    super.onEnter();
    if (isMobile()) showMobileKeyboard();
    sceneManager.reset();
  }

  onExit() {
    super.onExit();
    if (isMobile()) hideMobileKeyboard();
  }

  run(dt) {
    if (keys.pressed && !this.nameSet) {
      const k = key.toLowerCase();
      if (k == "backspace") {
        this.nameText = this.nameText.slice(0, -1);
      } else if (k == "enter") {
        player.name = this.nameText;
        this.nameSet = true;
        sceneManager.transitionToScene(new StartingArea(), true);
      } else if (k.length == 1) {
        this.nameText += key;
      }
    }
  }

  draw(layer) {
    super.draw(layer);

    const titleHeight = isMobile() ? height * 0.25 : height * 0.35;
    const nameHeight = isMobile() ? height * 0.35 : height * 0.425;

    if (layer == 5) {
      // Menu Text
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(width*0.05);
      textFont(fonts.main);
      text("Plenty of Fish in the Sea", width/2, titleHeight);
      
      // Enter name
      if (!this.nameSet) {
        const cursor = frameCount % 60 < 30 ? "_" : " ";
        textSize(width*0.02);
        textAlign(CENTER, CENTER);
        textFont("monospace");
        text("Enter name: " + this.nameText + cursor, width/2, nameHeight);
      }
    }
  }
}

class GameOverScene extends Scene {
  constructor(parent) {
    super(parent);
    this.continueButton = new ContinueButton(() => sceneManager.transitionToScene(new Menu(), true));
  }

  run(dt) {
    super.run(dt);

    if (!sceneManager.dialogue) this.continueButton.run(dt);

    if (keys.pressed) {
      sceneManager.transitionToScene(new Menu(), true);
    }
  }

  draw(layer) {
    super.draw(layer);
    if (layer == 6 && !sceneManager.dialogue) this.continueButton.draw();
  }
}

class GameOverShark extends GameOverScene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.shark_game_over);
  }

  draw(layer) {
    super.draw(layer);

    if (layer == 5) {
      // Menu Text
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(width*0.05);
      textFont(fonts.main);
      text("Game Over", width/2, height * 0.1);
    }
  }
}

class GameOverDark extends GameOverScene {
  constructor(parent) {
    super(parent);
  }

  draw(layer) {
    super.draw(layer);

    if (layer == 5) {
      background(0);

      // Menu Text
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(width*0.05);
      textFont(fonts.main);
      text("Game Over", width/2, height * 0.5);
    }
  }
}

class GameOverKill extends GameOverScene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.empty_floor);
    this.addCharacter("Lumi", "lumi-neutral", 0.2, 0.6);
    this.addCharacter("Lion-chan", "lion-neutral", 0.8, 0.6);
  }

  draw(layer) {
    super.draw(layer);

    if (layer == 5) {
      const lumiAlive = !characters["Lumi"].isDead();
      const lionAlive = !characters["Lion-chan"].isDead();
      let txt = "You win!";

      if (lumiAlive && lionAlive) {
        txt = "Eternal Happiness!";
      } else if (!lumiAlive && !lionAlive) {
        txt = "Forever Alone.";
      } else if (lumiAlive) {
        txt = "Lion-chan is dead";
      } else if (lionAlive) {
        txt = "Lumi is dead";
      }

      // Menu Text
      fill(255);
      stroke(0);
      strokeWeight(4);
      textAlign(CENTER, CENTER);
      textSize(width*0.04);
      textFont(fonts.main);
      text(txt, width/2, height * 0.5);
    }
  }
}

class StartingArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.empty_floor);
  }
  
  addScenes() {
    let areas = [CaveArea, ShipArea, ShipArriving, ShipArea]
    this.addScene(areas, 0.3, 0.3);
    this.addScene(areas, 0.86, 0.32);
    this.addScene(areas, 0.57, 0.78);
    this.addScene(areas, 0.15, 0.78);
    // this.addScene(this.createRandomScene([ShopDistance]), 0.15, 0.78);
  }
}

class CaveArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.cave);
    this.addCharacter("Lumi", "lumi-neutral", 0.8, 0.6, 1.0, 0.5);
    this.addItem(["moonjellycandy", "pearl", "driftglass"], 0.08, 0.85);
  }

  run(dt) {
    super.run(dt);
    if (player.hasItem("glowrod")) {
      this.setBackground(images.cave_lit);
    } else {
      this.setBackground(images.cave);
    }
  }

  addScenes() {
    this.addScene([CaveOpening], 0.37, 0.72);
  }
}

class CaveOpening extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.cave_opening);
  }

  isDangerous() {
    return !player.hasItem("glowrod");
  }

  onEnter() {
    super.onEnter();
    if (!player.hasItem("glowrod")) {
      this.isDark = true;
      this.addCharacter("{player}", null, 0.5, 0.5);
      characters["{player}"].startSpeaking("dark-entry");
    }
  }

  addScenes() {
    this.addScene([CaveFloorDark, CoralArea], 0.49, 0.57);
  }
}

class CaveFloorDark extends Scene {
  constructor(parent) {
    super(parent);
    this.scrollEffectiveness = 0.5;
    this.setBackground(images.cave_floor_dark);
  }

  addScenes() {
    let areas = [ShipArea, ShopDistance, CaveArea, CaveFloorDark, SharkArea];
    this.addScene(areas, 0.79, 0.19);
    this.addScene(areas, 0.14, 0.26);
  }
}

class ShipArriving extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship_arriving);
  }

  addScenes() {
    this.addScene([ShipArea2], 0.36, 0.86);
    this.addScene([CaveArea, CaveFloorDark], 0.11, 0.33);
  }
}

class ShipArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship);
  }

  addScenes() {
    this.addScene([ShipArea2], 0.73, 0.46);
    this.addScene([ShipArea3, ShipArea4], 0.46, 0.61);
    this.addScene([CaveArea, CaveFloorDark], 0.85, 0.12);
  }
}

class ShipArea2 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship2);
    this.addItem(["moonjellycandy", "driftglass","poisonedcoralmilk"], 0.94, 0.92, {}, 0.4);
  }
}

class ShipArea3 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship3);
    this.addCharacter("Lion-chan", "lion-neutral", 0.8, 0.6);
    this.addItem(["moonjellycandy", "ruby"], 0.16, 0.87);
  }
}

class ShipArea4 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship4);
    this.addCharacter("Lion-chan", "lion-neutral", 0.18, 0.7, 0.8, 0.7);
    this.addItem(["moonjellycandy", "ruby"], 0.78, 0.8, {}, 0.4);
  }
}

class CoralArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.coral1);
    this.addItem(["pearl"], 0.9, 0.75, {}, 0.1);
    // this.addItem(["pearl"], 0.26, 0.74, {}, 0.1);
    this.addCharacter("Takara", "octo-neutral", 0.23, 0.7);
  }

  addScenes() {
    this.addScene([CoralArea2, CoralArea4], 0.77, 0.38);
  }
}

class CoralArea2 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.coral2);
    this.addItem(["pearl"], 0.78, 0.61, {}, 0.1);
  }

  addScenes() {
    this.addScene([CoralArea4, DarkArea], 0.25, 0.15);
    this.addScene([CoralArea3], 0.75, 0.4);
  }
}

class CoralArea3 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.coral3);
    this.addItem(["pearl","driftglass","ruby","poisonedcoralmilk"], 0.49, 0.6, {}, 0.5);
  }
}

class CoralArea4 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.coral4);
  }

  addScenes() {
    this.addScene([CaveArea, CaveFloorDark], 0.25, 0.15);
  }
}

class DarkArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.dark1);
  }

  addScenes() {
    this.addScene([DarkArea2, DarkArea3], 0.46, 0.65);
  }
}

class DarkArea2 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.dark2);
    this.addItem(["poisonedcoralmilk"], 0.4, 0.92, {}, 0.3);
  }

  addScenes() {
    this.addScene([DarkArea3, DarkArea3, DarkArea3, SharkArea], 0.25, 0.74);
  }
}

class DarkArea3 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.dark3);
    this.addItem(["pearl","ruby","poisonedcoralmilk"], 0.4, 0.92, {}, 0.2);
  }

  addScenes() {
    this.addScene([CoralArea, CaveFloorDark, CoralArea, CaveFloorDark, SharkArea], 0.71, 0.72);
  }
}

class SharkArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.shark);
  }

  isDangerous() {
    return true;
  }

  onEnter() {
    super.onEnter();
    player.kill(GameOverShark);
  }
}

class ShopDistance extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.shop_distance);
  }

  addScenes() {
    this.addScene([Shop], 0.63, 0.46);
  }
}

class Shop extends Scene {
  constructor(parent) {
    super(parent);
    // let tags = {forSale: true};
    let tags = {};
    this.setBackground(images.shop);
    this.addItem(["ruby"], 0.39, 0.52, tags, 0.5);
    this.addItem(["moonjellycandy"], 0.46, 0.52, tags, 0.5);
    this.addItem(["driftglass"], 0.53, 0.52, tags, 0.5);
    this.addItem(["pearl", "poisonedcoralmilk"], 0.61, 0.52, tags, 0.5);
    // this.addCharacter("Nerissa", null, 0.85, 0.6);
  }
}

class SceneEntity extends Entity {
  constructor(scene, getTransform) {
    super(getTransform);
    this.scene = scene;
    this.scrollMalfunction = Math.random() < 0.5 - 0.5 * this.scene.parent.scrollEffectiveness;
  }

  onEnter() {
    super.onEnter();
  }

  onClick() {
    if (busy["dialogue"]) return;
    sceneManager.transitionToScene(this.scene);
  }

  getDangerProbability() {
    const eff = this.scene.parent.scrollEffectiveness;
    const p = this.scene.isDangerous() ? 0.5 + 0.5 * eff : 0.5 - 0.5 * eff;
    const d = this.scrollMalfunction ? 1 - p : p;
    return d;
  }

  render(x, y, w, h) {
    // if (debug) {
    //   noFill();
    //   stroke(255, 0, 0);
    //   strokeWeight(1);
    //   rect(x - w / 2, y - h / 2, w, h);
    // }

    let txt = "?";

    if (player.hasItem("magicscroll")) {
      const d = this.getDangerProbability();
      txt = 1 ? `${d.toFixed(2) * 100}%` : "?";
      textSize(40);
    } else {
      textSize(60);
    }

    textFont(fonts.main)
    fill(255, 40);
    noStroke();
    textAlign(CENTER, CENTER);
    text(txt, x, y);
  }
}
