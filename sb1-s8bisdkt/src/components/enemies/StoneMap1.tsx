import React, { useState, useEffect, useRef } from 'react';
import { Enemy, Player } from '../../types';
import { generateId, calculateDistance } from '../../utils';
import { ExperienceSystem } from '../../systems/experience/ExperienceSystem';
import DamageNumber from '../DamageNumber';
import { MetinStoneManager } from '../../systems/monster/MetinStoneManager';
import { AttackManager } from '../../attacks/AttackManager';
import { GameItems } from '../../items/GameItems';

interface StoneMap1Props {
  position: { x: number; y: number };
  onDeath: () => void;
  player: Player;
}

const StoneMap1: React.FC<StoneMap1Props> = ({ position, onDeath, player }) => {
  const [health, setHealth] = useState(4000 + Math.floor(Math.random() * 201));
  const [isHit, setIsHit] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    position: { x: number; y: number };
    isCritical: boolean;
  }>>([]);
  const COLLISION_RADIUS = 30;
  const STONE_EXP = 5;
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
      const updatedPlayer = ExperienceSystem.gainExperience(player, STONE_EXP);
      Object.assign(player, updatedPlayer);

      // Enhanced drop table with Building Material as actual item
      const dropRoll = Math.random() * 100;
      let selectedItem;
      
      if (dropRoll < 50) {
        selectedItem = GameItems.MOONLIGHT_CHEST;
      } else if (dropRoll < 80) {
        selectedItem = GameItems.GOLD_PIECE;
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
        type: 'stone-of-map1',
        position,
        health: 0,
        maxHealth: 10000,
        id: generateId(),
        name: 'Stone of Map1',
        isHit: false,
        hitTime: 0
      });
      
      setTimeout(() => onDeath(), 500);
    }
  }, [health, onDeath, player, position, hasDroppedChest]);

  useEffect(() => {
    const distance = calculateDistance(position, player.position);
    if (distance < COLLISION_RADIUS) {
      const angle = Math.atan2(player.position.y - position.y, player.position.x - position.x);
      const newX = position.x + Math.cos(angle) * COLLISION_RADIUS;
      const newY = position.y + Math.sin(angle) * COLLISION_RADIUS;
      
      player.position.x = newX;
      player.position.y = newY;
    }
  }, [player.position, position]);

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
        type: 'stone-of-map1',
        position,
        health,
        maxHealth: 4200,
        isHit: false,
        hitTime: 0
      };

      const [updatedEnemy] = AttackManager.checkEnemyHits(hitbox, [metinEnemy], player);
      const damageDone = metinEnemy.health - updatedEnemy.health;

      if (damageDone > 0) {
        setHealth(prev => {
          const newHealth = Math.max(0, prev - damageDone);
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
  }, [player.isAttacking, player.attackSequence, player.position, player.direction, position, health]);

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
          src="https://i.imgur.com/Dypgayh.gif"
          alt="Stone of Map1"
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
        
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden shadow-lg">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(health / 4000) * 100}%` }}
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

export default StoneMap1;