import React, { useState } from 'react';
import { Player } from '../../types';
import { SkillManager } from '../../skills/SkillManager';
import { SoundManager } from '../../utils/SoundManager';

interface SkillTreeWindowProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  onClose: () => void;
}

interface SkillTooltip {
  name: string;
  description: string;
  icon: string;
  manaCost: number;
  damage: number;
  level: string;
  scaling: string;
  nextLevelScaling?: string;
  position: { x: number; y: number };
}

const SkillTreeWindow: React.FC<SkillTreeWindowProps> = ({ player, setPlayer, onClose }) => {
  const [tooltip, setTooltip] = useState<SkillTooltip | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<{ message: string; success: boolean } | null>(null);
  const [showPointsTooltip, setShowPointsTooltip] = useState(false);
  const [pointsTooltipPosition, setPointsTooltipPosition] = useState({ x: 0, y: 0 });
  const skills = SkillManager.getPhysicalSkills();

  const getSkillLevel = (skillId: string): string => {
    const level = player.skillLevels?.[skillId] || 1;
    if (level <= 10) return `M${level}`;
    if (level <= 20) return `G${level - 10}`;
    return 'P';
  };

  const getNextLevelCost = (currentLevel: number): number => {
    if (currentLevel < 10) return 1;
    if (currentLevel < 20) return 2;
    return 3;
  };

  const canUpgradeSkill = (skillId: string): boolean => {
    const currentLevel = player.skillLevels?.[skillId] || 1;
    if (currentLevel >= 21) return false;
    const cost = getNextLevelCost(currentLevel);
    return (player.skillPoints || 0) >= cost;
  };

  const getSkillScaling = (skillId: string, level: number): string => {
    const skill = SkillManager.getSkillById(skillId);
    if (!skill?.getDamage) return '';

    switch (skillId) {
      case 'sword-aura': {
        const baseBonus = 20 + Math.min(20, Math.floor(level / 2) * 2);
        const strBonus = Math.min(20, Math.floor(player.baseStats.str / 5) * 5);
        return `Damage +${baseBonus + strBonus}%`;
      }
      case 'sword-spin': {
        const damage = skill.getDamage({ ...player, skillLevels: { ...player.skillLevels, [skillId]: level } });
        return `${damage} damage/sec`;
      }
      case 'three-way-cut': {
        const damage = skill.getDamage({ ...player, skillLevels: { ...player.skillLevels, [skillId]: level } });
        return `${damage} damage`;
      }
      case 'dash': {
        const damage = skill.getDamage({ ...player, skillLevels: { ...player.skillLevels, [skillId]: level } });
        return `${damage} damage`;
      }
      case 'berserker': {
        const baseSpeed = 15 + Math.min(15, Math.floor(level / 2) * 1.5);
        const intBonus = Math.min(15, Math.floor(player.baseStats.int / 5) * 3.75);
        return `Speed +${baseSpeed + intBonus}%`;
      }
      case 'red-potion': {
        if (level >= 90) return '30 HP';
        if (level >= 70) return '25 HP';
        if (level >= 50) return '20 HP';
        if (level >= 30) return '15 HP';
        if (level >= 10) return '10 HP';
        return '5 HP';
      }
      default:
        return '';
    }
  };

  const getNextLevelScaling = (skillId: string, currentLevel: number): string | undefined => {
    if (currentLevel >= 21) return undefined;
    return getSkillScaling(skillId, currentLevel + 1);
  };

  const handleSkillUpgrade = (skillId: string) => {
    const currentLevel = player.skillLevels?.[skillId] || 1;
    if (!canUpgradeSkill(skillId)) return;

    const success = Math.random() <= 0.7;
    const cost = getNextLevelCost(currentLevel);

    setPlayer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        skillPoints: (prev.skillPoints || 0) - cost,
        skillLevels: {
          ...prev.skillLevels,
          [skillId]: success ? (currentLevel + 1) : currentLevel
        }
      };
    });

    // Play sound based on success/failure
    if (success) {
      SoundManager.playUpgradeSuccessSound();
    } else {
      SoundManager.playUpgradeFailSound();
    }

    setUpgradeMessage({
      message: success ? 'Upgrade Success!' : 'Upgrade Failed!',
      success
    });

    setTimeout(() => {
      setUpgradeMessage(null);
    }, 2000);
  };

  const handlePointsMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointsTooltipPosition({
      x: rect.left,
      y: rect.top - 10
    });
    setShowPointsTooltip(true);
  };

  const handlePointsMouseLeave = () => {
    setShowPointsTooltip(false);
  };

  const handleMouseEnter = (e: React.MouseEvent, skill: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentLevel = player.skillLevels?.[skill.id] || 1;
    const level = getSkillLevel(skill.id);
    const scaling = getSkillScaling(skill.id, currentLevel);
    const nextLevelScaling = getNextLevelScaling(skill.id, currentLevel);

    setTooltip({
      name: skill.name,
      description: skill.description,
      icon: skill.icon,
      manaCost: skill.manaCost,
      damage: skill.damage,
      level,
      scaling,
      nextLevelScaling,
      position: {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
      }
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div 
        className="relative w-[600px] h-[600px] rounded-lg overflow-hidden"
        style={{
          backgroundImage: 'url(https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2ec970f4-1706-4915-9a93-41f3d9c8202c/deh8ha5-fcda4a76-0658-4215-ae43-d932b623bcce.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzJlYzk3MGY0LTE3MDYtNDkxNS05YTkzLTQxZjNkOWM4MjAyY1wvZGVoOGhhNS1mY2RhNGE3Ni0wNjU4LTQyMTUtYWU0My1kOTMyYjYyM2JjY2UucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.TDkGi3Cr37N8R75C-D73UuhWmGTYXXGEDB9lddy1HPs)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors pixel-text"
        >
          ✕
        </button>

        <div className="text-2xl text-white font-bold text-center mt-6 mb-8 pixel-text">
          Skill Tree
        </div>

        <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded flex items-center gap-2">
          <div
            className="relative cursor-help"
            onMouseEnter={handlePointsMouseEnter}
            onMouseLeave={handlePointsMouseLeave}
          >
            <img 
              src="https://i.imgur.com/F6s7bHk.png"
              alt="Skill Points"
              className="w-10 h-10 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <span className="text-yellow-400 pixel-text" style={{ fontSize: '14px' }}>
            {player.skillPoints || 0}
          </span>
        </div>

        <div className="flex flex-col gap-3 px-8 mt-16">
          {skills.map((skill) => {
            const currentLevel = player.skillLevels?.[skill.id] || 1;
            const scaling = getSkillScaling(skill.id, currentLevel);
            
            return (
              <div 
                key={skill.id}
                className="bg-black bg-opacity-40 p-4 rounded-lg flex items-center justify-between"
              >
                <div 
                  className="flex items-center gap-4 flex-1"
                  onMouseEnter={(e) => handleMouseEnter(e, skill)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="relative">
                    <img 
                      src={skill.icon} 
                      alt={skill.name}
                      className="w-14 h-14 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                      {getSkillLevel(skill.id)}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white pixel-text">{skill.name}</span>
                    <span className="text-green-400 pixel-text text-xs">{scaling}</span>
                  </div>
                </div>

                {canUpgradeSkill(skill.id) && (
                  <button
                    onClick={() => handleSkillUpgrade(skill.id)}
                    className="ml-4 w-7 h-7 flex items-center justify-center"
                    style={{ 
                      backgroundImage: 'url(https://i.imgur.com/yjPNKPp.png)',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {upgradeMessage && (
          <div 
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-lg text-white pixel-text text-lg ${
              upgradeMessage.success ? 'bg-green-600' : 'bg-red-600'
            }`}
            style={{ animation: 'fadeInOut 2s forwards' }}
          >
            {upgradeMessage.message}
          </div>
        )}

        {tooltip && (
          <div 
            className="fixed z-50 bg-black bg-opacity-90 rounded-lg p-4 pointer-events-none"
            style={{
              left: tooltip.position.x + 20,
              top: tooltip.position.y - 20,
              maxWidth: '300px'
            }}
          >
            <div className="flex items-center mb-2">
              <img 
                src={tooltip.icon}
                alt={tooltip.name}
                className="w-12 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div className="ml-3">
                <h3 className="text-yellow-400 font-bold pixel-text text-sm">
                  {tooltip.name}
                </h3>
                <span className="text-blue-400 pixel-text text-xs">
                  Level: {tooltip.level}
                </span>
              </div>
            </div>

            <p className="text-gray-300 pixel-text text-xs mb-2">
              {tooltip.description}
            </p>

            <div className="flex flex-col gap-1 pixel-text text-xs">
              <div className="flex justify-between">
                <span className="text-blue-400">
                  Mana Cost: {tooltip.manaCost}
                </span>
              </div>
              <div className="text-green-400">
                Current: {tooltip.scaling}
              </div>
              {tooltip.nextLevelScaling && (
                <div className="text-yellow-400">
                  Next Level: {tooltip.nextLevelScaling}
                </div>
              )}
            </div>
          </div>
        )}

        {showPointsTooltip && (
          <div 
            className="fixed z-50 bg-black bg-opacity-90 rounded-lg p-4 pointer-events-none"
            style={{
              left: pointsTooltipPosition.x + 20,
              top: pointsTooltipPosition.y - 120,
              maxWidth: '300px'
            }}
          >
            <div className="flex items-start gap-3">
              <img 
                src="https://i.imgur.com/F6s7bHk.png"
                alt="Ancient Frozen Spellbook"
                className="w-12 h-12 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
              <div>
                <h3 className="text-yellow-400 font-bold pixel-text text-sm mb-2">
                  Ancient Frozen Spellbook
                </h3>
                <p className="text-gray-300 pixel-text text-xs">
                  A mystical tome frozen in time, discovered in the forgotten realms of Sohan. Its pages contain powerful knowledge that allows warriors to master ancient combat techniques. You receive 20 of these every 10 levels.
                </p>
              </div>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
              10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default SkillTreeWindow;