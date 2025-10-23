class SoundManager {
  constructor() {
    this.currentBgSound = null;
    this.currentBgSoundName = null;
    this.stopQueue = {};
    this.soundVolumes = {};
    this.soundtrack = []; // List of music sounds
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
    this.sounds['underwater-surface'] = new Howl({
      src: ['sounds/underwater-ambience-surface.mp3'],
      loop: true,
      volume
    });
    this.sounds['underwater-deep'] = new Howl({
      src: ['sounds/underwater-ambience-deep.mp3'],
      loop: true,
      volume
    });
    this.sounds['underwater-heavy'] = new Howl({
      src: ['sounds/underwater-ambience-heavy.mp3'],
      loop: true,
      volume
    });
    this.sounds['button-click'] = new Howl({
      src: ['sounds/button-click.mp3'],
      volume
    })

    for (const soundName in this.sounds) {
      this.soundVolumes[soundName] = this.sounds[soundName].volume();
    }
  }

  fadeAndAutoStop(sound, from, to, duration) {
    if (!sound) return;

    sound.fade(from, to, duration);

    const handler = () => {
      if (to <= 0) {
        sound.stop(); // or sound.pause() if you prefer
      }
      sound.off('fade', handler); // cleanup listener
    };

    sound.on('fade', handler);
  }

  getSceneSound(sceneName) {
    switch (sceneName) {
    case 'Menu': return null;
    case 'GameOverScene': return 'underwater-surface';
    case 'GameOverShark': return 'underwater-heavy';
    case 'GameOverDark': return 'underwater-heavy';
    case 'GameOverKill': return 'underwater-surface';
    case 'StartingArea': return 'underwater-surface';
    case 'CaveArea': return 'underwater-surface';
    case 'CaveOpening': return 'underwater-heavy';
    case 'CaveFloorDark': return 'underwater-deep';
    case 'ShipArriving': return 'underwater-surface';
    case 'ShipArea': return 'underwater-surface';
    case 'ShipArea2': return 'underwater-surface';
    case 'ShipArea3': return 'underwater-surface';
    case 'ShipArea4': return 'underwater-surface';
    case 'CoralArea': return 'underwater-surface';
    case 'CoralArea2': return 'underwater-surface';
    case 'CoralArea3': return 'underwater-surface';
    case 'CoralArea4': return 'underwater-deep';
    case 'DarkArea': return 'underwater-deep';
    case 'DarkArea2': return 'underwater-deep';
    case 'DarkArea3': return 'underwater-deep';
    case 'SharkArea': return 'underwater-heavy';
    case 'ShopDistance': return 'underwater-deep';
    case 'Shop': return 'underwater-deep';
    default: return 'underwater-surface';
    }
  }

  enterScene(sceneName) {
    let soundName = this.getSceneSound(sceneName);
    this.changeBackgroundSound(soundName);
  }

  buttonClick() {
    this.sounds['button-click'].play();
  }

  startMusic() {
    if (this.soundtrack.length === 0) return;

    // If music is currently fading out to stop, cancel that
    if (this.musicFadeTimer) {
      clearTimeout(this.musicFadeTimer);
      this.musicFadeTimer = null;
    }

    // If music was paused, resume it from where it left off
    if (this.musicStopped && this.currentMusic) {
      this.musicStopped = false;
      const sound = this.currentMusic;
      const volume = this.soundVolumes[this.currentMusicName] ?? 1.0;

      // Resume playback from stored position
      sound.seek(this.musicPosition);
      sound.play();
      sound.fade(0, volume, this.musicFadeDuration);
      return;
    }

    // If a song is already playing and not ending soon, do nothing
    if (this.currentMusic && this.currentMusic.playing()) return;

    // Pick a random new song different from the last one
    const available = this.soundtrack.filter(name => name !== this.lastSongName);
    const songName = available[Math.floor(Math.random() * available.length)];
    this.lastSongName = songName;

    const sound = this.sounds[songName];
    if (!sound) return;

    // Stop any old music that might still be playing
    if (this.currentMusic && this.currentMusic.playing()) {
      this.fadeAndAutoStop(this.currentMusic, this.currentMusic.volume(), 0, this.musicFadeDuration);
    }

    // Play the new one
    sound.stop(); // Reset to start
    sound.volume(0);
    sound.play();
    sound.fade(0, this.soundVolumes[songName] ?? 1.0, this.musicFadeDuration);

    this.currentMusic = sound;
    this.currentMusicName = songName;
    this.musicStopped = false;
    this.musicPosition = 0;

    // When it finishes, pick another random song automatically
    sound.once('end', () => {
      if (!this.musicStopped) {
        this.currentMusic = null;
        this.currentMusicName = null;
        this.startMusic(); // pick new random track
      }
    });
  }

  stopMusic() {
    if (!this.currentMusic) return;

    // Avoid stopping twice
    if (this.musicStopped) return;
    this.musicStopped = true;

    const sound = this.currentMusic;
    const fadeDuration = this.musicFadeDuration;

    // Remember where the song stopped
    this.musicPosition = sound.seek() ?? 0;

    // Fade out
    sound.fade(sound.volume(), 0, fadeDuration);

    // Stop after fade finishes
    this.musicFadeTimer = setTimeout(() => {
      if (this.musicStopped) sound.pause();
      this.musicFadeTimer = null;
    }, fadeDuration);
  }
}
