class Character {
  constructor(name, likes, dialogues) {
    this.name = name;
    this.likes = likes;
    this.dialogues = dialogues;
    this.sprite = new Sprite(name);
    this.currentDialogue = "first-greeting";
    this.speaking = false;
    this.dialogue = new DialogueManager(this);
  }

  isSpeaking() {
    return this.speaking;
  }

  startSpeaking() {
    if (!this.dialogues[this.currentDialogue]) return;
    this.speaking = true;
  }

  getRandomLike() {
    return this.likes[Math.floor(Math.random() * this.likes.length)];
  }

  updateFromChoice(choice) {
    if (!choice || !choice.next) {
      this.currentDialogue = "done";
      this.speaking = false;
      return;
    }

    // Check for {likes} in choice.next
    const next = choice.next.replace("{likes}", this.getRandomLike());
    this.currentDialogue = next;
    this.speaking = true;
  }

  getDialogue() {
    if (this.dialogue.isDone()) {
      const nextDialogue = this.dialogues[this.currentDialogue];
      if (nextDialogue) {
        this.dialogue.scheduleDialogue(nextDialogue);
      } else {
        this.speaking = false;
        return null;
      }
    }

    return this.dialogue;
  }
}

class CharacterEntity extends Entity {
  constructor(character, sprite, getTransform) {
    super(getTransform);
    this.character = character;
    this.img = images[sprite];
  }

  onClick() {
    this.character.startSpeaking();
  }

  render(x, y, w, h) {
    fill(0);
    noStroke();
    rect(x - w / 2, y - h / 2, w, h);
  }
}

function getCharacter(characterName) {
  return characters[characterName];
}