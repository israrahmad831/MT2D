import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';

export class RedPotion {
  static readonly SKILL_ID = 'red-potion';
  static readonly SKILL_NAME = 'Red Potion';
  static readonly SKILL_DESCRIPTION = 'Drink a red potion to restore health (Scales with skill level).';
  static readonly SKILL_ICON = 'https://ro-wiki.metin2.gameforge.com/images/a/a1/Licoare_Ro%C8%99ie%28L%29.png';
  static readonly SKILL_COOLDOWN = 200; // 0.2 seconds
  static readonly SKILL_MANA_COST = 0;

  private static getHealingAmount(level: number): number {
    if (level >= 90) return 30;
    if (level >= 70) return 25;
    if (level >= 50) return 20;
    if (level >= 30) return 15;
    if (level >= 10) return 10;
    return 5;
  }

  private static getDescription(level: number): string {
    const healing = this.getHealingAmount(level);
    return `Drink a red potion to restore ${healing} health points.`;
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
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    const healAmount = this.getHealingAmount(level);

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        health: Math.min(prevPlayer.maxHealth, prevPlayer.health + healAmount)
      };
    });
  }
}