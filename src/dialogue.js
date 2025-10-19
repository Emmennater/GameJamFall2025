class DialogueBox {
  constructor(charName, sprite, text, prompt = null, finished = () => {}) {
    this.charName = "";
    this.sprite = sprite;
    this.text = "";
    this.displayedText = "";
    this.defaultTextSpeed = 0.5;
    this.textSpeed = this.defaultTextSpeed;
    this.textSpeedTimer = 0;
    this.textTime = 0;
    this.nextPauseIdx = -1;
    this.continue = false;
    this.prompt = prompt;

    this.onDone = () => {
      if (this.prompt) {
        finished(this.prompt.getChoice());
      } else {
        finished();
      }
    }

    this.showText(charName, text);
  }

  updatePauseIdx() {
    this.nextPauseIdx = this.text.indexOf('@', this.textTime);

    // If we are already at a pause, remove it from the text
    if (this.nextPauseIdx == this.textTime) {
      this.text = this.text.substring(0, this.textTime) + this.text.substring(this.textTime + 1);
      this.nextPauseIdx = this.text.indexOf('@', this.textTime);
      return true;
    }

    return false;
  }

  showText(charName, text) {
    this.charName = charName || "Null";
    this.text = text || "Null";
    this.displayedText = "";
    this.textTime = 0;
    this.updatePauseIdx();
  }

  endOfText() {
    return this.textTime >= this.text.length + 1;
  }

  promptIsDone() {
    return this.prompt.isDone();
  }

  isDone() {
    return this.endOfText() && this.continue;
  }

  reset() {
    this.charName = "";
    this.text = "";
    this.displayedText = "";
    this.textTime = 0;
    this.updatePauseIdx();
  }

  restart() {
    this.textTime = 0;
    this.updatePauseIdx();
  }

  runInput() {
    if (mouse.clicked) {
      const unpaused = this.updatePauseIdx();
      if (!unpaused) {
        // Speed up the text
        this.textSpeed = this.defaultTextSpeed + 0.5;
        this.textSpeedTimer = 4 * 60; // 4 seconds
      }
      if (this.endOfText() && !this.prompt) this.continue = true;
    }
  }
  
  run(dt) {
    if (this.textTime < this.text.length + 1) {
      this.displayedText = this.text.substring(0, floor(this.textTime));
      this.textTime += this.textSpeed * dt;
    }

    if (this.textTime > this.nextPauseIdx && this.nextPauseIdx != -1) {
      this.textTime = this.nextPauseIdx;
    }

    if (this.textSpeedTimer > 0) {
      this.textSpeedTimer -= dt;
      if (this.textSpeedTimer <= 0) {
        this.textSpeed = this.defaultTextSpeed;
      }
    }

    if (this.endOfText() && this.prompt) {
      this.prompt.run(dt);

      if (this.promptIsDone()) {
        this.continue = true;
      }
    }

    this.runInput();
  }

  draw() {
    // Dialogue box
    const fontSize = 20;
    textSize(fontSize);
    textAlign(LEFT, TOP);
    
    const boxLeft = width * 0.2;
    const boxTop = height * 0.7;
    const boxW = width * 0.6;
    const boxH = height * 0.2;
    const textX = boxLeft + fontSize;
    const textY = boxTop + fontSize;
    const maxTextWidth = boxW - fontSize * 2;
    
    fill(255);
    stroke(0);
    strokeWeight(4);
    rect(boxLeft, boxTop, boxW, boxH, 20);
    
    // Wrap text
    fill(0);
    noStroke();
    const wrappedText = wrapText(this.displayedText, maxTextWidth);
    text(wrappedText, textX, textY);

    // Name box
    const nameSize = 30;
    textSize(nameSize);
    textAlign(LEFT, TOP);
    
    const name = this.charName;
    const nameLeft = boxLeft + 20;
    const nameTop = boxTop - nameSize;
    const nameW = textWidth(name) + 20;
    const nameH = nameSize + 10;
    fill(255);
    stroke(0);
    strokeWeight(4);
    rect(nameLeft, nameTop, nameW, nameH, 10);
    
    fill(0);
    noStroke();
    text(name, nameLeft + 10, nameTop + 5);

    if (this.endOfText() && this.prompt) {
      this.prompt.draw();
    }
  }
}

class Prompt {
  constructor(text, options, onChoice = () => {}) {
    this.text = text;
    this.options = options;
    this.selected = 0; // index of the currently selected option
    this.done = false;
    this.choice = null; // stores the chosen option
    this.onChoice = onChoice;
  }

  getChoice() {
    return this.choice;
  }

  restart() {
    this.selected = 0;
    this.done = false;
    this.choice = null;
  }

  isDone() {
    return this.done;
  }

  runKeys() {
    if (this.done) return;

    if (keys['ArrowUp']) {
      this.selected = (this.selected - 1 + this.options.length) % this.options.length;
    } else if (keys['ArrowDown']) {
      this.selected = (this.selected + 1) % this.options.length;
    } else if (keys['Enter']) {
      this.done = true;
      this.choice = this.options[this.selected];
      this.onChoice(this.choice);
    }
  }

  run(dt) {
    this.runKeys();
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

    const middleY = height * 0.4;

    // Draw prompt text above the options
    if (this.text) {
      const promptFontSize = 24;
      const promptText = wrapText(this.text, optionWidth);
      const promptHeight = promptText.split('\n').length * promptFontSize;
      const promptBoxH = promptHeight + 20;
      const promptTop = middleY - totalHeight / 2 - promptBoxH - marginY;
      
      textSize(promptFontSize);
      fill(255);
      stroke(0);
      strokeWeight(2);
      rect(optionLeft, promptTop, optionWidth, promptBoxH, 20);
      
      noStroke();
      fill(0);
      text(promptText, optionLeft + paddingX, promptTop + paddingY);
    }

    // Draw options
    let optionTop = middleY - totalHeight / 2;
    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];
      const txt = wrapText(option.text, optionWidth - paddingX * 2);

      if (i === this.selected) {
        fill(200, 255, 200); // highlight color
      } else {
        fill(255);
      }

      stroke(0);
      strokeWeight(2);
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
  constructor(character) {
    this.schedule = [];
    this.currentIdx = 0;
    this.character = character;
  }

  exit() {
    this.character.speaking = false;
  }

  isDone() {
    if (!this.schedule) return true;
    return this.currentIdx >= this.schedule.length;
  }

  scheduleDialogue(dialogueBoxes) {
    this.schedule = dialogueBoxes;
    this.currentIdx = 0;
  }

  nextDialogue() {
    this.schedule[this.currentIdx].onDone();
    this.currentIdx += 1;
  }

  run(dt) {
    if (this.isDone()) return;

    if (this.schedule[this.currentIdx].isDone()) {
      this.nextDialogue();
      return;
    }

    const currentDialogue = this.schedule[this.currentIdx];
    currentDialogue.run(dt);
  }

  draw() {
    if (this.isDone()) return;

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