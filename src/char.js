class Character {
  constructor(name, likes, dialogues) {
    this.name = name;
    this.likes = likes;
    this.like = this.getRandomLike();
    this.dialogues = dialogues;
    this.sprite = new Sprite(name);
    this.currentDialogue = "first-greeting";
    this.enterDialogue = "first-greeting";
    this.giftedItem = "No item";
    // this.currentDialogue = "done";
    this.speaking = false;
    this.dead = false;
    this.dialogue = new DialogueManager(this);
  }

  isDead() {
    return this.dead;
  }

  kill() {
    this.dead = true;

    if (this.name == "Takara") {
      setTimeout(() => sceneManager.transitionToScene(new GameOverKill(), true), 2000);
    }
  }

  giveItem(item) {
    // Correct item -> receive-item
    // Wrong item -> bad-item
    this.giftedItem = item;
    if (item === this.like) {
      this.startSpeaking(`receive-${item}`);
    } else {
      this.startSpeaking("bad-item");
    }
  }

  isSpeaking() {
    return this.speaking;
  }

  startSpeaking(dialogueName) {
    if (dialogueName) {
      this.currentDialogue = dialogueName;
    } else {
      this.currentDialogue = this.enterDialogue; // Overwrite
    }
    
    if (!this.dialogues[this.currentDialogue]) {
      print("Dialogue not found: " + this.currentDialogue);
      return;
    }
    this.updateDialogue();
    this.speaking = true;
  }

  getRandomLike() {
    if (!this.likes) return "";
    return this.likes[Math.floor(Math.random() * this.likes.length)];
  }

  setNextDialogue(next) {
    next = next.replace("{likes}", this.like);
    next = next.replace("{item}", this.giftedItem);
    this.currentDialogue = next;
    this.speaking = true;
  }

  updateFromChoice(choice, next) {
    let next2 = choice ? choice.next : next;

    if (!next2) {
      this.dialogue.nextDialogue();
      if (this.dialogue.isDone()) {
        this.currentDialogue = null;
        this.speaking = false;
        // this.dialogue.restart();
        return;
      }
    }

    if (next2) {
      this.setNextDialogue(next2);
      this.updateDialogue();
    }
  }

  updateDialogue() {
    const nextDialogue = this.dialogues[this.currentDialogue];
    if (nextDialogue) {
      this.dialogue.scheduleDialogue(nextDialogue);
      this.dialogue.restart();
    } else {
      this.speaking = false;
      return null;
    }
  }

  getDialogue() {
    return this.dialogue;
  }

  setEnterDialogue(dialogue) {
    if (!dialogue) print("Invalid dialogue");
    this.enterDialogue = dialogue;
  }
}

class CharacterEntity extends Entity {
  constructor(character, sprite, getTransform) {
    super(getTransform);
    this.character = character;
    this.img = images[sprite];
  }

  onClick() {
    if (this.character.isDead()) return;
    if (!busy["dialogue"]) {
      this.character.startSpeaking();
    }
  }
  
  render(x, y, w, h) {
    if (this.character.isDead()) return;
    if (this.img) {
      imageMode(CENTER);
      image(this.img, x, y, w, h);
    } else {
      fill(50);
      noStroke();
      rect(x - w / 2, y - h / 2, w, h);
    }
  }
}

function getCharacter(characterName) {
  const character = characters[characterName];

  if (!character) print("Invalid character (getCharacter): " + characterName);

  return character;
}