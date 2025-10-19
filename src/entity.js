class Entity {
  constructor(getTransform) {
    this.getTransform = getTransform;
  }

  isHovered() {
    if (!this.transform) return false;
    const x = this.transform.x;
    const y = this.transform.y;
    const w = this.transform.w;
    const h = this.transform.h;
    return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
  }

  onClick() {
    print("Entity clicked!");
  }

  render(x, y, w, h) {
    fill(0);
    noStroke();
    rect(x - w / 2, y - h / 2, w, h);
  }

  run(dt) {
    this.transform = this.getTransform(dt);

    if (mouse.clicked) {
      if (this.isHovered()) {
        this.onClick();
      }
    }
  }

  draw() {
    const { x, y, w, h } = this.transform;
    this.render(x, y, w, h);
  }
}