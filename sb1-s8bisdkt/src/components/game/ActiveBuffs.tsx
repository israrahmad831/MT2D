import React, { useEffect, useState } from 'react';
import { Player } from '../../types';

interface ActiveBuffsProps {
  player: Player;
}

const ActiveBuffs: React.FC<ActiveBuffsProps> = ({ player }) => {
  const [remainingTimes, setRemainingTimes] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemainingTimes: {[key: string]: number} = {};

      // Check Sword Aura buff
      if (player.buffs?.swordAura?.active) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - player.buffs.swordAura.startTime;
        const remaining = Math.max(0, player.buffs.swordAura.duration - elapsedTime);
        newRemainingTimes.swordAura = remaining;

        if (remaining <= 0) {
          player.buffs.swordAura.active = false;
        }
      }

      // Check Berserker buff
      if (player.buffs?.berserker?.active) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - player.buffs.berserker.startTime;
        const remaining = Math.max(0, player.buffs.berserker.duration - elapsedTime);
        newRemainingTimes.berserker = remaining;

        if (remaining <= 0) {
          player.buffs.berserker.active = false;
        }
      }

      setRemainingTimes(newRemainingTimes);
    }, 100);

    return () => clearInterval(interval);
  }, [player.buffs]);

  if (!player.buffs?.swordAura?.active && !player.buffs?.berserker?.active) return null;

  return (
    <div className="fixed top-4 right-4 bg-gray-800 bg-opacity-80 p-2 rounded-lg flex flex-col gap-2">
      {player.buffs?.swordAura?.active && (
        <div className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/oGASkmn.png"
            alt="Sword Aura"
            className="w-8 h-8"
          />
          <div className="text-white text-sm">
            <div className="font-bold">Aura Sabiei</div>
            <div className="text-xs text-gray-300">
              {Math.ceil(remainingTimes.swordAura / 1000)}s
            </div>
          </div>
        </div>
      )}
      
      {player.buffs?.berserker?.active && (
        <div className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/64TUUYd.png"
            alt="Berserker"
            className="w-8 h-8"
          />
          <div className="text-white text-sm">
            <div className="font-bold">Berserker</div>
            <div className="text-xs text-gray-300">
              {Math.ceil(remainingTimes.berserker / 1000)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveBuffs;