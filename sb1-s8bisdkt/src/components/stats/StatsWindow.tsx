import React, { useEffect, useState } from 'react';
import { Player } from '../../types';
import { SoundManager } from '../../utils/SoundManager';

interface StatsWindowProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
}

const StatsWindow: React.FC<StatsWindowProps> = ({ player, setPlayer }) => {
  const [displayExp, setDisplayExp] = useState(player.experience);
  
  // Play window open sound when stats window opens
  useEffect(() => {
    if (player.isStatsWindowOpen) {
      SoundManager.playWindowOpenSound();
    } else {
      SoundManager.playWindowCloseSound();
    }
  }, [player.isStatsWindowOpen]);
  
  // Animate EXP changes
  useEffect(() => {
    let animationFrame: number;
    const targetExp = player.experience;
    const startExp = displayExp;
    const duration = 500;
    let startTime: number | null = null;

    const animateExp = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentExp = startExp + (targetExp - startExp) * progress;
      setDisplayExp(currentExp);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateExp);
      }
    };

    if (targetExp !== displayExp) {
      animationFrame = requestAnimationFrame(animateExp);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [player.experience]);

  // Calculate maximum points per stat
  const getMaxPointsPerStat = () => {
    return 99; // Crescut de la 50 la 99 pentru a permite mai multă flexibilitate
  };

  const handleStatIncrease = (stat: 'vit' | 'str' | 'int' | 'dex') => {
    if (player.statPoints <= 0) return;

    const maxPoints = getMaxPointsPerStat();
    if (player.baseStats[stat] >= maxPoints) {
      return;
    }

    setPlayer(prev => {
      if (!prev) return prev;
      
      // Calculate new base stats
      const newBaseStats = {
        ...prev.baseStats,
        [stat]: prev.baseStats[stat] + 1
      };

      // Calculate new derived stats
      const baseHealth = 100 + (newBaseStats.vit * 25);
      const baseMana = 25 + (newBaseStats.int * 10);
      const baseAttack = 5 + (newBaseStats.str * 1);
      const baseDefense = 2 + Math.floor(newBaseStats.dex * 0.5);

      // Add equipment bonuses if they exist
      const equipmentStats = prev.equipmentStats || {
        attack: 0,
        defense: 0,
        vitality: 0
      };

      const totalHealth = baseHealth + (equipmentStats.vitality * 25);
      const totalAttack = baseAttack + equipmentStats.attack;
      const totalDefense = baseDefense + equipmentStats.defense;

      return {
        ...prev,
        baseStats: newBaseStats,
        statPoints: prev.statPoints - 1,
        maxHealth: totalHealth,
        maxMana: baseMana,
        attack: totalAttack,
        defense: totalDefense,
        health: prev.health > totalHealth ? totalHealth : prev.health,
        mana: prev.mana > baseMana ? baseMana : prev.mana
      };
    });
  };

  const maxPointsPerStat = getMaxPointsPerStat();

  if (!player.isStatsWindowOpen) return null;

  return (
    <div 
      className="fixed top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto"
      style={{
        backgroundImage: 'url(https://i.imgur.com/dXPMDxd.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        width: '300px',
        height: '400px',
        imageRendering: 'pixelated'
      }}
    >
      {/* Header */}
      <div className="relative pt-8 px-6">
        <div className="flex items-center gap-4 ml-18">
          <span 
            className="text-green-400 font-semibold stats-text" 
            style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
          >
            {player.name}
          </span>

          <span 
            className="text-blue-400 absolute left-24 top-10 stats-text" 
            style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
          >
            Lv{player.level}
          </span>

          {/* EXP Display */}
          <div 
            className="absolute"
            style={{ left: '200px', top: '50px' }}
          >
            <div 
              className="text-white text-center mb-1 stats-text"
              style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px', fontSize: '12px' }}
            >
              EXP
            </div>
            <div 
              className="text-yellow-400 stats-text"
              style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px', fontSize: '11px' }}
            >
              {Math.floor(displayExp)}/{player.experienceToNextLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="relative mt-8 px-8">
        <div className="space-y-3">
          {[
            { label: 'VIT', key: 'vit' as const, value: `${player.health}/${player.maxHealth}`, color: 'text-red-400' },
            { label: 'STR', key: 'str' as const, value: player.attack, color: 'text-orange-400' },
            { label: 'INT', key: 'int' as const, value: `${player.mana}/${player.maxMana}`, color: 'text-blue-400' },
            { label: 'DEX', key: 'dex' as const, value: player.defense, color: 'text-green-400' }
          ].map(stat => (
            <div key={stat.key} className="flex items-center">
              <span 
                className="text-white w-8 stats-text"
                style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
              >
                {stat.label}
              </span>
              <span 
                className="text-yellow-400 ml-2 w-4 text-right stats-text"
                style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
              >
                {player.baseStats[stat.key]}
              </span>
              {player.statPoints > 0 && player.baseStats[stat.key] < maxPointsPerStat && (
                <button
                  onClick={() => handleStatIncrease(stat.key)}
                  className="ml-2 w-4 h-4 flex items-center justify-center"
                  style={{ 
                    backgroundImage: 'url(https://i.imgur.com/yjPNKPp.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'pixelated'
                  }}
                />
              )}
              <div className="ml-4 flex items-center">
                <div 
                  className="bg-gray-900 bg-opacity-50 px-1.5 py-0.5 rounded stats-text"
                  style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
                >
                  <span className={`${stat.color} text-xs`}>
                    {stat.value}
                  </span>
                </div>
              </div>
              {player.baseStats[stat.key] >= maxPointsPerStat && (
                <span className="ml-2 text-xs text-gray-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Max</span>
              )}
            </div>
          ))}
        </div>

        {/* Available Points */}
        {player.statPoints > 0 && (
          <div className="absolute right-8 top-12">
            <span 
              className="text-green-400 stats-text"
              style={{ imageRendering: 'pixelated', fontFamily: 'GameFont, "Press Start 2P", monospace', letterSpacing: '0.5px' }}
            >
              ({player.statPoints})
            </span>
          </div>
        )}

        {/* Equipment Stats */}
        {player.equipmentStats && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              {player.equipmentStats.attackSpeed > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Attack Speed</span>
                  <span className="text-green-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>+{player.equipmentStats.attackSpeed}%</span>
                </div>
              )}
              {player.equipmentStats.monsterDamage > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Monster Damage</span>
                  <span className="text-green-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>+{player.equipmentStats.monsterDamage}%</span>
                </div>
              )}
              {player.equipmentStats.criticalChance > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Critical Chance</span>
                  <span className="text-green-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>+{player.equipmentStats.criticalChance}%</span>
                </div>
              )}
              {player.equipmentStats.movementSpeed > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Movement Speed</span>
                  <span className="text-green-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>+{player.equipmentStats.movementSpeed}%</span>
                </div>
              )}
              {player.equipmentStats.fireResistance > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>Fire Resistance</span>
                  <span className="text-green-400 stats-text" style={{ fontFamily: 'GameFont, "Press Start 2P", monospace' }}>+{player.equipmentStats.fireResistance}%</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsWindow;