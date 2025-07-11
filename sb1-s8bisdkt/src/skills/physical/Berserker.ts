import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';

export class Berserker {
  static readonly SKILL_ID = 'berserker';
  static readonly SKILL_NAME = 'Berserker';
  static readonly SKILL_DESCRIPTION = 'Enter a berserker state, increasing movement speed (Scales with INT).';
  static readonly SKILL_ICON = 'https://i.imgur.com/64TUUYd.png';
  static readonly SKILL_COOLDOWN = 10000;
  static readonly SKILL_MANA_COST = 2;
  static readonly SKILL_DURATION = 120000;
  static readonly BASE_SPEED_MULTIPLIER = 1.15;
  static readonly CAST_TIME = 800;
  static readonly MAX_INT = 21;

  private static getSpeedMultiplier(int: number): number {
    const intSteps = [
      { threshold: 0, multiplier: 1.15 },
      { threshold: 5, multiplier: 1.18 },
      { threshold: 10, multiplier: 1.22 },
      { threshold: 15, multiplier: 1.26 },
      { threshold: 20, multiplier: 1.30 }
    ];

    for (let i = intSteps.length - 1; i >= 0; i--) {
      if (int >= intSteps[i].threshold) {
        return intSteps[i].multiplier;
      }
    }

    return intSteps[0].multiplier;
  }

  private static getDescription(int: number): string {
    const multiplier = this.getSpeedMultiplier(int);
    const speedIncrease = Math.round((multiplier - 1) * 100);
    return `Enter a berserker state, increasing movement speed by ${speedIncrease}% (Scales with INT).`;
  }

  static getSkill(): Skill {
    return {
      id: this.SKILL_ID,
      name: this.SKILL_NAME,
      description: this.SKILL_DESCRIPTION,
      icon: this.SKILL_ICON,
      cooldown: this.SKILL_COOLDOWN,
      manaCost: this.SKILL_MANA_COST,
      damage: 0,
      lastUsed: 0,
      type: 'corp',
      execute: this.execute.bind(this)
    };
  }

  static execute(
    player: Player,
    enemies: Enemy[],
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
  ): void {
    const speedMultiplier = this.getSpeedMultiplier(player.baseStats.int);

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        buffs: {
          ...prevPlayer.buffs,
          berserker: {
            active: true,
            startTime: Date.now(),
            duration: this.SKILL_DURATION,
            speedMultiplier: speedMultiplier
          }
        }
      };
    });
  }
}