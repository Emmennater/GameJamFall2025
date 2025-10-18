class SceneManager {
  constructor() {
    this.currentScene = null;
    this.nextScene = null;
    this.dialogue = new DialogueManager();
    this.transition = 1; // 0 - 1 (0 = transparent, 1 = opaque)
    this.fadeSpeed = 1/60; // 1 / # frames
    this.nlayers = 10;

    this.backArrow = new BackArrow(() => {
      // On Click
      this.transitionToScene(this.currentScene.getLastScene(), true);
    });
  }

  setScene(scene) {
    this.currentScene = scene;
    this.nextScene = null;
    this.transition = 1;
  }

  transitionToScene(scene, isBack = false) {
    if (!isBack) scene.setLastScene(this.currentScene);
    this.nextScene = scene;
    this.transition = 0;
    soundManager.play('transition');
  }

  runSpeaking() {
    for (const characterEntity of this.currentScene.characterEntities) {
      const character = characterEntity.character;
      if (!character.speaking) continue;
      
      const dialogue = character.getNextDialogue();

      if (dialogue) {
        this.dialogue.scheduleDialogue(dialogue);
        break;
      }
    }
  }

  runTransitions(dt) {
    if (this.transition < 1) {
      this.transition += this.fadeSpeed * dt;
    } else {
      this.transition = 1;
    }
    if (this.nextScene != null && this.transition > 0.5) {
      this.currentScene = this.nextScene;
      this.nextScene = null;
    }
  }

  run(dt) {
    this.runTransitions(dt);
    this.backArrow.run(dt);
    this.currentScene.run(dt);
    this.runSpeaking();
    this.dialogue.run(dt);
  }
  
  draw() {
    const fade = (1 - abs(this.transition - 0.5) * 2);
    
    // Draw each layer
    for (let layer = 0; layer < this.nlayers; layer++) {
      this.currentScene.draw(layer);
    }

    this.dialogue.draw();

    if (this.transition > 0.5 && this.currentScene.getLastScene() != null) {
      this.backArrow.draw();
    }

    background(0, 0, 0, fade * 255);
  }
}