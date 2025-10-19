class Player {
  constructor(name = "Player") {
    this.name = name;
    this.items = [];
    this.dead = false;
  }

  isDead() {
    return this.dead;
  }

  kill(Scene = GameOverDark) {
    this.dead = true;
    setTimeout(() => {
      sceneManager.transitionToScene(new Scene(), true);
    }, 2000);
  }

  addItem(item) {
    this.items.push(item);
  }

  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }

  hasItem(item) {
    return this.items.includes(item);
  }

  hasItems(items) {
    return items.every(item => this.hasItem(item));
  }
}