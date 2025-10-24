class SoundManager {
  constructor() {
    this.currentBgSound = null;
    this.currentBgSoundName = null;
    this.stopQueue = {};
    this.soundVolumes = {};
    this.soundtrack = []; // List of music sounds
    this.musicFadeDuration = 1000; // ✅ fade duration in ms
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
      loop: true,
      volume: 0.2,
    });
    this.sounds["music1"] = new Howl({
      src: ["sounds/music1.mp3"],
      loop: true,
      volume: 0.2,
    });
    this.sounds["music2"] = new Howl({
      src: ["sounds/music2.mp3"],
      loop: true,
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

  fadeAndAutoStop(sound, from, to, duration) {
    if (!sound) return;

    // Clamp to [0, 1] and ensure finite values
    const safeFrom = Number.isFinite(from) ? Math.min(Math.max(from, 0), 1) : 0;
    const safeTo = Number.isFinite(to) ? Math.min(Math.max(to, 0), 1) : 0;
    const safeDuration = Number.isFinite(duration) ? duration : 500;

    sound.fade(safeFrom, safeTo, safeDuration);

    const handler = () => {
      if (safeTo <= 0) sound.stop();
      sound.off("fade", handler);
    };
    sound.on("fade", handler);
  }

  safeFade(sound, from, to, duration) {
    if (!sound) return;

    // Coerce to numbers and clamp to [0,1]
    let start = Number(from);
    let end = Number(to);
    let time = Number(duration);

    if (!Number.isFinite(start)) start = 0;
    if (!Number.isFinite(end)) end = 0;
    if (!Number.isFinite(time) || time < 0) time = 500;

    start = Math.min(Math.max(start, 0), 1);
    end = Math.min(Math.max(end, 0), 1);

    // If sound isn’t loaded yet, defer
    if (sound.state && sound.state() !== "loaded") {
      sound.once("load", () => {
        try {
          sound.fade(start, end, time);
        } catch (e) {
          console.warn("safeFade (delayed) failed:", e);
        }
      });
      return;
    }

    try {
      sound.fade(start, end, time);
    } catch (e) {
      console.warn("safeFade failed:", e, { start, end, time, src: sound._src });
    }
  }

  startMusic() {
    if (this.soundtrack.length === 0) return;

    if (this.musicFadeTimer) {
      clearTimeout(this.musicFadeTimer);
      this.musicFadeTimer = null;
    }

    // Resume paused music
    if (this.musicStopped && this.currentMusic) {
      this.musicStopped = false;
      const sound = this.currentMusic;
      let volume = this.soundVolumes[this.currentMusicName];
      if (!Number.isFinite(volume)) volume = 1.0;

      try {
        sound.seek(this.musicPosition);
      } catch {
        this.musicPosition = 0;
      }

      sound.play();

      // ✅ use safeFade instead of sound.fade
      this.safeFade(sound, 0, volume, this.musicFadeDuration);
      return;
    }

    // Already playing
    if (this.currentMusic && this.currentMusic.playing()) return;

    // Pick a random new song different from the last one
    const available = this.soundtrack.filter((name) => name !== this.lastSongName);
    const songName = available[Math.floor(Math.random() * available.length)];
    this.lastSongName = songName;

    const sound = this.sounds[songName];
    if (!sound) return;

    // Stop old one
    if (this.currentMusic && this.currentMusic.playing()) {
      this.fadeAndAutoStop(this.currentMusic, this.currentMusic.volume(), 0, this.musicFadeDuration);
    }

    let targetVolume = this.soundVolumes[songName];
    if (!Number.isFinite(targetVolume)) targetVolume = 1.0;

    sound.stop(); // reset position
    sound.volume(0);
    sound.play();

    // ✅ use safeFade instead of sound.fade
    this.safeFade(sound, 0, targetVolume, this.musicFadeDuration);

    this.currentMusic = sound;
    this.currentMusicName = songName;
    this.musicStopped = false;
    this.musicPosition = 0;

    sound.once("end", () => {
      if (!this.musicStopped) {
        this.currentMusic = null;
        this.currentMusicName = null;
        this.startMusic();
      }
    });
  }

  stopMusic() {
    if (!this.currentMusic || this.musicStopped) return;
    this.musicStopped = true;

    const sound = this.currentMusic;
    const fadeDuration = this.musicFadeDuration;
    const currentVol = Number.isFinite(sound.volume()) ? sound.volume() : 1.0;

    try {
      this.musicPosition = sound.seek() ?? 0;
    } catch {
      this.musicPosition = 0;
    }

    // ✅ use safeFade instead of sound.fade
    this.safeFade(sound, currentVol, 0, fadeDuration);

    this.musicFadeTimer = setTimeout(() => {
      if (this.musicStopped) sound.pause();
      this.musicFadeTimer = null;
    }, fadeDuration);
  }
}
