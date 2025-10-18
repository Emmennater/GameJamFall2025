
class Scene {
  constructor() {
    this.scene = null;
    this.dialogue = new DialogueManager();
    this.dialogue.scheduleDialogue([
      // new DialogueBox("Player", "Hello World! This is a test!"),
      new Prompt("What is your name?", [{text: "Bob"}, {text: "Alice"}]),
    ]);
  }
  
  run(dt) {
    this.dialogue.run(dt);
  }

  draw(layer) {
    if (layer == 0) {
      this.drawBackground();
    }
    if (layer == 2) {
      this.dialogue.draw();
    }
  }
}

class StartingArea extends Scene {
  constructor() {
    super();
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
