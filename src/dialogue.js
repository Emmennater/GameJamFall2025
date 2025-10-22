class DialogueBox {
  constructor(charName, sprite, text, prompt = null, finished = () => {}, character = null) {
    this.rawCharName = "";
    this.charName = "";
    this.character = character;
    this.sprite = sprite;
    this.rawText = "";
    this.text = "";
    this.displayedText = "";
    this.defaultTextSpeed = 0.5;
    this.textSpeed = this.defaultTextSpeed;
    this.textSpeedTimer = 0;
    this.textTime = 0;
    this.nextPauseIdx = -1;
    this.continue = false;
    this.prompt = prompt;

    if (this.sprite === "lion-neutral") {
      if (Math.random() < 0.5) {
        this.sprite = "lion-talk";
      }
    }

    if (this.sprite === "lumi-neutral") {
      if (Math.random() < 0.5) {
        this.sprite = "lumi-talk";
      }
    }

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
    this.rawText = text || "Null";
    this.text = "";
    this.displayedText = "";
    this.textTime = 0;
    this.updatePauseIdx();
    this.formatText();
  }

  endOfText() {
    return this.textTime >= this.text.length + 1;
  }

  formatText() {
    this.text = substituteText(this.rawText, this.character);
    this.charName = substituteText(this.rawCharName, this.character);
    this.updatePauseIdx();
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
    if (this.prompt) this.prompt.restart();
    this.textTime = 0;
    this.textSpeed = this.defaultTextSpeed;
    this.textSpeedTimer = 0;
    this.continue = false;
    this.updatePauseIdx();
  }

  runInput() {
    if ((mouse.clicked || keys['Enter'])) {
      const unpaused = this.updatePauseIdx();
      const notAtStart = this.textTime > 0;
      if (!unpaused && notAtStart) {
        // Speed up the text
        this.textSpeed = this.defaultTextSpeed + 0.5;
        this.textSpeedTimer = 4 * 60; // 4 seconds
      }
      if (this.endOfText() && !this.prompt) {
        this.continue = true;
        this.onDone();
      }
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

  drawCharacter() {
    if (this.sprite && images[this.sprite]) {
      const img = images[this.sprite];
      const aspect = img.width / img.height;
      const h = height;
      const w = h * aspect;
      const x = width * 0.5;
      const y = height * 0.5;
      imageMode(CENTER);
      image(img, x, y, w, h);
    } else if (this.sprite !== "none") {
      const aspect = 0.6;
      const w = width * 0.2;
      const h = w / aspect;
      const x = width * 0.5 - w * 0.5;
      const y = height * 0.5 - h * 0.5;
      fill(0, 255, 0);
      noStroke();
      rect(x, y, w, h);
    }
  }

  draw() {
    this.drawCharacter();

    // Dialogue box
    const fontSize = isMobile() ? 15 : 20;
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
    if (this.charName && this.charName != "Null") {
      const nameSize = isMobile() ? 20 : 30;
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
    }

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
    const fontSize = isMobile() ? 15 : 20;
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
      
      if (mouseX > optionLeft && mouseX < optionLeft + optionWidth && mouseY > optionTop && mouseY < optionTop + optionHeights[i]) {
        this.selected = i;
        if (mouse.clicked) {
          this.done = true;
          this.choice = option;
          this.onChoice(option);
        }
      }

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

  restart() {
    // Print call stack trace
    // print("R")

    this.currentIdx = 0;
    for (const dialogueBox of this.schedule) {
      dialogueBox.restart();
    }
  }

  scheduleDialogue(dialogueBoxes) {
    this.schedule = dialogueBoxes;
    this.currentIdx = 0;
    // console.trace("Restarting dialogue");
    // print('schedule', this.schedule[0].text);

    for (const dialogueBox of this.schedule) {
      dialogueBox.formatText();
    }
  }

  nextDialogue() {
    // this.schedule[this.currentIdx].onDone();
    this.schedule[this.currentIdx].restart();
    this.currentIdx += 1;
    // console.trace();
  }
  
  run(dt) {
    if (this.isDone()) return;
    
    // if (this.schedule[this.currentIdx].isDone()) {
    //   this.nextDialogue();
    //   return;
    // }

    busy["dialogue"] = true;
    const currentDialogue = this.schedule[this.currentIdx];
    currentDialogue.run(dt);
  }

  draw() {
    // if (this.isDone()) {
      // this.character.updateDialogue();
    // }

    const currentDialogue = this.schedule[this.currentIdx];
    if (currentDialogue) currentDialogue.draw();
  }
}

function wrapText(str, maxWidth) {
  if (!str) return '';
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

  // Only display last 3 lines
  if (output.split('\n').length > 3) {
    output = output.split('\n').slice(-3).join('\n');
  }

  return output;
}

function busyIfHovering(x, y, w, h, flag = "dialogue") {
  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    busy[flag] = true;
  }
}

function substituteText(text, character) {
  // {player} -> player.name
  const gitedItem = character ? character.giftedItem : "item";
  text = text.replace(/\{player\}/g, player.name);
  text = text.replace(/\{item\}/g, gitedItem);
  text = text.replace(/\{likes\}/g, character ? character.like : "thing");
  return text;
}