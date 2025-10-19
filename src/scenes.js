const MAX_DEPTH = 10;

class Scene {
  constructor(parent) {
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
    this.bgImg = image.menu;
    this.lastScene = null;
    this.scenes = []; // List of nested scenes
    this.characterEntities = [];
    this.items = [];
    if (this.depth < MAX_DEPTH) {
      this.addScenes();
    }
  }
  
  addCharacter(characterName, sprite, relativeX, relativeY, relativeScale = 1) {
    const character = getCharacter(characterName);
    const transform = () => {
      let {x, y} = this.worldToScreen(relativeX, relativeY);
      let s = this.worldToScreenScale(relativeScale);
      let w = 300 * s;
      let h = 700 * s;

      if (sprite && images[sprite]) {
        w = images[sprite].width * s;
        h = images[sprite].height * s;
      }

      return {x, y, w, h};
    }
    const entity = new CharacterEntity(character, sprite, transform);

    this.characterEntities.push(entity);
  }

  addScene(scene, relativeX, relativeY) {
    const transform = () => {
      const {x, y} = this.worldToScreen(relativeX, relativeY);
      const w = 100;
      const h = 100;
      return {x, y, w, h};
    }
    const entity = new SceneEntity(scene, transform);
    this.scenes.push(entity);
  }

  addItem(item, relativeX, relativeY) {
    const transform = () => {
      const {x, y} = this.worldToScreen(relativeX, relativeY);
      const w = 50;
      const h = 50;
      return {x, y, w, h};
    }
    const entity = new ItemEntity(item, transform);
    this.items.push(entity);
  }

  addScenes() {}

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
    this.characterEntities.forEach(entity => entity.run(dt));
    this.scenes.forEach(entity => entity.run(dt));
    this.items.forEach(entity => entity.run(dt));

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
    }
    if (layer == 1) {
      this.scenes.forEach(entity => entity.draw());
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
    this.setBackground(images.menu);
    this.nameText = "";
  }

  run(dt) {
    if (keys.pressed) {
      const k = key.toLowerCase();
      if (k == "backspace") {
        this.nameText = this.nameText.slice(0, -1);
      } else if (k == "enter") {
        player.name = this.nameText;
        sceneManager.transitionToScene(new StartingArea(), true);
      } else if (k.length == 1) {
        this.nameText += key;
      }
    }
  }

  draw(layer) {
    super.draw(layer);

    if (layer == 5) {
      // Menu Text
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(width*0.05);
      textFont(fonts.main);
      text("Plenty of Fish in the Sea", width/2, height/2 - 100);
      
      // Enter name
      const cursor = frameCount % 60 < 30 ? "_" : " ";
      textSize(width*0.02);
      textAlign(CENTER, CENTER);
      textFont("monospace");
      text("Enter name: " + this.nameText + cursor, width/2, height/2);
    }
  }
}

class StartingArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.empty_floor);
  }
  
  addScenes() {
    this.addScene(this.createRandomScene([CaveArea, ShipArea, ShipArriving]), 0.3, 0.3);
    this.addScene(this.createRandomScene([CaveArea, ShipArea, ShipArriving]), 0.86, 0.32);
    this.addScene(this.createRandomScene([CaveArea]), 0.57, 0.78);
    this.addScene(this.createRandomScene([ShipArriving, ShipArea]), 0.15, 0.78);
    // this.addScene(this.createRandomScene([ShopDistance]), 0.15, 0.78);
  }
}

class CaveArea extends Scene {
  constructor(parent) {
    super(parent);
    this.addCharacter("Lionfish", null, 0.8, 0.6);
    this.setBackground(images.cave);
    this.addItem("ruby", 0.08, 0.85);
  }

  addScenes() {
    this.addScene(this.createRandomScene([CaveOpening]), 0.37, 0.72);
  }
}

class CaveOpening extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.cave_opening);
  }

  addScenes() {
    this.addScene(this.createRandomScene([ShipArea, CaveFloorDark]), 0.49, 0.57);
  }
}

class CaveFloorDark extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.cave_floor_dark);
  }

  addScenes() {
    this.addScene(this.createRandomScene([CaveArea, ShipArea, ShopDistance]), 0.79, 0.19);
    this.addScene(this.createRandomScene([CaveArea, ShipArea, ShopDistance]), 0.14, 0.26);
  }
}

class ShipArriving extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship_arriving);
  }

  addScenes() {
    this.addScene(new ShipArea2(this), 0.36, 0.86);
    this.addScene(this.createRandomScene([CaveArea, CaveFloorDark]), 0.11, 0.33);
  }
}

class ShipArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship);
  }

  addScenes() {
    this.addScene(new ShipArea2(this), 0.73, 0.46);
    this.addScene(new CaveArea(this), 0.85, 0.12);
  }
}

class ShipArea2 extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.ship2);
  }

  addScenes() {
    // this.addScene(new ShipArea2(this), 0.73, 0.46);
  }
}

class ShopDistance extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.shop_distance);
  }

  addScenes() {
    this.addScene(new Shop(this), 0.63, 0.46);
  }
}

class Shop extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.shop);
  }
}

class SceneEntity extends Entity {
  constructor(scene, getTransform) {
    super(getTransform);
    this.scene = scene;
  }

  onClick() {
    if (busy["dialogue"]) return;
    sceneManager.transitionToScene(this.scene);
  }

  render(x, y, w, h) {
    // if (debug) {
    //   noFill();
    //   stroke(255, 0, 0);
    //   strokeWeight(1);
    //   rect(x - w / 2, y - h / 2, w, h);
    // }

    textFont(fonts.main)
    textSize(60);
    fill(255, 40);
    noStroke();
    textAlign(CENTER, CENTER);
    text("?", x, y);
  }
}
