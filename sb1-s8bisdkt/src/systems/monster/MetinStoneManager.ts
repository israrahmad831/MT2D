import { Enemy } from '../../types';
import { generateId } from '../../utils';

interface MetinStone {
  position: { x: number; y: number };
  radius: number;
  maxWolves: number;
  lastDeathTime?: number;
}

export class MetinStoneManager {
  private static readonly METIN_RESPAWN_TIME = 20000;
  private static readonly SPAWN_MARGIN = 200;
  private static readonly MIN_DISTANCE_BETWEEN_STONES = 300;
  private static readonly CLEANUP_INTERVAL = 5000; // Cleanup dead stones every 5 seconds

  // Optimized spawn positions grid with fewer positions
  private static readonly SPAWN_POSITIONS = [
    // Center area - reduced from 4 to 2
    { x: 1230, y: 1230 },
    { x: 1630, y: 1630 },
    // North area - reduced from 3 to 2
    { x: 1030, y: 830 },
    { x: 1830, y: 830 },
    // South area - reduced from 3 to 2
    { x: 1030, y: 2030 },
    { x: 1830, y: 2030 },
    // East/West - reduced from 6 to 4
    { x: 2030, y: 1030 },
    { x: 2030, y: 1830 },
    { x: 830, y: 1030 },
    { x: 830, y: 1830 }
  ];

  private static metinStones: MetinStone[] = MetinStoneManager.SPAWN_POSITIONS.map(pos => ({
    position: pos,
    radius: 150,
    maxWolves: 3 // Reduced from 5 to 3
  }));

  // Cache for active stones to avoid recalculating
  private static activeStoneCache: Set<string> = new Set();
  private static lastCacheUpdate = 0;

  private static getMetinStoneId(position: { x: number; y: number }): string {
    return `metin_${position.x}_${position.y}`;
  }

  private static updateActiveStoneCache() {
    const currentTime = Date.now();
    if (currentTime - this.lastCacheUpdate < this.CLEANUP_INTERVAL) {
      return;
    }

    this.activeStoneCache.clear();
    this.metinStones.forEach(stone => {
      if (!stone.lastDeathTime || currentTime - stone.lastDeathTime >= this.METIN_RESPAWN_TIME) {
        this.activeStoneCache.add(this.getMetinStoneId(stone.position));
      }
    });
    this.lastCacheUpdate = currentTime;
  }

  static createMetinStone(position: { x: number; y: number }, deathTime?: number): Enemy {
    const metinId = this.getMetinStoneId(position);
    return {
      id: metinId,
      type: 'metin',
      name: 'Metin Stone',
      position: { ...position },
      health: deathTime ? 0 : 1000,
      maxHealth: 1000,
      level: 5,
      damage: 0,
      experienceGiven: 100,
      isHit: false,
      hitTime: 0,
      isSelected: false,
      collisionRadius: 30,
      deathTime,
      movement: {
        active: false,
        speed: 0,
        direction: { x: 0, y: 0 },
        changeDirectionTime: 0,
        lastAttackTime: 0,
        lastRoamTime: 0,
        lastAggroTime: 0,
        isAggressive: false,
        aggroLevel: 0,
        currentVelocity: { x: 0, y: 0 }
      },
      stats: {
        vit: 10,
        str: 0,
        int: 0,
        dex: 0
      }
    };
  }

  static getMetinStones(): Enemy[] {
    this.updateActiveStoneCache();
    const currentTime = Date.now();

    return this.metinStones.map(stone => {
      const stoneId = this.getMetinStoneId(stone.position);
      if (this.activeStoneCache.has(stoneId)) {
        return this.createMetinStone(stone.position);
      }
      return this.createMetinStone(stone.position, stone.lastDeathTime);
    });
  }

  static shouldRespawn(enemy: Enemy): boolean {
    if (!enemy.deathTime || enemy.type !== 'metin') return false;
    
    const currentTime = Date.now();
    const timeSinceDeath = currentTime - enemy.deathTime;
    return timeSinceDeath >= this.METIN_RESPAWN_TIME;
  }

  static handleMetinDeath(enemy: Enemy): void {
    if (enemy.type !== 'metin' && enemy.type !== 'stone-of-metin') return;
    
    const stone = this.metinStones.find(s => 
      s.position.x === enemy.position.x && 
      s.position.y === enemy.position.y
    );
    
    if (stone) {
      stone.lastDeathTime = Date.now();
      const stoneId = this.getMetinStoneId(stone.position);
      this.activeStoneCache.delete(stoneId);
    }
  }

  static getAllMetinStonePositions(): MetinStone[] {
    return this.metinStones;
  }

  static isMetinStoneActive(position: { x: number; y: number }): boolean {
    const stoneId = this.getMetinStoneId(position);
    return this.activeStoneCache.has(stoneId);
  }

  // Clean up dead stones and inactive wolves
  static cleanup() {
    const currentTime = Date.now();
    this.metinStones.forEach(stone => {
      if (stone.lastDeathTime && currentTime - stone.lastDeathTime >= this.METIN_RESPAWN_TIME) {
        stone.lastDeathTime = undefined;
      }
    });
    this.updateActiveStoneCache();
  }
}