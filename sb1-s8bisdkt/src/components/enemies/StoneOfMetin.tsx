import React, { useState, useEffect, useRef } from 'react';
import { Enemy, Player } from '../../types';
import { generateId, calculateDistance } from '../../utils';
import { ExperienceSystem } from '../../systems/experience/ExperienceSystem';
import DamageNumber from '../DamageNumber';
import { MetinStoneManager } from '../../systems/monster/MetinStoneManager';
import { AttackManager } from '../../attacks/AttackManager';
import { GameItems } from '../../items/GameItems';

interface StoneOfMetinProps {
  position: { x: number; y: number };
  onSpawnWhiteTiger: (tiger: Enemy) => void;
  onDeath: () => void;
  player: Player;
}

const StoneOfMetin: React.FC<StoneOfMetinProps> = ({ position, onSpawnWhiteTiger, onDeath, player }) => {
  const [health, setHealth] = useState(8000 + Math.floor(Math.random() * 201));
  const [lastSpawnTime, setLastSpawnTime] = useState(0);
  const [isHit, setIsHit] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    position: { x: number; y: number };
    isCritical: boolean;
  }>>([]);
  const MIN_SPAWN_INTERVAL = 2000;
  const COLLISION_RADIUS = 30;
  const [tigers, setTigers] = useState<string[]>([]);
  const MAX_TIGERS = 3;
  const STONE_EXP = 10;
  const lastProcessedAttackRef = useRef<number>(0);
  const [hasDroppedChest, setHasDroppedChest] = useState(false);
  const stoneRef = useRef<HTMLDivElement>(null);

  const handleDamageNumberComplete = (id: string) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  };

  const findStackableSlot = (item: any): string | null => {
    for (let i = 0; i < 45; i++) {
      const slotId = `inv-${i}`;
      const existingItem = player.inventory.find(invItem => invItem.slotId === slotId);
      
      if (existingItem && 
          ((existingItem.id === item.id) || 
           (existingItem.type === item.type && existingItem.name === item.name)) && 
          existingItem.stackSize && existingItem.maxStack &&
          existingItem.stackSize < existingItem.maxStack) {
        return slotId;
      }
    }
    return null;
  };

  const findFirstEmptyInventorySlot = (): string | null => {
    for (let i = 0; i < 45; i++) {
      const slotId = `inv-${i}`;
      if (!player.inventory.some(item => item.slotId === slotId)) {
        return slotId;
      }
    }
    return null;
  };

  const addItemToInventory = (item: any) => {
    const stackableSlot = findStackableSlot(item);
    
    if (stackableSlot) {
      const updatedInventory = player.inventory.map(invItem => {
        if (invItem.slotId === stackableSlot) {
          return {
            ...invItem,
            stackSize: (invItem.stackSize || 1) + (item.stackSize || 1)
          };
        }
        return invItem;
      });
      
      player.inventory = updatedInventory;
    } else {
      const emptySlot = findFirstEmptyInventorySlot();
      if (emptySlot) {
        // For stackable items like chests, preserve the original ID
        if (item.type === 'chest' || item.stackable) {
          const newItem = {
            ...item,
            slotId: emptySlot,
            stackSize: item.stackSize || 1
          };
          player.inventory.push(newItem);
        } else {
          // For non-stackable items, use a unique ID
          const newItem = {
            ...item,
            id: generateId(),
            slotId: emptySlot
          };
          player.inventory.push(newItem);
        }
      }
    }
  };

  useEffect(() => {
    if (health <= 0 && !hasDroppedChest) {
      tigers.forEach(tigerId => {
        const tigerElement = document.querySelector(`[data-tiger-id="${tigerId}"]`);
        if (tigerElement) {
          tigerElement.classList.add('enemy-death');
        }
      });

      const updatedPlayer = ExperienceSystem.gainExperience(player, STONE_EXP);
      Object.assign(player, updatedPlayer);

      // Enhanced drop table with Building Material as actual item
      const dropRoll = Math.random() * 100;
      let selectedItem;
      
      if (dropRoll < 25) {
        selectedItem = GameItems.MOONLIGHT_CHEST;
      } else if (dropRoll < 45) {
        selectedItem = GameItems.JEWELRY_CHEST;
      } else if (dropRoll < 60) {
        selectedItem = GameItems.WARRIORS_CHEST;
      } else if (dropRoll < 75) {
        selectedItem = GameItems.GOLD_PIECE;
      } else if (dropRoll < 90) {
        selectedItem = GameItems.UPGRADE_CHEST;
      } else {
        // Create a fresh Building Material item with proper properties
        selectedItem = {
          ...GameItems.BUILDING_MATERIAL,
          id: 'building-material', // Keep the base ID for recognition
          stackSize: 1,
          maxStack: 200
        };
      }
      
      // Add the item to inventory as an actual item
      addItemToInventory(selectedItem);

      const notificationsContainer = document.getElementById('chest-notifications');
      if (notificationsContainer) {
        const notification = document.createElement('div');
        notification.className = 'bg-black bg-opacity-80 text-yellow-400 px-4 py-2 rounded text-sm animate-fadeIn';
        notification.textContent = `You got: ${selectedItem.name}`;
        notificationsContainer.appendChild(notification);

        setTimeout(() => {
          notification.classList.add('animate-fadeOut');
          setTimeout(() => {
            if (notification.parentNode === notificationsContainer) {
              notificationsContainer.removeChild(notification);
            }
          }, 300);
        }, 2000);
      }

      setHasDroppedChest(true);
      
      MetinStoneManager.handleMetinDeath({
        type: 'stone-of-metin',
        position,
        health: 0,
        maxHealth: 10000,
        id: generateId(),
        name: 'Stone of Metin',
        isHit: false,
        hitTime: 0
      });
      
      setTimeout(() => onDeath(), 500);
    }
  }, [health, onDeath, player, tigers, position, hasDroppedChest]);

  const spawnWhiteTiger = () => {
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime < MIN_SPAWN_INTERVAL) return;
    if (tigers.length >= MAX_TIGERS) return;

    const angle = Math.random() * Math.PI * 2;
    const spawnRadius = 60;
    const tigerId = generateId();
    
    const tiger: Enemy = {
      id: tigerId,
      type: 'white-tiger',
      position: {
        x: position.x + Math.cos(angle) * spawnRadius,
        y: position.y + Math.sin(angle) * spawnRadius
      },
      health: 5000,
      maxHealth: 5000,
      targetPlayerId: player.id,
      spawnTime: Date.now(),
      parentMetinId: generateId()
    };

    setTigers(prev => [...prev, tigerId]);
    onSpawnWhiteTiger(tiger);
    setLastSpawnTime(currentTime);
  };

  useEffect(() => {
    if (!player.isAttacking) {
      lastProcessedAttackRef.current = 0;
      return;
    }

    if (player.attackSequence === lastProcessedAttackRef.current) {
      return;
    }

    const distance = calculateDistance(position, player.position);
    const attackRadius = 80;
    
    if (distance <= attackRadius) {
      lastProcessedAttackRef.current = player.attackSequence;

      const hitbox = AttackManager.calculateSwordHitbox(
        player.position,
        player.direction,
        player.attackSequence
      );

      const metinEnemy: Enemy = {
        id: generateId(),
        type: 'stone-of-metin',
        position,
        health,
        maxHealth: 10000,
        isHit: false,
        hitTime: 0
      };

      const [updatedEnemy] = AttackManager.checkEnemyHits(hitbox, [metinEnemy], player);
      const damageDone = metinEnemy.health - updatedEnemy.health;

      if (damageDone > 0) {
        setHealth(prev => {
          const newHealth = Math.max(0, prev - damageDone);
          if (newHealth > 0 && tigers.length < MAX_TIGERS) {
            spawnWhiteTiger();
          }
          return newHealth;
        });

        setDamageNumbers(prev => [...prev, {
          id: generateId(),
          damage: damageDone,
          position: { ...position },
          isCritical: damageDone > 15
        }]);

        setIsHit(true);
        setTimeout(() => setIsHit(false), 200);
      }
    }
  }, [player.isAttacking, player.attackSequence, player.position, player.direction, position, tigers.length, health]);

  return (
    <>
      <div
        ref={stoneRef}
        className={`absolute transition-opacity duration-200 ${isHit ? 'opacity-70' : 'opacity-100'}`}
        style={{
          left: position.x,
          top: position.y,
          width: 64,
          height: 64,
          transform: 'translate(-50%, -50%)',
          zIndex: Math.floor(position.y)
        }}
      >
        <img 
          src="https://i.imgur.com/smRpWH4.gif"
          alt="Stone of Metin"
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        
        {/* Health bar */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden shadow-lg">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(health / 10000) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {damageNumbers.map(({ id, damage, position, isCritical }) => (
        <DamageNumber
          key={id}
          id={id}
          damage={damage}
          position={position}
          isCritical={isCritical}
          onComplete={() => handleDamageNumberComplete(id)}
        />
      ))}
    </>
  );
};

export default StoneOfMetin;