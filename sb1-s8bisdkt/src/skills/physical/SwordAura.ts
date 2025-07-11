import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';

export class SwordAura {
  static readonly SKILL_ID = 'sword-aura';
  static readonly SKILL_NAME = 'Sword Aura';
  static readonly SKILL_DESCRIPTION = 'Enhance your attacks with a powerful aura, increasing damage based on STR.';
  static readonly SKILL_ICON = 'https://i.imgur.com/oGASkmn.png';
  static readonly SKILL_COOLDOWN = 10000;
  static readonly SKILL_MANA_COST = 2;
  static readonly SKILL_DURATION = 120000;
  static readonly BASE_DAMAGE_MULTIPLIER = 1.2;
  static readonly CAST_TIME = 500;
  static readonly MAX_STR = 21;

  private static getDamageMultiplier(str: number): number {
    const strSteps = [
      { threshold: 0, multiplier: 1.20 },
      { threshold: 5, multiplier: 1.25 },
      { threshold: 10, multiplier: 1.30 },
      { threshold: 15, multiplier: 1.35 },
      { threshold: 20, multiplier: 1.40 }
    ];

    for (let i = strSteps.length - 1; i >= 0; i--) {
      if (str >= strSteps[i].threshold) {
        return strSteps[i].multiplier;
      }
    }

    return strSteps[0].multiplier;
  }

  private static getDescription(str: number): string {
    const multiplier = this.getDamageMultiplier(str);
    const damageIncrease = Math.round((multiplier - 1) * 100);
    return `Enhance your attacks with a powerful aura, increasing damage by ${damageIncrease}% (Scales with STR).`;
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
    const damageMultiplier = this.getDamageMultiplier(player.baseStats.str);

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        buffs: {
          ...prevPlayer.buffs,
          swordAura: {
            active: true,
            startTime: Date.now(),
            duration: this.SKILL_DURATION,
            multiplier: damageMultiplier
          }
        }
      };
    });
  }
}