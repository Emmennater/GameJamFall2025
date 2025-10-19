const MAX_DEPTH = 5;

class Scene {
  constructor(parent) {
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : 0;
    this.bgImg = image.menu;
    this.lastScene = null;
    this.scenes = []; // List of nested scenes
    this.characterEntities = [];
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

  addScene(scene, relativeLeft, relativeRight, relativeTop, relativeBottom) {
    const transform = () => {
      const {x: left, y: top} = this.worldToScreen(relativeLeft, relativeTop);
      const {x: right, y: bottom} = this.worldToScreen(relativeRight, relativeBottom);
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;
      const w = Math.abs(left - right);
      const h = Math.abs(top - bottom);
      return {x, y, w, h};
    }
    const entity = new SceneEntity(scene, transform);
    this.scenes.push(entity);
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

    // if (debug) {
    //   if (mouse.clicked) {
    //     print(this.screenToWorld(mouseX, mouseY));
    //   }
    // }
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

class StartingArea extends Scene {
  constructor(parent) {
    super(parent);
    this.setBackground(images.empty_floor);
  }
  
  addScenes() {
    this.addScene(new CaveArea(this), 0.2, 0.4, 0.0, 0.2);
  }
}

class CaveArea extends Scene {
  constructor(parent) {
    super(parent);
    this.addCharacter("Lionfish", null, 0.8, 0.6);
    this.setBackground(images.cave);
  }

  addScenes() {
    this.addScene(new StartingArea(this), 0.25, 0.5, 0.5, 0.87);
  }
}

class SceneEntity extends Entity {
  constructor(scene, getTransform) {
    super(getTransform);
    this.scene = scene;
  }

  onClick() {
    sceneManager.transitionToScene(this.scene);
  }

  render(x, y, w, h) {
    if (debug) {
      noFill();
      stroke(255, 0, 0);
      strokeWeight(1);
      rect(x - w / 2, y - h / 2, w, h);
    }

    textSize(60);
    fill(255, 40);
    noStroke();
    textAlign(CENTER, CENTER);
    text("?", x, y);
  }
}
