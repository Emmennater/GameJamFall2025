function getCharacters() {
  let characters = {};

  let defaultSprites = {
    "Lion-chan": "lion-neutral",
    "Lumi": "lumi-neutral",
  }

  for (const [filename, json] of Object.entries(dialogueJSON)) {
    const name = json.name;

    if (!(name in characters)) {
      characters[name] = new Character(name, json.likes, {});
    }

    const character = characters[name];

    for (const [dialogueName, dialogue] of Object.entries(json.dialogues)) {
      let dialogueList = [];
      character.dialogues[dialogueName] = dialogueList;
      for (const obj of dialogue) {
        const speaker = obj.speaker;
        const text = obj.text;
        const options = obj.options;
        const enterDialogue = obj["enter-dialogue"];
        const give = obj.give;
        const remove = obj.remove;
        const check = obj.check; // List of necessary items
        const checkTrue = obj["check-true"]; // Next diagouge
        const checkFalse = obj["check-false"]; // Next dialogue
        const next = obj.next;
        
        let sprite = defaultSprites[speaker];
        if (obj.sprite && images[obj.sprite]) sprite = obj.sprite;
        if (!obj.sprite) sprite = "none";
        
        // Executes just before the next dialogue
        const onFinish = (choice) => {
          character.updateFromChoice(choice, next);
          if (enterDialogue) character.setEnterDialogue(enterDialogue);
          
          if (check) {
            const checkPassed = player.hasItems(check);
  
            if (checkPassed) {
              character.setNextDialogue(checkTrue);
            } else {
              character.setNextDialogue(checkFalse);
            }
          }

          if (give) player.addItem(give);
          if (remove) player.removeItem(remove);
        };
        
        if (options) {
          dialogueList.push(new DialogueBox(speaker, sprite, text, new Prompt("", options, onFinish), onFinish, character));
        } else {
          dialogueList.push(new DialogueBox(speaker, sprite, text, null, onFinish, character));
        }
      }
      // characters[json.name] = new Character(json.name, json.likes, json.dialogues);
    }
  }

  return characters;
}
