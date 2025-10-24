class SoundManager {
  constructor() {
    this.currentBgSound = null;
    this.currentBgSoundName = null;
    this.currentSong = null;
    this.currentSongName = null;
    this.musicRunning = false;
    this.stopQueue = {};
    this.soundVolumes = {};
    this.soundtrack = []; // List of music sounds
    this.musicFadeDuration = 1000;
    this.initSounds();
  }

  changeBackgroundSound(soundName) {
    const fadeDuration = 500;

    if (soundName === this.currentBgSoundName) return;

    // Fade out the current background sound
    if (this.currentBgSound && this.currentBgSound.playing()) {
      this.fadeAndAutoStop(this.currentBgSound, this.currentBgSound.volume(), 0, fadeDuration);
    }

    if (!soundName) return;
    if (!this.sounds[soundName]) throw new Error(`Unknown sound: ${soundName}`);

    // Fade in the new background sound
    const newSound = this.sounds[soundName];
    newSound.volume(0);
    newSound.play();
    newSound.fade(0, this.soundVolumes[soundName], fadeDuration);

    this.currentBgSound = newSound;
    this.currentBgSoundName = soundName;
  }

  fadeOutBackgroundSound() {
    this.changeBackgroundSound(null);
  }

  initSounds() {
    const volume = 0.4;
    this.sounds = {};
    this.sounds["underwater-surface"] = new Howl({
      src: ["sounds/underwater-ambience-surface.mp3"],
      loop: true,
      volume,
    });
    this.sounds["underwater-deep"] = new Howl({
      src: ["sounds/underwater-ambience-deep.mp3"],
      loop: true,
      volume,
    });
    this.sounds["underwater-heavy"] = new Howl({
      src: ["sounds/underwater-ambience-heavy.mp3"],
      loop: true,
      volume,
    });
    this.sounds["button-click"] = new Howl({
      src: ["sounds/button-click.mp3"],
      volume,
    });
    this.sounds["music0"] = new Howl({
      src: ["sounds/music0.mp3"],
      volume: 0.2,
    });
    this.sounds["music1"] = new Howl({
      src: ["sounds/music1.mp3"],
      volume: 0.2,
    });
    this.sounds["music2"] = new Howl({
      src: ["sounds/music2.mp3"],
      volume: 0.2,
    });

    for (const soundName in this.sounds) {
      this.soundVolumes[soundName] = this.sounds[soundName].volume();
    }

    this.soundtrack = ["music0", "music1", "music2"];
  }

  fadeAndAutoStop(sound, from, to, duration) {
    if (!sound) return;

    sound.fade(from, to, duration);

    const handler = () => {
      if (to <= 0) {
        sound.stop(); // or sound.pause() if you prefer
      }
      sound.off("fade", handler); // cleanup listener
    };

    sound.on("fade", handler);
  }

  getSceneSound(sceneName) {
    switch (sceneName) {
      case "Menu":
        return null;
      case "GameOverScene":
        return "underwater-surface";
      case "GameOverShark":
        return "underwater-heavy";
      case "GameOverDark":
        return "underwater-heavy";
      case "GameOverKill":
        return "underwater-surface";
      case "StartingArea":
        return "underwater-surface";
      case "CaveArea":
        return "underwater-surface";
      case "CaveOpening":
        return "underwater-heavy";
      case "CaveFloorDark":
        return "underwater-deep";
      case "ShipArriving":
        return "underwater-surface";
      case "ShipArea":
        return "underwater-surface";
      case "ShipArea2":
        return "underwater-surface";
      case "ShipArea3":
        return "underwater-surface";
      case "ShipArea4":
        return "underwater-surface";
      case "CoralArea":
        return "underwater-surface";
      case "CoralArea2":
        return "underwater-surface";
      case "CoralArea3":
        return "underwater-surface";
      case "CoralArea4":
        return "underwater-deep";
      case "DarkArea":
        return "underwater-deep";
      case "DarkArea2":
        return "underwater-deep";
      case "DarkArea3":
        return "underwater-deep";
      case "SharkArea":
        return "underwater-heavy";
      case "ShopDistance":
        return "underwater-deep";
      case "Shop":
        return "underwater-deep";
      default:
        return "underwater-surface";
    }
  }

  enterScene(sceneName) {
    let soundName = this.getSceneSound(sceneName);
    this.changeBackgroundSound(soundName);

    if (sceneName.startsWith("GameOver") || sceneName == "SharkArea" ||
      sceneName == "CaveOpening") this.stopMusic();
    else this.startMusic();
  }

  buttonClick() {
    this.sounds["button-click"].play();
  }

  startMusicHelper() {
    if (this.musicRunning) return;

    this.musicRunning = true;
    
    const songName = this.soundtrack[Math.floor(Math.random() * this.soundtrack.length)];
    const song = this.sounds[songName];
    
    this.fadeAndAutoStop(song, 0, this.soundVolumes[songName], this.musicFadeDuration);

    this.currentSong = song;
    this.currentSongName = songName;
    this.currentSong.play();

    this.stopQueue[songName] = setTimeout(() => {
      this.fadeAndAutoStop(song, this.soundVolumes[songName], 0, this.musicFadeDuration);
      delete this.stopQueue[songName];
      if (this.musicRunning) { this.musicRunning = false; this.startMusicHelper(); }
    }, song.duration() * 1000 - this.musicFadeDuration);
  }

  startMusic() {
    setTimeout(() => this.startMusicHelper(), 1000);
  }

  stopMusic() {
    this.musicRunning = false;

    if (this.stopQueue[this.currentSongName]) clearTimeout(this.stopQueue[this.currentSongName]);

    this.fadeAndAutoStop(this.currentSong, this.soundVolumes[this.currentSongName], 0, this.musicFadeDuration);
  }
}
