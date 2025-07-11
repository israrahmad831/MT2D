import { Enemy, Player } from '../../types';
import { generateId } from '../../utils';

export class TigerusManager {
  static readonly BOSS_POSITION = { x: 2169, y: 1573 };
  static readonly ATTACK_INTERVAL = 3000;
  static readonly ATTACK_DAMAGE = 50;
  static readonly ATTACK_RANGE = 100;
  static readonly AGGRO_RANGE = 200;
  static readonly RESPAWN_TIME = 180000;
  static readonly ATTACK_EFFECT_DURATION = 1000;
  static readonly DAMAGE_DELAY = 500;
  static readonly COLLISION_RADIUS = 40;

  static createTigerus(deathTime?: number): Enemy {
    return {
      id: generateId(),
      name: 'Tigerus',
      type: 'boss',
      position: { ...this.BOSS_POSITION },
      health: deathTime ? 0 : 50000,
      maxHealth: 50000,
      level: 50,
      damage: this.ATTACK_DAMAGE,
      experienceGiven: 500,
      isHit: false,
      hitTime: 0,
      isSelected: false,
      collisionRadius: this.COLLISION_RADIUS,
      deathTime,
      isActive: true,
      movement: {
        active: true,
        speed: 0,
        direction: { x: 0, y: 0 },
        changeDirectionTime: 0,
        lastAttackTime: 0,
        lastRoamTime: 0,
        lastAggroTime: 0,
        isAggressive: false,
        aggroLevel: 0,
        currentVelocity: { x: 0, y: 0 }
      }
    };
  }

  static updateBoss(boss: Enemy, player: Player): Enemy {
    if (!boss || boss.health <= 0) return boss;

    const currentTime = Date.now();
    const distanceToPlayer = Math.sqrt(
      Math.pow(player.position.x - boss.position.x, 2) +
      Math.pow(player.position.y - boss.position.y, 2)
    );

    // Check if player is in aggro range
    if (distanceToPlayer <= this.AGGRO_RANGE && !boss.movement?.isAggressive) {
      return {
        ...boss,
        movement: {
          ...boss.movement,
          isAggressive: true,
          lastAggroTime: currentTime
        }
      };
    }

    // Check if boss should attack
    if (
      boss.movement?.isAggressive &&
      distanceToPlayer <= this.ATTACK_RANGE &&
      (!boss.movement.lastAttackTime || currentTime - boss.movement.lastAttackTime >= this.ATTACK_INTERVAL)
    ) {
      return {
        ...boss,
        movement: {
          ...boss.movement,
          lastAttackTime: currentTime
        }
      };
    }

    return boss;
  }

  static shouldRespawn(enemy: Enemy): boolean {
    if (!enemy.deathTime || enemy.type !== 'boss') return false;
    
    const currentTime = Date.now();
    const timeSinceDeath = currentTime - enemy.deathTime;
    return timeSinceDeath >= this.RESPAWN_TIME;
  }

  static handlePlayerAttack(boss: Enemy): Enemy {
    if (!boss.movement?.isAggressive) {
      return {
        ...boss,
        movement: {
          ...boss.movement,
          isAggressive: true,
          lastAggroTime: Date.now()
        }
      };
    }
    return boss;
  }

  static handleCollision(player: Player, boss: Enemy): Player {
    if (!boss || boss.health <= 0) return player;

    const dx = player.position.x - boss.position.x;
    const dy = player.position.y - boss.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.COLLISION_RADIUS) {
      const angle = Math.atan2(dy, dx);
      return {
        ...player,
        position: {
          x: boss.position.x + Math.cos(angle) * this.COLLISION_RADIUS,
          y: boss.position.y + Math.sin(angle) * this.COLLISION_RADIUS
        }
      };
    }

    return player;
  }
}