class SoundPlayer {
  constructor(src, options = {}) {
    this.audio = new Audio(src);
    this.audio.loop = options.loop || false;
    this.audio.volume = options.volume ?? 1.0;
    this.isLoaded = false;

    this.audio.addEventListener('canplaythrough', () => {
      this.isLoaded = true;
      if (options.onLoad) options.onLoad();
    });

    this.audio.addEventListener('ended', () => {
      if (options.onEnd) options.onEnd();
    });
  }

  play() {
    if (!this.isLoaded) {
      this.audio.addEventListener('canplaythrough', () => this.audio.play(), { once: true });
    } else {
      this.audio.play();
    }
  }

  pause() {
    this.audio.pause();
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setLoop(loop) {
    this.audio.loop = loop;
  }

  setPlaybackRate(rate) {
    this.audio.playbackRate = rate;
  }
}

class SoundManager {
  constructor() {
    this.sounds = new Map(); // name → SoundPlayer
    this.globalVolume = 1.0;
    this.setGlobalVolume(0); // mute
  }

  add(name, src, options = {}) {
    if (this.sounds.has(name)) {
      console.warn(`Sound "${name}" already exists. Overwriting.`);
    }
    const player = new SoundPlayer(src, options);
    this.sounds.set(name, player);
    player.setVolume(this.globalVolume);
    return player;
  }

  get(name) {
    return this.sounds.get(name);
  }

  play(name) {
    const sound = this.sounds.get(name);
    if (sound) sound.play();
    else console.warn(`Sound "${name}" not found.`);
  }

  pause(name) {
    const sound = this.sounds.get(name);
    if (sound) sound.pause();
  }

  stop(name) {
    const sound = this.sounds.get(name);
    if (sound) sound.stop();
  }

  stopAll() {
    for (const sound of this.sounds.values()) sound.stop();
  }

  setVolume(name, volume) {
    const sound = this.sounds.get(name);
    if (sound) sound.setVolume(volume);
  }

  setGlobalVolume(volume) {
    this.globalVolume = volume;
    for (const sound of this.sounds.values()) sound.setVolume(volume);
  }

  remove(name) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.stop();
      this.sounds.delete(name);
    }
  }

  clear() {
    this.stopAll();
    this.sounds.clear();
  }
}

function getSoundManager() {
  const soundManager = new SoundManager();

  soundManager.add('transition', 'sounds/bruh.mp3', { volume: 0.6 });
  // soundManager.add('bgm', 'sounds/background.mp3', { loop: true, volume: 0.4 });

  return soundManager;
}