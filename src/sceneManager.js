class SceneManager {
  constructor() {
    this.currentScene = null;
    this.nextScene = null;
    this.dialogue = null;
    this.giftDialogue = null;
    this.transition = 1; // 0 - 1 (0 = transparent, 1 = opaque)
    this.fadeSpeed = 1/60; // 1 / # frames
    this.nlayers = 10;

    this.backArrow = new BackArrow(() => {
      // On Click
      this.transitionToScene(this.currentScene.getLastScene(), true);
    });
    this.returnArrow = new ReturnArrow(() => {
      // On Click
      if (this.giftDialogue) this.giftDialogue = null;
      else if (this.dialogue) this.dialogue.exit();
    });
    this.giveButton = new GiveButton()
  }

  setScene(scene) {
    if (this.currentScene) this.currentScene.onExit();
    this.currentScene = scene;
    this.currentScene.onEnter();
    this.nextScene = null;
    this.transition = 1;
  }

  transitionToScene(scene, isBack = false) {
    if (!isBack) scene.setLastScene(this.currentScene);
    this.nextScene = scene;
    this.transition = 0;
  }

  runSpeaking() {
    this.dialogue = null;
    for (const characterEntity of this.currentScene.characterEntities) {
      const character = characterEntity.character;
      if (!character.speaking) continue;
      this.dialogue = character.getDialogue();
    }
  }

  getSpeakingCharacter() {
    for (const characterEntity of this.currentScene.characterEntities) {
      const character = characterEntity.character;
      if (!character.speaking) continue;
      return character;
    }
    return null;
  }

  getGift(callback) {
    let options = [];

    for (const item of player.items) {
      options.push({text: item});
    }

    if (options.length == 0) {
      callback(null);
      return null;
    }

    this.giftDialogue = new DialogueBox('', 'none', 'What do you want to gift?',
      new Prompt('', options, (choice) => {
        this.giftDialogue = null;
        callback(choice.text);
      }),
    );
  }

  reset() {
    player = new Player();
    characters = getCharacters();
  }

  runTransitions(dt) {
    if (this.transition < 1) {
      this.transition += this.fadeSpeed * dt;
    } else {
      this.transition = 1;
    }
    if (this.nextScene != null && this.transition > 0.5) {
      if (this.currentScene) this.currentScene.onExit();
      this.currentScene = this.nextScene;
      this.currentScene.onEnter();
      this.nextScene = null;
    }
  }

  run(dt) {
    if (this.transition > 0.5 && this.currentScene.getLastScene() != null && !this.dialogue && !player.isDead()) {
      this.backArrow.run(dt);
    }

    if (this.dialogue && !this.currentScene.isDark) this.returnArrow.run(dt);
    if (this.dialogue && !this.currentScene.isDark) this.giveButton.run(dt);

    this.runTransitions(dt);
    this.runSpeaking();
    if (this.giftDialogue) this.giftDialogue.run(dt);
    else if (this.dialogue) this.dialogue.run(dt); // Must be before scene because of busy wait
    this.currentScene.run(dt);
  }
  
  draw() {
    background(0);
    
    const fade = (1 - abs(this.transition - 0.5) * 2);
    
    // Draw each layer
    for (let layer = 0; layer < this.nlayers; layer++) {
      this.currentScene.draw(layer);
    }

    if (this.giftDialogue) this.giftDialogue.draw();
    else if (this.dialogue) this.dialogue.draw();

    if (this.transition > 0.5 && this.currentScene.getLastScene() != null && !this.dialogue && !player.isDead()) {
      this.backArrow.draw();
    }

    if (this.dialogue && !this.currentScene.isDark) this.returnArrow.draw();
    if (this.dialogue && !this.currentScene.isDark) this.giveButton.draw();

    background(0, 0, 0, fade * 255);
  }
}