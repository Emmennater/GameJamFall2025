
class Scene {
  constructor() {
    this.lastScene = null;
    this.scenes = []; // List of nested scenes
    this.characterEntities = [];
    // this.dialogue.scheduleDialogue([
    //   new DialogueBox("Player", "Hello World! This is a test!",
    //     new Prompt("", [{text: "Bob"}, {text: "Alice"}, {text: "Charlie"}, {text: "Diana"}])
    //   ),
    // ]);
    
  }
  
  addCharacter(characterName, relativeX, relativeY) {
    const character = getCharacter(characterName);
    const transform = () => {
      const w = character.sprite.w;
      const h = character.sprite.h;
      const x = relativeX * width;
      const y = relativeY * height;
      return {x, y, w, h};
    }
    const entity = new CharacterEntity(character, transform);

    this.characterEntities.push(entity);
  }

  setLastScene(scene) {
    this.lastScene = scene;
  }

  getLastScene() {
    return this.lastScene;
  }

  run(dt) {
    this.characterEntities.forEach(entity => entity.run(dt));
  }

  draw(layer) {
    if (layer == 0) {
      this.drawBackground();
    }
    if (layer == 1) {
      this.characterEntities.forEach(entity => entity.draw());
    }
  }
}

class StartingArea extends Scene {
  constructor() {
    super();
    this.addCharacter("Lionfish", 0.8, 0.6);
  }

  drawBackground() {
    background(255, 0, 0);
  }
}

class CaveArea extends Scene {
  constructor() {
    super();
  }

  drawBackground() {
    background(0, 255, 0);
  }
}
