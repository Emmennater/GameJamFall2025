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
  constructor(name, getTransform) {
    super(getTransform);
    this.name = name;
  }

  onClick() {
    if (busy["dialogue"]) return;
    player.addItem(this.name);
    this.destroy();
  }
  
  render(x, y, w, h) {
    const img = images[this.name];
    fill(0, 0, 255);
    noStroke();
    rect(x - w / 2, y - h / 2, w, h);
  }
}