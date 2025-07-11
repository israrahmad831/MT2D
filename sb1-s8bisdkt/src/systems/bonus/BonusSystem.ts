import { InventoryItem, ItemBonus } from '../../types';

interface BonusRange {
  min: number;
  max: number;
  hardMax: number;
  hardMaxChance: number;
}

export class BonusSystem {
  static readonly MAX_BONUSES = 4; // For weapons and armor
  static readonly MAX_ACCESSORY_BONUSES = 2; // For accessories

  private static readonly WEAPON_BONUSES: { [key: string]: BonusRange } = {
    'Average Damage': { min: 1, max: 60, hardMax: 30, hardMaxChance: 0.01 },
    'Skill Damage': { min: -10, max: 5, hardMax: 10, hardMaxChance: 0.1 },
    'STR': { min: 1, max: 12, hardMax: 5, hardMaxChance: 0.05 },
    'DEX': { min: 1, max: 12, hardMax: 5, hardMaxChance: 0.05 },
    'VIT': { min: 1, max: 12, hardMax: 5, hardMaxChance: 0.05 },
    'INT': { min: 1, max: 12, hardMax: 5, hardMaxChance: 0.05 },
    'Critical Hit': { min: 1, max: 10, hardMax: 5, hardMaxChance: 0.05 },
    'Penetration': { min: 1, max: 10, hardMax: 5, hardMaxChance: 0.05 }
  };

  private static readonly ARMOR_BONUSES: { [key: string]: BonusRange } = {
    'Max HP': { min: 500, max: 2000, hardMax: 500, hardMaxChance: 0.05 },
    'Max MP': { min: 20, max: 200, hardMax: 20, hardMaxChance: 0.1 },
    'Sword Defense': { min: 5, max: 15, hardMax: 5, hardMaxChance: 0.1 },
    'Half-Human Defense': { min: 2, max: 15, hardMax: 5, hardMaxChance: 0.1 },
    'Arrow Defense': { min: 5, max: 15, hardMax: 5, hardMaxChance: 0.1 },
    'Boss Skill Defense': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.05 },
    'Attack Value': { min: 5, max: 50, hardMax: 10, hardMaxChance: 0.05 }
  };

  private static readonly ACCESSORY_BONUSES: { [key: string]: BonusRange } = {
    'Monster Damage': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.1 },
    'Critical Hit': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.1 },
    'Penetration': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.1 },
    'Boss Skill Defense': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.1 },
    'Half-Human Defense': { min: 1, max: 5, hardMax: 2, hardMaxChance: 0.1 }
  };

  private static generateRandomBonus(bonusType: string, range: BonusRange): number {
    const isHighRoll = Math.random() < range.hardMaxChance;
    
    if (isHighRoll) {
      // Generate value between hardMax and max
      return Math.floor(Math.random() * (range.max - range.hardMax + 1)) + range.hardMax;
    }
    
    // Generate value between min and hardMax
    return Math.floor(Math.random() * (range.hardMax - range.min + 1)) + range.min;
  }

  private static generateBonus(possibleBonuses: { [key: string]: BonusRange }, excludeTypes: string[] = []): ItemBonus {
    const bonusTypes = Object.keys(possibleBonuses).filter(type => !excludeTypes.includes(type));
    const selectedType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    const value = this.generateRandomBonus(selectedType, possibleBonuses[selectedType]);

    return {
      id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: selectedType,
      value: value
    };
  }

  static canAddBonus(item: InventoryItem): boolean {
    if (!item.bonuses) return true;
    
    if (['helmet', 'bracelet', 'earring', 'necklace'].includes(item.type)) {
      return item.bonuses.length < this.MAX_ACCESSORY_BONUSES;
    }
    
    if (['weapon', 'armor'].includes(item.type)) {
      return item.bonuses.length < this.MAX_BONUSES;
    }
    
    return false;
  }

  static addRandomBonus(item: InventoryItem): InventoryItem {
    if (!this.canAddBonus(item)) return item;
    if (!item.bonuses) item.bonuses = [];

    // Handle accessories
    if (['helmet', 'bracelet', 'earring', 'necklace'].includes(item.type)) {
      if (item.bonuses.length >= this.MAX_ACCESSORY_BONUSES) return item;
      
      const newItem = { ...item };
      const existingBonusTypes = newItem.bonuses.map(b => b.type);
      let newBonus: ItemBonus | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      // Keep trying to generate a unique bonus type
      while (!newBonus && attempts < maxAttempts) {
        const generatedBonus = this.generateBonus(this.ACCESSORY_BONUSES, existingBonusTypes);
        if (!existingBonusTypes.includes(generatedBonus.type)) {
          newBonus = generatedBonus;
        }
        attempts++;
      }

      if (newBonus) {
        newItem.bonuses = [...item.bonuses, newBonus];
        this.updateItemDescription(newItem);
        return newItem;
      }
      
      return item;
    }

    // Handle weapons and armor
    if (!['weapon', 'armor'].includes(item.type)) return item;
    if (item.bonuses.length >= this.MAX_BONUSES) return item;

    const bonusPool = item.type === 'weapon' ? this.WEAPON_BONUSES : this.ARMOR_BONUSES;
    const newItem = { ...item };
    const existingBonusTypes = newItem.bonuses.map(b => b.type);
    
    // For weapons, ensure Average Damage and Skill Damage are first and second
    if (item.type === 'weapon') {
      // If no bonuses exist, add Average Damage
      if (item.bonuses.length === 0) {
        const avgDamageBonus = {
          id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Average Damage',
          value: this.generateRandomBonus('Average Damage', bonusPool['Average Damage'])
        };
        newItem.bonuses = [avgDamageBonus];
      }
      // If only Average Damage exists, add Skill Damage
      else if (item.bonuses.length === 1) {
        const skillDamageBonus = {
          id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Skill Damage',
          value: this.generateRandomBonus('Skill Damage', bonusPool['Skill Damage'])
        };
        newItem.bonuses = [...item.bonuses, skillDamageBonus];
      }
      // For additional bonuses, add random ones excluding existing types
      else {
        let newBonus: ItemBonus | null = null;
        let attempts = 0;
        const maxAttempts = 10;

        while (!newBonus && attempts < maxAttempts) {
          const generatedBonus = this.generateBonus(bonusPool, existingBonusTypes);
          if (!existingBonusTypes.includes(generatedBonus.type)) {
            newBonus = generatedBonus;
          }
          attempts++;
        }

        if (newBonus) {
          newItem.bonuses = [...item.bonuses, newBonus];
        }
      }
    } else {
      // For armor, add random bonuses excluding existing types
      let newBonus: ItemBonus | null = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!newBonus && attempts < maxAttempts) {
        const generatedBonus = this.generateBonus(bonusPool, existingBonusTypes);
        if (!existingBonusTypes.includes(generatedBonus.type)) {
          newBonus = generatedBonus;
        }
        attempts++;
      }

      if (newBonus) {
        newItem.bonuses = [...item.bonuses, newBonus];
      }
    }

    // Update description
    this.updateItemDescription(newItem);

    return newItem;
  }

  static rerollAllBonuses(item: InventoryItem): InventoryItem {
    if (!item.bonuses || item.bonuses.length === 0) return item;

    const newItem = { ...item };
    const bonusCount = item.bonuses.length;
    newItem.bonuses = [];

    // Handle accessories
    if (['helmet', 'bracelet', 'earring', 'necklace'].includes(item.type)) {
      const usedTypes = new Set<string>();
      
      while (newItem.bonuses.length < bonusCount) {
        const newBonus = this.generateBonus(this.ACCESSORY_BONUSES);
        if (!usedTypes.has(newBonus.type)) {
          usedTypes.add(newBonus.type);
          newItem.bonuses.push(newBonus);
        }
      }
      
      this.updateItemDescription(newItem);
      return newItem;
    }

    // For weapons, ensure Average Damage and Skill Damage are first and second
    if (item.type === 'weapon') {
      // Add Average Damage first
      const avgDamageBonus = {
        id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'Average Damage',
        value: this.generateRandomBonus('Average Damage', this.WEAPON_BONUSES['Average Damage'])
      };
      newItem.bonuses.push(avgDamageBonus);

      // Add Skill Damage second if there was more than one bonus
      if (bonusCount > 1) {
        const skillDamageBonus = {
          id: `bonus-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'Skill Damage',
          value: this.generateRandomBonus('Skill Damage', this.WEAPON_BONUSES['Skill Damage'])
        };
        newItem.bonuses.push(skillDamageBonus);
      }

      // Add remaining random bonuses
      const usedTypes = new Set(['Average Damage', 'Skill Damage']);
      
      while (newItem.bonuses.length < bonusCount) {
        const newBonus = this.generateBonus(this.WEAPON_BONUSES);
        if (!usedTypes.has(newBonus.type)) {
          usedTypes.add(newBonus.type);
          newItem.bonuses.push(newBonus);
        }
      }
    } else {
      // For armor, just reroll all bonuses randomly
      const usedTypes = new Set<string>();
      
      while (newItem.bonuses.length < bonusCount) {
        const newBonus = this.generateBonus(this.ARMOR_BONUSES);
        if (!usedTypes.has(newBonus.type)) {
          usedTypes.add(newBonus.type);
          newItem.bonuses.push(newBonus);
        }
      }
    }

    // Update description
    this.updateItemDescription(newItem);

    return newItem;
  }

  private static updateItemDescription(item: InventoryItem) {
    // Get base description (everything before bonuses)
    const baseDescription = item.description?.split('\n\nBonuses:')[0] || item.description || '';

    // If no bonuses, keep base description
    if (!item.bonuses || item.bonuses.length === 0) {
      item.description = baseDescription;
      return;
    }

    // Add bonuses section
    const bonusesText = item.bonuses
      .map(bonus => {
        const sign = bonus.value >= 0 ? '+' : '';
        return `${bonus.type}: ${sign}${bonus.value}${this.getBonusSuffix(bonus.type)}`;
      })
      .join('\n');

    item.description = `${baseDescription}\n\nBonuses:\n${bonusesText}`;
  }

  private static getBonusSuffix(bonusType: string): string {
    switch (bonusType) {
      case 'Average Damage':
      case 'Skill Damage':
      case 'Critical Hit':
      case 'Penetration':
      case 'Sword Defense':
      case 'Half-Human Defense':
      case 'Arrow Defense':
      case 'Boss Skill Defense':
      case 'Monster Damage':
        return '%';
      default:
        return '';
    }
  }
}