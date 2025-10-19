// Items
// - pearl
// - ruby
// - moon jelly candy
// - drift glass
// - magic scroll
// - coins

// Shop items
// - poison drink

class ItemEntity extends Entity {
  constructor(name, getTransform, tags) {
    super(getTransform);
    this.name = name;
    this.tags = tags;
  }

  buy() {
    const shopkeeper = characters["Nerissa"];

    if (shopkeeper.nextDialogue === "first-greeting") return;

    // shopkeeper.setEnterDialogue("collector" + this.name);
    shopkeeper.startSpeaking("collector" + this.name);
  }

  onClick() {
    if (busy["dialogue"]) return;
    if (this.tags.forSale) return this.buy();
    player.addItem(this.name);
    this.destroy();
  }
  
  render(x, y, w, h) {
    const img = images[this.name];
    if (img) {
      let aspect = img.width / img.height;
      h = w / aspect;
      imageMode(CENTER);
      image(img, x, y, w, h);
    } else {
      fill(0, 0, 255);
      noStroke();
      rect(x - w / 2, y - h / 2, w, h);
    }
  }
}