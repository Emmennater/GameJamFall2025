function getCharacters() {
  let characters = {};

  for (const [filename, json] of Object.entries(dialogueJSON)) {
    const name = json.name;

    if (!(name in characters)) {
      characters[name] = new Character(name, json.likes, {});
    }

    for (const [dialogueName, dialogue] of Object.entries(json.dialogues)) {
      let dialogueList = [];
      characters[name].dialogues[dialogueName] = dialogueList;
      for (const obj of dialogue) {
        const speaker = obj.speaker;
        const sprite = obj.sprite;
        const text = obj.text;
        const options = obj.options;
        const enterDialogue = obj.enterDialogue;
        const onFinish = (choice) => {
          characters[name].updateFromChoice(choice);
          // if (enterDialogue) characters[name].setEnterDialogue(enterDialogue);
        };
        if (options) {
          dialogueList.push(new DialogueBox(speaker, sprite, text, new Prompt("", options), onFinish));
        } else {
          dialogueList.push(new DialogueBox(speaker, sprite, text, null, onFinish));
        }
      }
      // characters[json.name] = new Character(json.name, json.likes, json.dialogues);
    }
  }

  return characters;
}
