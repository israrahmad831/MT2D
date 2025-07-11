import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Speaker } from 'lucide-react';
import { SoundManager } from '../utils/SoundManager';

interface SoundSettingsMenuProps {
  onClose: () => void;
}

const SoundSettingsMenu: React.FC<SoundSettingsMenuProps> = ({ onClose }) => {
  // Add safe access methods to prevent errors if SoundManager methods don't exist
  const safeGetVolume = () => {
    try {
      return typeof SoundManager.getVolume === 'function' ? SoundManager.getVolume() : 0.5;
    } catch (e) {
      return 0.5;
    }
  };

  const safeGetMusicVolume = () => {
    try {
      return typeof SoundManager.getMusicVolume === 'function' ? SoundManager.getMusicVolume() : 0.3;
    } catch (e) {
      return 0.3;
    }
  };

  const safeGetEffectsVolume = () => {
    try {
      return typeof SoundManager.getEffectsVolume === 'function' ? SoundManager.getEffectsVolume() : 0.5;
    } catch (e) {
      return 0.5;
    }
  };

  const safeIsSoundMuted = () => {
    try {
      return typeof SoundManager.isSoundMuted === 'function' ? SoundManager.isSoundMuted() : false;
    } catch (e) {
      return false;
    }
  };

  const safeIsMusicMuted = () => {
    try {
      return typeof SoundManager.isMusicMuted === 'function' ? SoundManager.isMusicMuted() : false;
    } catch (e) {
      return false;
    }
  };

  const safeIsEffectsMuted = () => {
    try {
      return typeof SoundManager.isEffectsMuted === 'function' ? SoundManager.isEffectsMuted() : false;
    } catch (e) {
      return false;
    }
  };

  // Initialize state with safe values
  const [masterVolume, setMasterVolume] = useState(safeGetVolume() * 100);
  const [musicVolume, setMusicVolume] = useState(safeGetMusicVolume() * 100);
  const [effectsVolume, setEffectsVolume] = useState(safeGetEffectsVolume() * 100);
  const [isMuted, setIsMuted] = useState(safeIsSoundMuted());
  const [isMusicMuted, setIsMusicMuted] = useState(safeIsMusicMuted());
  const [isEffectsMuted, setIsEffectsMuted] = useState(safeIsEffectsMuted());

  // Safe setter methods
  const safeSetVolume = (volume: number) => {
    try {
      if (typeof SoundManager.setVolume === 'function') {
        SoundManager.setVolume(volume);
      }
    } catch (e) {
      console.warn('Error setting volume:', e);
    }
  };

  const safeSetMusicVolume = (volume: number) => {
    try {
      if (typeof SoundManager.setMusicVolume === 'function') {
        SoundManager.setMusicVolume(volume);
      }
    } catch (e) {
      console.warn('Error setting music volume:', e);
    }
  };

  const safeSetEffectsVolume = (volume: number) => {
    try {
      if (typeof SoundManager.setEffectsVolume === 'function') {
        SoundManager.setEffectsVolume(volume);
      }
    } catch (e) {
      console.warn('Error setting effects volume:', e);
    }
  };

  const safeSetMuted = (muted: boolean) => {
    try {
      if (typeof SoundManager.setMuted === 'function') {
        SoundManager.setMuted(muted);
      }
    } catch (e) {
      console.warn('Error setting mute state:', e);
    }
  };

  const safeSetMusicMuted = (muted: boolean) => {
    try {
      if (typeof SoundManager.setMusicMuted === 'function') {
        SoundManager.setMusicMuted(muted);
      }
    } catch (e) {
      console.warn('Error setting music mute state:', e);
    }
  };

  const safeSetEffectsMuted = (muted: boolean) => {
    try {
      if (typeof SoundManager.setEffectsMuted === 'function') {
        SoundManager.setEffectsMuted(muted);
      }
    } catch (e) {
      console.warn('Error setting effects mute state:', e);
    }
  };

  // Apply volume settings when sliders change
  useEffect(() => {
    safeSetVolume(masterVolume / 100);
  }, [masterVolume]);

  useEffect(() => {
    safeSetMusicVolume(musicVolume / 100);
  }, [musicVolume]);

  useEffect(() => {
    safeSetEffectsVolume(effectsVolume / 100);
  }, [effectsVolume]);

  const handleMasterMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    safeSetMuted(newMuteState);
  };

  const handleMusicMuteToggle = () => {
    const newMuteState = !isMusicMuted;
    setIsMusicMuted(newMuteState);
    safeSetMusicMuted(newMuteState);
  };

  const handleEffectsMuteToggle = () => {
    const newMuteState = !isEffectsMuted;
    setIsEffectsMuted(newMuteState);
    safeSetEffectsMuted(newMuteState);
  };

  const handleTestSoundEffect = () => {
    try {
      if (typeof SoundManager.playWindowOpenSound === 'function') {
        SoundManager.playWindowOpenSound();
      }
    } catch (e) {
      console.warn('Error playing test sound:', e);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-800 border-2 border-gray-600 p-6 rounded-lg w-96 max-w-full">
        <h2 className="text-xl font-bold text-white mb-6 menu-text flex items-center justify-between">
          <span>Sound Settings</span>
          <button 
            onClick={handleTestSoundEffect}
            className="bg-blue-600 hover:bg-blue-700 text-xs text-white px-2 py-1 rounded"
          >
            Test Sound
          </button>
        </h2>
        
        {/* Master Volume */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm menu-text flex items-center">
              <Volume2 className="mr-2 h-4 w-4" /> Master Volume
            </label>
            <button 
              onClick={handleMasterMuteToggle}
              className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-500" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-500" />
              )}
            </button>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isMuted}
            />
            <span className="ml-2 text-white text-xs min-w-[30px] text-right menu-text">
              {isMuted ? "Off" : `${Math.round(masterVolume)}%`}
            </span>
          </div>
        </div>
        
        {/* Music Volume */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm menu-text flex items-center">
              <Music className="mr-2 h-4 w-4" /> Music Volume
            </label>
            <button 
              onClick={handleMusicMuteToggle}
              className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
            >
              {isMusicMuted ? (
                <Music className="h-4 w-4 text-red-500" />
              ) : (
                <Music className="h-4 w-4 text-green-500" />
              )}
            </button>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isMuted || isMusicMuted}
            />
            <span className="ml-2 text-white text-xs min-w-[30px] text-right menu-text">
              {isMuted || isMusicMuted ? "Off" : `${Math.round(musicVolume)}%`}
            </span>
          </div>
        </div>
        
        {/* Effects Volume */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-white text-sm menu-text flex items-center">
              <Speaker className="mr-2 h-4 w-4" /> Effects Volume
            </label>
            <button 
              onClick={handleEffectsMuteToggle}
              className="bg-gray-700 hover:bg-gray-600 p-1 rounded"
            >
              {isEffectsMuted ? (
                <Speaker className="h-4 w-4 text-red-500" />
              ) : (
                <Speaker className="h-4 w-4 text-green-500" />
              )}
            </button>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={effectsVolume}
              onChange={(e) => setEffectsVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              disabled={isMuted || isEffectsMuted}
            />
            <span className="ml-2 text-white text-xs min-w-[30px] text-right menu-text">
              {isMuted || isEffectsMuted ? "Off" : `${Math.round(effectsVolume)}%`}
            </span>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded menu-text"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoundSettingsMenu;