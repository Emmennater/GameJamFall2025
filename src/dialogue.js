
class Prompt {
  constructor(text, options) {
    this.text = text;
    this.options = options;
    this.selected = 0; // index of the currently selected option
    this.done = false;
    this.choice = null; // stores the chosen option

    // Input handling
    document.addEventListener('keydown', e => {
      if (this.done) return;

      if (e.key === 'ArrowUp') {
        this.selected = (this.selected - 1 + this.options.length) % this.options.length;
      } else if (e.key === 'ArrowDown') {
        this.selected = (this.selected + 1) % this.options.length;
      } else if (e.key === 'Enter') {
        this.done = true;
        this.choice = this.options[this.selected];
      }
    });
  }

  restart() {
    this.selected = 0;
    this.done = false;
    this.choice = null;
  }

  isDone() {
    return this.done;
  }

  run(dt) {
    // no time-dependent animation for now, but could add one later
  }

  draw() {
    const fontSize = 20;
    const marginY = 20;
    const paddingX = 20;
    const paddingY = 10;
    const optionLeft = width * 0.2;
    const optionWidth = width * 0.6;
    let optionHeights = [];
    let totalHeight = 0;

    textSize(fontSize);
    textAlign(LEFT, TOP);

    // Compute heights for each option
    for (const option of this.options) {
      const txt = wrapText(option.text, optionWidth - paddingX * 2);
      const nLines = txt.split('\n').length;
      const optionHeight = fontSize * nLines + paddingY * 2;
      optionHeights.push(optionHeight);
      totalHeight += optionHeight + marginY;
    }

    // Draw prompt text above the options
    const promptFontSize = 24;
    const promptText = wrapText(this.text, optionWidth);
    const promptHeight = promptText.split('\n').length * promptFontSize;
    const promptBoxH = promptHeight + 20;
    const promptTop = height / 2 - totalHeight / 2 - promptBoxH - marginY;
    
    textSize(promptFontSize);
    fill(255);
    stroke(0);
    strokeWeight(4);
    rect(optionLeft, promptTop, optionWidth, promptBoxH, 20);
    
    noStroke();
    fill(0);
    text(promptText, optionLeft + paddingX, promptTop + paddingY);

    // Draw options
    let optionTop = height / 2 - totalHeight / 2;
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const txt = wrapText(option.text, optionWidth - paddingX * 2);

      if (i === this.selected) {
        fill(200, 255, 200); // highlight color
      } else {
        fill(255);
      }

      stroke(0);
      strokeWeight(4);
      rect(optionLeft, optionTop, optionWidth, optionHeights[i], 20);

      noStroke();
      fill(0);
      textSize(fontSize);
      text(txt, optionLeft + paddingX, optionTop + paddingY);

      optionTop += optionHeights[i] + marginY;
    }
  }
}

class DialogueManager {
  constructor() {
    this.schedule = [];
    this.currentIdx = 0;

    document.addEventListener('mousedown', () => {
      if (this.isDone()) return;
      if (this.schedule[this.currentIdx].isDone()) {
        this.currentIdx += 1;
      }
    });
  }

  isDone() {
    return this.currentIdx >= this.schedule.length;
  }

  scheduleDialogue(dialogueBoxes) {
    this.schedule = dialogueBoxes;
    this.currentIdx = 0;
  }

  run(dt) {
    if (this.currentIdx >= this.schedule.length) {
      return;
    }

    const currentDialogue = this.schedule[this.currentIdx];
    currentDialogue.run(dt);
  }

  draw() {
    if (this.currentIdx >= this.schedule.length) {
      return;
    }

    const currentDialogue = this.schedule[this.currentIdx];
    currentDialogue.draw();
  }
}

function wrapText(str, maxWidth) {
  const words = str.split(' ');
  let line = '';
  let output = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (textWidth(testLine) > maxWidth && i > 0) {
      output += line.trim() + '\n';
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  output += line.trim();
  return output;
}