import { InventoryItem } from '../../types';

interface UpgradeRequirements {
  bearGall?: number;
  bearFootSkin?: number;
}

export class UpgradeSystem {
  static readonly AVAILABLE_BONUSES = [
    { type: 'Average Damage', min: 1, max: 60 },
    { type: 'Skill Damage', min: -10, max: 5 },
    { type: 'STR', min: 1, max: 12 },
    { type: 'DEX', min: 1, max: 12 },
    { type: 'VIT', min: 1, max: 12 },
    { type: 'INT', min: 1, max: 12 },
    { type: 'Critical Hit', min: 1, max: 10 },
    { type: 'Penetration', min: 1, max: 10 }
  ];

  static readonly MAX_BONUSES = 4;

  static getCurrentPlus(item: InventoryItem): number {
    const match = item.name.match(/\+(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  static getRandomBonus(): { type: string; value: number } {
    const bonus = this.AVAILABLE_BONUSES[Math.floor(Math.random() * this.AVAILABLE_BONUSES.length)];
    const value = Math.floor(Math.random() * (bonus.max - bonus.min + 1)) + bonus.min;
    return { type: bonus.type, value };
  }

  static getUpgradeRates(currentPlus: number, itemType: string, itemId?: string): {
    successRate: number;
    cost: number;
    requirements?: UpgradeRequirements;
  } {
    const baseRates = {
      0: { successRate: 100, cost: 100 },
      1: { successRate: 80, cost: 100 },
      2: { successRate: 80, cost: 100 },
      3: { successRate: 80, cost: 100 },
      4: { successRate: 70, cost: 300 },
      5: { successRate: 70, cost: 300 },
      6: { successRate: 60, cost: 1000 },
      7: { successRate: 60, cost: 1000 },
      8: { successRate: 40, cost: 2000 }
    }[currentPlus] || { successRate: 40, cost: 2000 };

    // Special requirements for Lethal Plate Armor and Full Moon Sword
    if ((itemType === 'armor' && itemId === 'lethal-plate-armor') || 
        (itemType === 'weapon' && itemId === 'full-moon-sword-plus-0')) {
      if (currentPlus === 5) {
        return { ...baseRates, requirements: { bearGall: 1, bearFootSkin: 1 } };
      } else if (currentPlus === 6) {
        return { ...baseRates, requirements: { bearGall: 2, bearFootSkin: 2 } };
      } else if (currentPlus === 7) {
        return { ...baseRates, requirements: { bearGall: 3, bearFootSkin: 3 } };
      } else if (currentPlus === 8) {
        return { ...baseRates, requirements: { bearGall: 4, bearFootSkin: 4 } };
      }
    }

    // Add Bear Gall requirements for armor, helmet, and necklace
    if (['armor', 'helmet', 'necklace'].includes(itemType) && 
        itemId !== 'lethal-plate-armor') {
      if (currentPlus === 6) {
        return { ...baseRates, requirements: { bearGall: 1 } };
      } else if (currentPlus === 7) {
        return { ...baseRates, requirements: { bearGall: 2 } };
      } else if (currentPlus === 8) {
        return { ...baseRates, requirements: { bearGall: 3 } };
      }
    }

    // Add Bear Foot Skin requirements for weapons, earrings, and bracelets
    if (['weapon', 'earring', 'bracelet'].includes(itemType) && 
        itemId !== 'full-moon-sword-plus-0') {
      if (currentPlus === 6) {
        return { ...baseRates, requirements: { bearFootSkin: 1 } };
      } else if (currentPlus === 7) {
        return { ...baseRates, requirements: { bearFootSkin: 2 } };
      } else if (currentPlus === 8) {
        return { ...baseRates, requirements: { bearFootSkin: 3 } };
      }
    }

    return baseRates;
  }

  static canUpgrade(item: InventoryItem): boolean {
    const upgradableTypes = ['weapon', 'armor', 'helmet', 'earring', 'bracelet', 'necklace'];
    if (!upgradableTypes.includes(item.type)) return false;

    const currentPlus = this.getCurrentPlus(item);
    return currentPlus < 9;
  }

  static hasRequiredItems(
    inventory: InventoryItem[],
    requirements?: { bearGall?: number; bearFootSkin?: number }
  ): boolean {
    if (!requirements) return true;

    if (requirements.bearGall) {
      const bearGalls = inventory.filter(item => item.id === 'bear-gall');
      const totalBearGalls = bearGalls.reduce((total, item) => total + (item.stackSize || 1), 0);
      if (totalBearGalls < requirements.bearGall) return false;
    }

    if (requirements.bearFootSkin) {
      const bearFootSkins = inventory.filter(item => item.id === 'bear-foot-skin');
      const totalBearFootSkins = bearFootSkins.reduce((total, item) => total + (item.stackSize || 1), 0);
      if (totalBearFootSkins < requirements.bearFootSkin) return false;
    }

    return true;
  }

  static consumeRequiredItems(
    inventory: InventoryItem[],
    requirements?: { bearGall?: number; bearFootSkin?: number }
  ): InventoryItem[] {
    if (!requirements) return inventory;

    let updatedInventory = [...inventory];

    if (requirements.bearGall) {
      let remainingToConsume = requirements.bearGall;
      updatedInventory = updatedInventory.map(item => {
        if (item.id === 'bear-gall' && remainingToConsume > 0) {
          const itemStack = item.stackSize || 1;
          if (itemStack <= remainingToConsume) {
            remainingToConsume -= itemStack;
            return null; // Remove the item completely
          } else {
            const newStackSize = itemStack - remainingToConsume;
            remainingToConsume = 0;
            return { ...item, stackSize: newStackSize };
          }
        }
        return item;
      }).filter(Boolean) as InventoryItem[];
    }

    if (requirements.bearFootSkin) {
      let remainingToConsume = requirements.bearFootSkin;
      updatedInventory = updatedInventory.map(item => {
        if (item.id === 'bear-foot-skin' && remainingToConsume > 0) {
          const itemStack = item.stackSize || 1;
          if (itemStack <= remainingToConsume) {
            remainingToConsume -= itemStack;
            return null; // Remove the item completely
          } else {
            const newStackSize = itemStack - remainingToConsume;
            remainingToConsume = 0;
            return { ...item, stackSize: newStackSize };
          }
        }
        return item;
      }).filter(Boolean) as InventoryItem[];
    }

    return updatedInventory;
  }

  static tryUpgrade(
    item: InventoryItem,
    playerYang: number,
    inventory: InventoryItem[]
  ): {
    success: boolean;
    newItem?: InventoryItem;
    cost: number;
    newYang: number;
    newInventory: InventoryItem[];
    missingRequirements?: { bearGall?: number; bearFootSkin?: number };
  } {
    const currentPlus = this.getCurrentPlus(item);
    if (currentPlus >= 9) {
      return { 
        success: false, 
        cost: 0, 
        newYang: playerYang, 
        newInventory: inventory 
      };
    }

    const { successRate, cost, requirements } = this.getUpgradeRates(currentPlus, item.type, item.id);
    
    // Check if player has enough yang
    if (playerYang < cost) {
      return { 
        success: false, 
        cost, 
        newYang: playerYang, 
        newInventory: inventory 
      };
    }

    // Check if player has required items
    if (!this.hasRequiredItems(inventory, requirements)) {
      return { 
        success: false, 
        cost, 
        newYang: playerYang, 
        newInventory: inventory,
        missingRequirements: requirements 
      };
    }

    // Remove blessing scroll
    const updatedInventory = inventory.map(invItem => {
      if (invItem.id === 'blessing-scroll') {
        const newStackSize = (invItem.stackSize || 1) - 1;
        return newStackSize > 0 ? { ...invItem, stackSize: newStackSize } : null;
      }
      return invItem;
    }).filter(Boolean) as InventoryItem[];

    const roll = Math.random() * 100;
    const success = roll <= successRate;

    const newPlus = success ? currentPlus + 1 : Math.max(0, currentPlus - 1);
    const newStats = this.calculateNewStats(item, newPlus);

    // Handle bonuses
    let bonuses = [...(item.bonuses || [])];
    if (item.id === 'full-moon-sword-plus-0') {
      // For improve item
      if (!item.bonuses || item.bonuses.length === 0) {
        // Add initial Average Damage bonus
        bonuses = [{
          id: 'initial-avg-dmg',
          type: 'Average Damage',
          value: 5
        }];
        // Add random bonuses up to MAX_BONUSES
        while (bonuses.length < this.MAX_BONUSES) {
          const newBonus = this.getRandomBonus();
          // Avoid duplicate bonus types
          if (!bonuses.some(b => b.type === newBonus.type)) {
            bonuses.push({
              id: `bonus-${bonuses.length}`,
              ...newBonus
            });
          }
        }
      }
    }

    const newItem = {
      ...item,
      name: item.name.replace(/\+\d+/, `+${newPlus}`),
      stats: newStats,
      bonuses
    };

    // Always consume required items on attempt, regardless of success
    const finalInventory = this.consumeRequiredItems(updatedInventory, requirements);

    return {
      success,
      newItem,
      cost,
      newYang: playerYang - cost,
      newInventory: finalInventory
    };
  }

  static enchantItem(item: InventoryItem): InventoryItem {
    if (item.id !== 'full-moon-sword-plus-0' || !item.bonuses) {
      return item;
    }

    // Keep the first Average Damage bonus
    const averageDamageBonus = item.bonuses.find(b => b.type === 'Average Damage');
    if (!averageDamageBonus) return item;

    // Generate new random bonuses
    const newBonuses = [averageDamageBonus];
    while (newBonuses.length < this.MAX_BONUSES) {
      const newBonus = this.getRandomBonus();
      // Avoid duplicate bonus types
      if (!newBonuses.some(b => b.type === newBonus.type)) {
        newBonuses.push({
          id: `bonus-${newBonuses.length}`,
          ...newBonus
        });
      }
    }

    return {
      ...item,
      bonuses: newBonuses
    };
  }

  private static calculateNewStats(item: InventoryItem, newPlus: number): typeof item.stats {
    const baseStats = { ...item.stats } || {};
    
    if (item.type === 'weapon') {
      const attackBonus = item.id === 'full-moon-sword-plus-0' ? 3 : 2;
      const baseMin = item.id === 'full-moon-sword-plus-0' ? 47 : 27;
      const baseMax = item.id === 'full-moon-sword-plus-0' ? 49 : 29;
      
      return {
        ...baseStats,
        minAttack: baseMin + (newPlus * attackBonus),
        maxAttack: baseMax + (newPlus * attackBonus),
        attackSpeed: baseStats.attackSpeed || 5
      };
    } 
    else if (item.type === 'armor') {
      const defenseBonus = item.id === 'lethal-plate-armor' ? 3 : 2;
      const baseDefense = item.id === 'lethal-plate-armor' ? 8 : 5;
      
      return {
        ...baseStats,
        defense: baseDefense + (newPlus * defenseBonus)
      };
    }
    else if (item.type === 'helmet') {
      return {
        ...baseStats,
        defense: 2 + newPlus
      };
    }
    else if (item.type === 'earring') {
      return {
        ...baseStats,
        dexterity: 1 + Math.floor(newPlus / 2)
      };
    }
    else if (item.type === 'bracelet') {
      return {
        ...baseStats,
        attackSpeed: 1 + Math.floor(newPlus / 2)
      };
    }
    else if (item.type === 'necklace') {
      return {
        ...baseStats,
        fireResistance: 1 + Math.floor(newPlus / 2)
      };
    }

    return baseStats;
  }
}