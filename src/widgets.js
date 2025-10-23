
class TextBox {
  constructor(getText, getTransform) {
    this.text = "";
    this.getText = getText;
    this.getTransform = getTransform;
  }

  run(dt) {
    this.text = this.getText(dt) || "";
    this.transform = this.getTransform(dt);

    this.transform.fontSize ||= 20;
    this.transform.paddingX ||= 10;
    this.transform.paddingY ||= 10;
    textFont(fonts.main);
    textSize(this.transform.fontSize);
    this.transform.w ||= textWidth(this.text) + this.transform.paddingX * 2;
    this.transform.h ||= this.transform.fontSize + this.transform.paddingY * 2;

    // Set default values
    this.transform.x ||= 0;
    this.transform.y ||= 0;
    this.transform.marginX ||= 10;
    this.transform.marginY ||= 10;
    this.transform.strokeWeight ||= 4;
    this.transform.backgroundColor ||= color(255);
  }

  draw() {
    if (!this.transform) return;
    
    const fontSize = this.transform.fontSize;
    textFont(fonts.main);
    textSize(fontSize);
    
    const x = this.transform.x;
    const y = this.transform.y;
    const paddingX = this.transform.paddingX;
    const paddingY = this.transform.paddingY;
    const w = this.transform.w;
    const h = this.transform.h;
    const marginX = this.transform.marginX;
    const marginY = this.transform.marginY;
    const wrappedText = wrapText(this.text, w - paddingX * 2);
    const sw = this.transform.strokeWeight;
    const bgCol = this.transform.backgroundColor;
    
    // Box
    fill(bgCol);
    stroke(0);
    strokeWeight(sw);
    rect(x-w/2, y-h/2, w, h, 20);
    
    // Text
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    text(wrappedText, x, y);
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
    return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
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
        soundManager.buttonClick();
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
          x: 60,
          y: 30,
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
          x: width - 70,
          y: 30,
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

class GiveButton extends Button {
  constructor() {
    super(
      () => "Give",
      () => {
        return {
          x: 55,
          y: 30,
          marginX: 10,
          marginY: 10,
          paddingX: 20,
          paddingY: 10,
          fontSize: 20,
          strokeWeight: 2
        };
      },
      () => {
        // On Click
        sceneManager.getGift((item) => {
          if (!item) return;
          const char = sceneManager.getSpeakingCharacter();
          char.giveItem(item);
        });
        // Correct item -> receive-item
        // Wrong item -> bad-item
      }
    );
  }
}

class ContinueButton extends Button {
  constructor(onClick) {
    super(
      () => "Continue",
      () => {
        return {
          x: width/2,
          y: 30,
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
}
