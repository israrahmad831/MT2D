import React, { useState } from 'react';
import { Player } from '../../types';

interface PlayerHealthBarProps {
  player: Player;
}

const PlayerHealthBar: React.FC<PlayerHealthBarProps> = ({ player }) => {
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);
  const [showManaTooltip, setShowManaTooltip] = useState(false);

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const manaPercentage = (player.mana / player.maxMana) * 100;

  return (
    <div className="fixed bottom-4 left-[400px] z-50">
      {/* Health Bar */}
      <div 
        className="relative mb-1"
        onMouseEnter={() => setShowHealthTooltip(true)}
        onMouseLeave={() => setShowHealthTooltip(false)}
      >
        <div className="w-48 h-4 bg-red-900 rounded-sm overflow-hidden border border-red-800">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        
        {/* Health Tooltip */}
        {showHealthTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 text-white px-3 py-2 rounded text-sm whitespace-nowrap border border-gray-600">
            <div className="text-red-400 font-bold">Health</div>
            <div>{Math.ceil(player.health)} / {player.maxHealth}</div>
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>

      {/* Mana Bar */}
      <div 
        className="relative"
        onMouseEnter={() => setShowManaTooltip(true)}
        onMouseLeave={() => setShowManaTooltip(false)}
      >
        <div className="w-48 h-4 bg-blue-900 rounded-sm overflow-hidden border border-blue-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${manaPercentage}%` }}
          />
        </div>
        
        {/* Mana Tooltip */}
        {showManaTooltip && (
          <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 text-white px-3 py-2 rounded text-sm whitespace-nowrap border border-gray-600">
            <div className="text-blue-400 font-bold">Mana</div>
            <div>{Math.ceil(player.mana)} / {player.maxMana}</div>
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHealthBar;