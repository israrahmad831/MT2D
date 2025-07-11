import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import SoundSettingsMenu from './SoundSettingsMenu';

interface EscapeMenuProps {
  onClose: () => void;
  onExitToMainMenu: () => void;
  onOfflineModeToggle: () => void;
  isOfflineMode: boolean;
}

const EscapeMenu: React.FC<EscapeMenuProps> = ({ 
  onClose, 
  onExitToMainMenu,
  onOfflineModeToggle,
  isOfflineMode
}) => {
  const [showSoundSettings, setShowSoundSettings] = useState(false);

  const toggleSoundSettings = () => {
    setShowSoundSettings(!showSoundSettings);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {showSoundSettings ? (
        <SoundSettingsMenu onClose={toggleSoundSettings} />
      ) : (
        <div className="bg-gray-800 border-2 border-gray-600 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-6 menu-text">Game Menu</h2>
          
          <div className="space-y-4 w-64">
            <button 
              onClick={onClose}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded menu-text"
            >
              Return to Game
            </button>
            
            <button 
              onClick={toggleSoundSettings}
              className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded menu-text flex justify-center items-center"
            >
              <Volume2 className="mr-2" /> Sound Settings
            </button>
            
            <button 
              onClick={onOfflineModeToggle}
              className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded menu-text"
            >
              {isOfflineMode ? "Enable Online Mode" : "Enable Offline Mode"}
            </button>
            
            <button 
              onClick={onExitToMainMenu}
              className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded menu-text"
            >
              Exit to Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscapeMenu;