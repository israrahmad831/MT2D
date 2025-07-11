import React, { useState, useEffect, useCallback } from 'react';
import { Player, Enemy } from '../../types';
import { SkillManager } from '../../skills/SkillManager';

interface AbilityBarProps {
  player: Player;
  enemies: Enemy[];
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  onDamageDealt?: (damage: number) => void;
  currentMap?: string;
}

interface TooltipPosition {
  x: number;
  y: number;
}

const AbilityBar: React.FC<AbilityBarProps> = ({ 
  player, 
  enemies, 
  setPlayer, 
  setEnemies, 
  onDamageDealt,
  currentMap 
}) => {
  const [cooldowns, setCooldowns] = useState<{ [key: string]: number }>({});
  const [tooltipSkill, setTooltipSkill] = useState<{
    name: string;
    description: string;
    icon: string;
    manaCost: number;
    damage: number;
    level: string;
    scaling: string;
    nextLevelScaling?: string;
    position: { x: number; y: number };
  } | null>(null);
  const [showMountTooltip, setShowMountTooltip] = useState(false);
  const [mountTooltipPosition, setMountTooltipPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  
  const corpSkills = SkillManager.getPhysicalSkills();
  const [skillOrder, setSkillOrder] = useState<number[]>([0, 4, 1, 3, 2, 5, -1, -1]);
  const [draggedSkill, setDraggedSkill] = useState<number | null>(null);

  // Check if we're in village map - if so, disable all abilities
  const isInVillage = currentMap === 'village';

  const updateCooldowns = useCallback(() => {
    const newCooldowns: { [key: string]: number } = {};
    corpSkills.forEach(skill => {
      const remaining = SkillManager.getRemainingCooldown(skill.id);
      if (remaining > 0) {
        newCooldowns[skill.id] = (remaining / skill.cooldown) * 360;
      }
    });
    setCooldowns(newCooldowns);
  }, [corpSkills]);
  
  useEffect(() => {
    const interval = setInterval(updateCooldowns, 33);
    return () => clearInterval(interval);
  }, [updateCooldowns]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setPlayer(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            mount: prev.mount?.active ? undefined : {
              active: true,
              type: 'manny',
              speedBonus: 0.1
            }
          };
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setPlayer]);

  const handleMountMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMountTooltipPosition({
      x: rect.left,
      y: rect.top - 10
    });
    setShowMountTooltip(true);
  };

  const handleMountMouseLeave = () => {
    setShowMountTooltip(false);
  };
  
  const handleSkillUse = useCallback((skillId: string) => {
    // If in village, don't allow any skill usage
    if (isInVillage) return;

    const skill = SkillManager.getSkillById(skillId);
    if (!skill) return;

    if (SkillManager.getRemainingCooldown(skillId) > 0) return;
    if (player.mana < skill.manaCost) return;
    if (player.controlsDisabled) return;

    // Allow red potion while mounted
    if (player.mount?.active && skill.id !== 'red-potion') return;

    SkillManager.useSkill(skillId, player, enemies, setPlayer, setEnemies, onDamageDealt);
    updateCooldowns();
  }, [player, enemies, setPlayer, setEnemies, onDamageDealt, updateCooldowns, isInVillage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      
      // If in village, don't allow any skill usage
      if (isInVillage) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        const skillIndex = skillOrder[index];
        if (skillIndex >= 0 && skillIndex < corpSkills.length) {
          handleSkillUse(corpSkills[skillIndex].id);
        }
      }
      else if (['F1', 'F2', 'F3', 'F4'].includes(key)) {
        e.preventDefault();
        const index = parseInt(key.replace('F', '')) + 3;
        const skillIndex = skillOrder[index];
        if (skillIndex >= 0 && skillIndex < corpSkills.length) {
          handleSkillUse(corpSkills[skillIndex].id);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [corpSkills, skillOrder, handleSkillUse, isInVillage]);

  const handleMouseEnter = (e: React.MouseEvent, skill: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentLevel = player.skillLevels?.[skill.id] || 1;
    const level = getSkillLevel(skill.id);
    const scaling = getSkillScaling(skill.id, currentLevel);
    const nextLevelScaling = getNextLevelScaling(skill.id, currentLevel);

    setTooltipSkill({
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
        y: rect.top + window.scrollY - 150
      }
    });
  };

  const handleMouseLeave = () => {
    setTooltipSkill(null);
  };

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

  const handleDragStart = (index: number) => {
    if (index === 8) return;
    setDraggedSkill(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (targetIndex === 8 || draggedSkill === null) return;
    
    const newOrder = [...skillOrder];
    const draggedValue = newOrder[draggedSkill];
    newOrder[draggedSkill] = newOrder[targetIndex];
    newOrder[targetIndex] = draggedValue;
    setSkillOrder(newOrder);
    setDraggedSkill(null);
  };
  
  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
        {skillOrder.map((skillIndex, index) => {
          const skill = skillIndex >= 0 && skillIndex < corpSkills.length ? corpSkills[skillIndex] : null;
          const isOnCooldown = skill && cooldowns[skill.id] > 0;
          const notEnoughMana = skill && player.mana < skill.manaCost;
          const remainingCooldown = skill ? SkillManager.getRemainingCooldown(skill.id) : 0;
          const isDisabled = player.mount?.active && skill?.id !== 'red-potion';
          const isVillageDisabled = isInVillage && skill; // Disable all skills in village
          
          return (
            <div 
              key={index} 
              className={`w-12 h-12 bg-gray-800 bg-opacity-80 border-2 ${skill ? 'border-yellow-600 cursor-pointer' : 'border-gray-600'} rounded flex items-center justify-center relative overflow-hidden`}
              onClick={() => skill && !isVillageDisabled && handleSkillUse(skill.id)}
              onMouseEnter={(e) => skill && handleMouseEnter(e, skill)}
              onMouseLeave={handleMouseLeave}
              draggable={!!skill && index !== 8}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              {skill ? (
                <>
                  <img 
                    src={skill.icon} 
                    alt={skill.name} 
                    className={`w-10 h-10 object-contain transition-all duration-200 ${(isOnCooldown || notEnoughMana || isDisabled || isVillageDisabled) ? 'grayscale opacity-50' : ''}`}
                  />
                  
                  {(isOnCooldown || notEnoughMana || isDisabled || isVillageDisabled) && (
                    <>
                      <div className="absolute inset-0 bg-black bg-opacity-40" />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold bg-black bg-opacity-70 px-1 rounded text-sm">
                          {isVillageDisabled ? 'X' :
                           isOnCooldown ? 
                            Math.ceil(remainingCooldown / 1000) :
                            isDisabled ? 'Mount' : 'MP'
                          }
                        </span>
                      </div>
                      
                      {isOnCooldown && (
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-40"
                          style={{
                            clipPath: `polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 50% 50%)`,
                            transform: `rotate(${cooldowns[skill.id]}deg)`,
                            transformOrigin: 'center',
                            transition: 'transform 0.033s linear'
                          }}
                        />
                      )}
                    </>
                  )}
                  
                  <div className="absolute bottom-0 right-0 bg-gray-900 rounded-tl px-1 text-xs text-white">
                    {index < 4 ? index + 1 : `F${index - 3}`}
                  </div>
                </>
              ) : index === 8 ? (
                <>
                  <img 
                    src="https://ro-wiki.metin2.gameforge.com/images/7/7f/Manny_%28Sigiliu%29.png"
                    alt="Mount Manny"
                    className={`w-10 h-10 object-contain transition-all duration-200 ${!player.mount?.active ? 'grayscale opacity-50' : ''}`}
                  />
                  <div className="absolute bottom-0 right-0 bg-gray-900 rounded-tl px-1 text-xs text-white">
                    Ctrl+G
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400">
                  {index < 4 ? index + 1 : `F${index - 3}`}
                </span>
              )}
            </div>
          );
        })}

        {/* Mount Manny Slot */}
        <div 
          className={`w-12 h-12 bg-gray-800 bg-opacity-80 border-2 ${player.mount?.active ? 'border-green-600' : 'border-gray-600'} rounded flex items-center justify-center relative overflow-hidden`}
          onMouseEnter={handleMountMouseEnter}
          onMouseLeave={handleMountMouseLeave}
        >
          <img 
            src="https://ro-wiki.metin2.gameforge.com/images/7/7f/Manny_%28Sigiliu%29.png"
            alt="Mount Manny"
            className={`w-10 h-10 object-contain transition-all duration-200 ${!player.mount?.active ? 'grayscale opacity-50' : ''}`}
          />
          <div className="absolute bottom-0 right-0 bg-gray-900 rounded-tl px-1 text-xs text-white">
            Ctrl+G
          </div>
        </div>
      </div>

      {/* Show village notification */}
      {isInVillage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-4 py-2 rounded z-50">
          <span className="text-yellow-400 pixel-text text-sm">
            Abilities are disabled in the Village
          </span>
        </div>
      )}

      {tooltipSkill && (
        <div 
          className="fixed z-50 bg-black bg-opacity-90 rounded-lg p-4 pointer-events-none"
          style={{
            left: tooltipSkill.position.x + 20,
            top: tooltipSkill.position.y - 150,
            maxWidth: '300px'
          }}
        >
          <div className="flex items-center mb-2">
            <img 
              src={tooltipSkill.icon}
              alt={tooltipSkill.name}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div className="ml-3">
              <h3 className="text-yellow-400 font-bold pixel-text text-sm">
                {tooltipSkill.name}
              </h3>
              <span className="text-blue-400 pixel-text text-xs">
                Level: {tooltipSkill.level}
              </span>
            </div>
          </div>

          <p className="text-gray-300 pixel-text text-xs mb-2">
            {tooltipSkill.description}
          </p>

          <div className="flex flex-col gap-1 pixel-text text-xs">
            <div className="flex justify-between">
              <span className="text-blue-400">
                Mana Cost: {tooltipSkill.manaCost}
              </span>
            </div>
            <div className="text-green-400">
              Current: {tooltipSkill.scaling}
            </div>
            {tooltipSkill.nextLevelScaling && (
              <div className="text-yellow-400">
                Next Level: {tooltipSkill.nextLevelScaling}
              </div>
            )}
          </div>
        </div>
      )}

      {showMountTooltip && (
        <div 
          className="fixed z-50 bg-black bg-opacity-90 rounded-lg p-4 pointer-events-none"
          style={{
            left: mountTooltipPosition.x + 20,
            top: mountTooltipPosition.y - 150,
            maxWidth: '300px'
          }}
        >
          <div className="flex items-start gap-3">
            <img 
              src="https://ro-wiki.metin2.gameforge.com/images/7/7f/Manny_%28Sigiliu%29.png"
              alt="Mount Manny"
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            <div>
              <h3 className="text-yellow-400 font-bold pixel-text text-sm mb-2">
                Mount Manny
              </h3>
              <p className="text-gray-300 pixel-text text-xs">
                A loyal mount that increases movement speed by 10%. While mounted, you can only use red potions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AbilityBar;