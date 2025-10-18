class SceneManager {
  constructor() {
    this.currentScene = null;
    this.nextScene = null;
    this.transition = 1; // 0 - 1 (0 = transparent, 1 = opaque)
    this.fadeSpeed = 1/60; // 1 / # frames
    this.nlayers = 10;
  }

  setScene(scene) {
    this.currentScene = scene;
    this.nextScene = null;
    this.transition = 1;
  }

  transitionToScene(scene) {
    this.nextScene = scene;
    this.transition = 0;
    soundManager.play('transition');
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
    this.currentScene.run(dt);
  }
  
  draw() {
    const fade = (1 - abs(this.transition - 0.5) * 2);
    
    // Draw each layer
    for (let layer = 0; layer < this.nlayers; layer++) {
      this.currentScene.draw(layer);
    }

    background(0, 0, 0, fade * 255);
  }
}