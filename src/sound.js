class SoundManager {
  constructor() {
    this.currentBgSound = null;
    this.currentBgSoundName = null;
    this.stopQueue = {};
    this.soundVolumes = {};
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
}
