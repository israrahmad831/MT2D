import { Enemy, Player } from '../../types';

export interface Player {
  id: string;
  name: string;
  class: 'Warrior';
  position: {
    x: number;
    y: number;
  };
  direction: {
    x: number;
    y: number;
  };
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  attackSequence: number;
  attackFrame: number;
  lastAttackTime: number;
  isAttacking: boolean;
  targetEnemy?: string;
  isMoving?: boolean;
  controlsDisabled?: boolean;
  baseStats: {
    vit: number;
    str: number;
    int: number;
    dex: number;
  };
  statPoints: number;
  skillPoints?: number;
  isStatsWindowOpen?: boolean;
  skillLevels?: {
    [skillId: string]: number;
  };
  levelUpEffect?: {
    active: boolean;
    startTime: number;
    duration: number;
  };
  buffs?: {
    swordAura?: {
      active: boolean;
      startTime: number;
      duration: number;
      multiplier: number;
    };
    berserker?: {
      active: boolean;
      startTime: number;
      duration: number;
      speedMultiplier: number;
    };
  };
  autoAttacking?: boolean;
  mount?: {
    active: boolean;
    type: 'manny';
    speedBonus: number;
  };
  inventory: InventoryItem[];
  isInventoryOpen: boolean;
  yang: number;
  inventoryPosition: {
    x: number;
    y: number;
  };
  equipmentStats?: EquipmentStats;
  attackSpeedMultiplier?: number;
  movementSpeedMultiplier?: number;
}

export interface StatusEffects {
  stun?: {
    type: 'stun';
    startTime: number;
    duration: number;
  };
}

export interface Enemy {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  health: number;
  maxHealth: number;
  level: number;
  damage: number;
  experienceGiven: number;
  isHit: boolean;
  hitTime: number;
  isSelected?: boolean;
  collisionRadius?: number;
  knockback?: {
    active: boolean;
    direction: {
      x: number;
      y: number;
    };
    distance: number;
    startTime: number;
    duration: number;
  };
  movement?: {
    active: boolean;
    speed: number;
    direction: {
      x: number;
      y: number;
    };
    changeDirectionTime: number;
    lastAttackTime: number;
    lastRoamTime: number;
    lastAggroTime: number;
    isAggressive: boolean;
    aggroLevel: number;
    currentVelocity: {
      x: number;
      y: number;
    };
  };
  statusEffects?: StatusEffects;
  stats?: {
    vit: number;
    str: number;
    int: number;
    dex: number;
  };
  spawnPoint?: {
    x: number;
    y: number;
  };
  deathTime?: number;
  lastDamageDealt?: number;
  lastDamageTime?: number;
}

export interface AttackHitbox {
  position: {
    x: number;
    y: number;
  };
  direction: {
    x: number;
    y: number;
  };
  angle: number;
  radius: number;
  sequence: number;
  duration?: number;
  type?: 'sword';
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'misc' | 'scroll' | 'helmet' | 'earring' | 'bracelet' | 'necklace' | 'gem' | 'chest' | 'material';
  subType?: 'weapon' | 'armor';
  value: number;
  slotId: string;
  icon: string;
  description?: string;
  stackSize?: number;
  maxStack?: number;
  size?: {
    width: number;
    height: number;
  };
  stats?: {
    minAttack?: number;
    maxAttack?: number;
    minMagicAttack?: number;
    maxMagicAttack?: number;
    attackSpeed?: number;
    defense?: number;
    dexterity?: number;
    fireResistance?: number;
    monsterDamage?: number;
    criticalChance?: number;
    attackDamage?: number;
    movementSpeed?: number;
    vitality?: number;
  };
  requirements?: {
    level?: number;
    classes?: string[];
  };
  gemSlots?: GemSlot[];
  bonuses?: ItemBonus[];
}

export interface GemSlot {
  id: string;
  isEmpty: boolean;
  gem?: InventoryItem;
}

export interface ItemBonus {
  id: string;
  type: string;
  value: number;
}

export interface DroppedItem extends InventoryItem {
  position: { x: number; y: number };
  dropTime: number;
}

export interface EquipmentStats {
  attack: number;
  defense: number;
  attackSpeed: number;
  dexterity: number;
  fireResistance: number;
  monsterDamage: number;
  criticalChance: number;
  vitality: number;
  movementSpeed: number;
  totalAttack?: number;
  totalDefense?: number;
  attackSpeedMultiplier?: number;
  movementSpeedMultiplier?: number;
}