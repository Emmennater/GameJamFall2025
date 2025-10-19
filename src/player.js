class Player {
  constructor(name = "Player") {
    this.name = name;
    this.items = [];
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
}