
class TextBox {
  constructor(getText, getTransform) {
    this.text = "";
    this.getText = getText;
    this.getTransform = getTransform;
  }

  run(dt) {
    this.text = this.getText(dt);
    this.transform = this.getTransform(dt);

    // Set default values
    this.text ||= "";
    this.transform.x ||= 0;
    this.transform.y ||= 0;
    this.transform.w ||= 200;
    this.transform.h ||= 50;
    this.transform.marginX ||= 10;
    this.transform.marginY ||= 10;
    this.transform.paddingX ||= 10;
    this.transform.paddingY ||= 10;
    this.transform.fontSize ||= 20;
    this.transform.strokeWeight ||= 4;
    this.transform.backgroundColor ||= color(255);
  }

  draw() {
    if (!this.transform) return;
    const x = this.transform.x;
    const y = this.transform.y;
    const w = this.transform.w;
    const h = this.transform.h;
    const marginX = this.transform.marginX;
    const marginY = this.transform.marginY;
    const paddingX = this.transform.paddingX;
    const paddingY = this.transform.paddingY;
    const fontSize = this.transform.fontSize;
    const sw = this.transform.strokeWeight;
    const bgCol = this.transform.backgroundColor;
    
    // Box
    fill(bgCol);
    stroke(0);
    strokeWeight(sw);
    rect(x, y, w, h, 20);
    
    // Text
    textSize(fontSize);
    textAlign(LEFT, TOP);
    fill(0);
    noStroke();
    const wrappedText = wrapText(this.text, w - paddingX * 2);
    text(wrappedText, x + paddingX, y + paddingY);
  }
}

class Button extends TextBox {
  constructor(getText, getTransform, onClick = () => {}) {
    super(getText, (dt) => {
      let transform = getTransform(dt);
      if (transform && this.isHovered()) transform.backgroundColor = color(200);
      return transform;
    });
    this.onClick = onClick;
  }

  isHovered() {
    if (!this.transform) return false;
    const x = this.transform.x;
    const y = this.transform.y;
    const w = this.transform.w;
    const h = this.transform.h;
    return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  }

  run(dt) {
    super.run(dt);

    if (mouse.clicked) {
      // Check if the mouse is inside the button
      const x = this.transform.x;
      const y = this.transform.y;
      const w = this.transform.w;
      const h = this.transform.h;
      if (this.isHovered()) {
        this.onClick(this.text);
      }
    }
  }
}

class BackArrow extends Button {
  constructor(onClick) {
    super(
      () => "Back",
      () => {
        return {
          x: 10,
          y: 10,
          w: 85,
          h: 40,
          marginX: 10,
          marginY: 10,
          paddingX: 20,
          paddingY: 10,
          fontSize: 20,
          strokeWeight: 2
        };
      },
      onClick
    );
  }

  run(dt) {
    super.run(dt);
  }

  draw() {
    super.draw();
  }
}

class ReturnArrow extends Button {
  constructor(onClick) {
    super(
      () => "Return",
      () => {
        return {
          x: width - 105,
          y: 10,
          w: 100,
          h: 40,
          marginX: 10,
          marginY: 10,
          paddingX: 20,
          paddingY: 10,
          fontSize: 20,
          strokeWeight: 2
        };
      },
      onClick
    );
  }

  run(dt) {
    super.run(dt);
  }
  
  draw() {

    super.draw();
  }
}
