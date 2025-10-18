class Character {
  constructor(name, likes, dialogues) {
    this.name = name;
    this.likes = likes;
    this.dialogues = dialogues;
    this.sprite = new Sprite(name);
    this.currentDialogue = "greeting";
    this.speaking = false;

    this.dialogues = {
      "greeting": [
        new DialogueBox(
          "Lionfish",
          "Hello World! This is a test!",
          new Prompt(
            "",
            [{text: "Bob"}, {text: "Alice"}, {text: "Charlie"}, {text: "Diana"}],
          ),
          (choice) => {
            // print(choice)
            this.currentDialogue = "greeting2";
            this.speaking = true;
          }
        )
      ],
      "greeting2": [
        new DialogueBox(
          "Lionfish",
          "I am Lionfish!",
          null,
          () => {
            this.currentDialogue = "greeting3";
          }
        )
      ],
      "greeting3": [
        new DialogueBox(
          "Lionfish",
          "Nice to meet you!",
          null,
          () => {
            this.currentDialogue = "done";
          }
        )
      ]
    }
  }

  getNextDialogue() {
    const dialogue = this.dialogues[this.currentDialogue];
    this.speaking = false;
    return dialogue;
  }
}

class CharacterEntity {
  constructor(character, getTransform) {
    this.character = character;
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

  run(dt) {
    this.transform = this.getTransform(dt);

    if (mouse.clicked) {
      if (this.isHovered()) {
        this.character.speaking = true;
      }
    }
  }

  draw() {
    const { x, y, w, h } = this.transform;
    fill(0);
    noStroke();
    rect(x - w / 2, y - h / 2, w, h);
  }
}

function getCharacters() {
  return {
    "Lionfish": new Character("Lionfish", ["blue", "shiny", "sea shells"], {}),
  }
}

function getCharacter(characterName) {
  return characters[characterName];
}