class SceneManager {
  constructor() {
    this.currentScene = null;
    this.nextScene = null;
    this.dialogue = null;
    this.transition = 1; // 0 - 1 (0 = transparent, 1 = opaque)
    this.fadeSpeed = 1/60; // 1 / # frames
    this.nlayers = 10;

    this.backArrow = new BackArrow(() => {
      // On Click
      this.transitionToScene(this.currentScene.getLastScene(), true);
    });
    this.returnArrow = new ReturnArrow(() => {
      // On Click
      if (this.dialogue) this.dialogue.exit();
    })
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
    this.dialogue = null;
    for (const characterEntity of this.currentScene.characterEntities) {
      const character = characterEntity.character;
      if (!character.speaking) continue;
      this.dialogue = character.getDialogue();
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
    if (this.transition > 0.5 && this.currentScene.getLastScene() != null && !this.dialogue) {
      this.backArrow.run(dt);
    }

    if (this.dialogue) this.returnArrow.run(dt);

    this.runTransitions(dt);
    this.runSpeaking();
    if (this.dialogue) this.dialogue.run(dt); // Must be before scene because of busy wait
    this.currentScene.run(dt);
  }
  
  draw() {
    background(0);
    
    const fade = (1 - abs(this.transition - 0.5) * 2);
    
    // Draw each layer
    for (let layer = 0; layer < this.nlayers; layer++) {
      this.currentScene.draw(layer);
    }

    if (this.dialogue) this.dialogue.draw();

    if (this.transition > 0.5 && this.currentScene.getLastScene() != null && !this.dialogue) {
      this.backArrow.draw();
    }

    if (this.dialogue) this.returnArrow.draw();

    background(0, 0, 0, fade * 255);
  }
}