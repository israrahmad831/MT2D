import { Player, Enemy } from '../types';
import { PhysicalSkills } from './physical/PhysicalSkills';
import { MentalSkills } from './mental/MentalSkills';

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  manaCost: number;
  damage: number;
  lastUsed: number;
  type: 'corp' | 'mental';
  execute: (
    player: Player, 
    enemies: Enemy[], 
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    onDamageDealt?: (damage: number) => void
  ) => void;
  getDamage?: (player: Player) => number;
}

export class SkillManager {
  private static skills: Skill[] = [
    ...PhysicalSkills.getSkills(),
    ...MentalSkills.getSkills()
  ];

  // Separate cooldown tracking
  private static cooldowns: Map<string, number> = new Map();

  static getSkillById(id: string): Skill | undefined {
    return this.skills.find(skill => skill.id === id);
  }

  static getAllSkills(): Skill[] {
    return this.skills;
  }

  static getPhysicalSkills(): Skill[] {
    return this.skills.filter(skill => skill.type === 'corp');
  }

  static getMentalSkills(): Skill[] {
    return this.skills.filter(skill => skill.type === 'mental');
  }

  static useSkill(
    skillId: string, 
    player: Player, 
    enemies: Enemy[], 
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    onDamageDealt: (damage: number) => void
  ): boolean {
    const skill = this.getSkillById(skillId);
    if (!skill) return false;

    const currentTime = Date.now();
    const lastUsed = this.cooldowns.get(skillId) || 0;
    const remainingCooldown = this.getRemainingCooldown(skillId);

    if (remainingCooldown > 0) {
      return false;
    }

    if (player.mana < skill.manaCost) {
      return false;
    }

    // Set cooldown start time
    this.cooldowns.set(skillId, currentTime);

    // Update mana
    setPlayer(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mana: prev.mana - skill.manaCost
      };
    });

    // Execute skill
    skill.execute(player, enemies, setEnemies, setPlayer, onDamageDealt);
    return true;
  }

  static getRemainingCooldown(skillId: string): number {
    const skill = this.getSkillById(skillId);
    if (!skill) return 0;

    const currentTime = Date.now();
    const lastUsed = this.cooldowns.get(skillId) || 0;
    const elapsed = currentTime - lastUsed;

    return Math.max(0, skill.cooldown - elapsed);
  }

  static getCooldownPercent(skillId: string): number {
    const skill = this.getSkillById(skillId);
    if (!skill) return 0;

    const remaining = this.getRemainingCooldown(skillId);
    if (remaining <= 0) return 0;

    return (remaining / skill.cooldown) * 100;
  }

  static getSkillDamage(skillId: string, player: Player): number {
    const skill = this.getSkillById(skillId);
    if (!skill || !skill.getDamage) return 0;
    return skill.getDamage(player);
  }

  static resetCooldown(skillId: string): void {
    this.cooldowns.delete(skillId);
  }

  static resetAllCooldowns(): void {
    this.cooldowns.clear();
  }
}