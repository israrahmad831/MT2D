export class SoundManager {
  private static audioCache = new Map<string, HTMLAudioElement>();
  private static isMuted = false;
  private static isMusicMuted = false;
  private static isEffectsMuted = false;
  private static volume = 0.5;
  private static effectsVolume = 0.5;
  private static backgroundMusic: HTMLAudioElement | null = null;
  private static musicVolume = 0.3;

  static preloadSounds() {
    const sounds = [
      '/src/sounds/su_swing_1.wav',
      '/src/sounds/su_swing_2.wav',
      '/src/sounds/su_swing_3.wav',
      '/src/sounds/su_swing_4.wav',
      '/src/sounds/teleport.wav',
      '/src/sounds/potal_scroll.wav',
      '/src/sounds/walk_ground_h_1.wav',
      '/src/sounds/walk_ground_n_1.wav',
      '/src/sounds/arm.wav',
      '/src/sounds/pickup_item_in_inventory.wav',
      '/src/sounds/pick.wav',
      '/src/sounds/equip_metal_weapon.wav',
      '/src/sounds/succes.wav',
      '/src/sounds/fail.wav',
      '/src/sounds/window_open.wav',
      '/src/sounds/window_close.wav',
      '/src/sounds/type.wav'
    ];

    sounds.forEach(soundPath => {
      const audio = new Audio(soundPath);
      audio.volume = this.volume * this.effectsVolume;
      audio.preload = 'auto';
      this.audioCache.set(soundPath, audio);
    });

    this.preloadBackgroundMusic();
  }

  static preloadBackgroundMusic() {
    try {
      this.backgroundMusic = new Audio('https://github.com/mrlalex/test/raw/main/metin1%20intro.MP3');
      this.backgroundMusic.volume = this.volume * this.musicVolume;
      this.backgroundMusic.loop = true;
      this.backgroundMusic.preload = 'auto';
    } catch (error) {
      console.warn('Could not preload background music:', error);
    }
  }

  static playBackgroundMusic() {
    if (this.isMuted || this.isMusicMuted || !this.backgroundMusic) return;

    try {
      this.backgroundMusic.volume = this.volume * this.musicVolume;
      this.backgroundMusic.play().catch(error => {
        console.warn('Could not play background music:', error);
      });
    } catch (error) {
      console.warn('Error playing background music:', error);
    }
  }

  static stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
  }

  static setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volume * this.musicVolume;
    }
  }

  static setEffectsVolume(volume: number) {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume * this.effectsVolume;
    });
  }

  static playSound(soundPath: string, volume: number = 1.0) {
    if (this.isMuted || this.isEffectsMuted) return;

    try {
      let audio = this.audioCache.get(soundPath);
      
      if (!audio) {
        audio = new Audio(soundPath);
        audio.volume = this.volume * this.effectsVolume * volume;
        this.audioCache.set(soundPath, audio);
      }

      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = this.volume * this.effectsVolume * volume;
      
      audioClone.play().catch(error => {
        console.warn('Could not play sound:', soundPath, error);
      });
    } catch (error) {
      console.warn('Error playing sound:', soundPath, error);
    }
  }

  static playSwingSound(attackSequence: number) {
    const soundPath = '/src/sounds/su_swing_' + attackSequence + '.wav';
    this.playSound(soundPath, 0.8);
  }

  static playTeleportSound() {
    this.playSound('/src/sounds/teleport.wav', 0.9);
  }

  static playLoadingSound() {
    this.playSound('/src/sounds/potal_scroll.wav', 0.7);
  }

  static playWalkSound(isMounted: boolean) {
    const soundPath = isMounted 
      ? '/src/sounds/walk_ground_n_1.wav'
      : '/src/sounds/walk_ground_h_1.wav';
    this.playSound(soundPath, 0.6);
  }

  static playBuildingPlaceSound() {
    this.playSound('/src/sounds/arm.wav', 0.8);
  }

  static playTypingSound() {
    this.playSound('/src/sounds/type.wav', 0.5);
  }

  static playItemPickupSound() {
    this.playSound('/src/sounds/pickup_item_in_inventory.wav', 0.7);
  }

  static playItemDropSound() {
    this.playSound('/src/sounds/pick.wav', 0.7);
  }

  static playEquipSound() {
    this.playSound('/src/sounds/equip_metal_weapon.wav', 0.8);
  }

  static playUpgradeSuccessSound() {
    this.playSound('/src/sounds/succes.wav', 0.9);
  }

  static playUpgradeFailSound() {
    this.playSound('/src/sounds/fail.wav', 0.9);
  }

  static playWindowOpenSound() {
    this.playSound('/src/sounds/window_open.wav', 0.6);
  }

  static playWindowCloseSound() {
    this.playSound('/src/sounds/window_close.wav', 0.6);
  }

  static setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.volume * this.musicVolume;
    }
    this.audioCache.forEach(audio => {
      audio.volume = this.volume * this.effectsVolume;
    });
  }

  static setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    } else if (!this.isMusicMuted) {
      this.playBackgroundMusic();
    }
  }

  static setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    } else if (!this.isMuted) {
      this.playBackgroundMusic();
    }
  }

  static setEffectsMuted(muted: boolean) {
    this.isEffectsMuted = muted;
  }

  static isSoundMuted(): boolean {
    return this.isMuted;
  }

  static isMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  static isEffectsMuted(): boolean {
    return this.isEffectsMuted;
  }

  static getVolume(): number {
    return this.volume;
  }

  static getMusicVolume(): number {
    return this.musicVolume;
  }

  static getEffectsVolume(): number {
    return this.effectsVolume;
  }
}