import React, { useState, useEffect } from 'react';
import { Player } from '../../types';

interface DeathScreenProps {
  player: Player;
  onRespawn: (atHome: boolean) => void;
}

const DeathScreen: React.FC<DeathScreenProps> = ({ player, onRespawn }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canRespawn, setCanRespawn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanRespawn(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4 text-center">You have died!</h2>
        
        {!canRespawn ? (
          <div className="text-center mb-6">
            <p className="text-white mb-2">Respawn available in:</p>
            <p className="text-3xl font-bold text-yellow-500">{timeLeft}s</p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => onRespawn(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Respawn Here
            </button>
            
            <button
              onClick={() => onRespawn(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Respawn at Home
            </button>
          </div>
        )}

        <div className="mt-4 text-gray-400 text-sm text-center">
          <p>Level {player.level} {player.class}</p>
          <p>Experience: {player.experience}</p>
        </div>
      </div>
    </div>
  );
};

export default DeathScreen;