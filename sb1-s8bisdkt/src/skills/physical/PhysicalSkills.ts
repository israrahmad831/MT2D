import { Skill } from '../SkillManager';
import { SwordSpin } from './SwordSpin';
import { Dash } from './Dash';
import { ThreeWayCut } from './ThreeWayCut';
import { SwordAura } from './SwordAura';
import { Berserker } from './Berserker';
import { RedPotion } from './RedPotion';

export class PhysicalSkills {
  static getSkills(): Skill[] {
    return [
      SwordSpin.getSkill(),
      Dash.getSkill(),
      ThreeWayCut.getSkill(),
      SwordAura.getSkill(),
      Berserker.getSkill(),
      RedPotion.getSkill()
    ];
  }
}