import { Enemy } from '../types';

export interface StatusEffect {
  type: 'stun';
  startTime: number;
  duration: number;
}

export class StatusEffectManager {
  static applyStun(
    enemy: Enemy,
    duration: number
  ): Enemy {
    return {
      ...enemy,
      statusEffects: {
        ...enemy.statusEffects,
        stun: {
          type: 'stun',
          startTime: Date.now(),
          duration
        }
      }
    };
  }

  static isStunned(enemy: Enemy): boolean {
    const stun = enemy.statusEffects?.stun;
    if (!stun) return false;

    const currentTime = Date.now();
    const elapsedTime = currentTime - stun.startTime;
    return elapsedTime < stun.duration;
  }

  static getStunTimeRemaining(enemy: Enemy): number {
    const stun = enemy.statusEffects?.stun;
    if (!stun) return 0;

    const currentTime = Date.now();
    const elapsedTime = currentTime - stun.startTime;
    return Math.max(0, stun.duration - elapsedTime);
  }
}