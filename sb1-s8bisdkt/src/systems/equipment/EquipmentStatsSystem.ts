import { Player, InventoryItem, EquipmentStats } from '../../types';

export class EquipmentStatsSystem {
  static calculateEquipmentStats(inventory: InventoryItem[]): EquipmentStats {
    // Filter only equipped items with proper validation
    const equippedItems = inventory.filter(item => 
      item && 
      item.slotId && 
      typeof item.slotId === 'string' && 
      item.slotId.startsWith('equip-')
    );

    let totalStats: EquipmentStats = {
      attack: 0,
      defense: 0,
      attackSpeed: 0,
      dexterity: 0,
      fireResistance: 0,
      monsterDamage: 0,
      criticalChance: 0,
      vitality: 0,
      movementSpeed: 0
    };

    equippedItems.forEach(item => {
      if (item.stats) {
        // Add weapon stats
        if (item.stats.minAttack) {
          totalStats.attack += item.stats.minAttack;
        }
        if (item.stats.maxAttack) {
          totalStats.attack += item.stats.maxAttack;
        }
        if (item.stats.minMagicAttack) {
          totalStats.attack += item.stats.minMagicAttack;
        }
        if (item.stats.maxMagicAttack) {
          totalStats.attack += item.stats.maxMagicAttack;
        }
        
        // Add other stats
        if (item.stats.defense) totalStats.defense += item.stats.defense;
        if (item.stats.attackSpeed) totalStats.attackSpeed += item.stats.attackSpeed;
        if (item.stats.dexterity) totalStats.dexterity += item.stats.dexterity;
        if (item.stats.fireResistance) totalStats.fireResistance += item.stats.fireResistance;
        if (item.stats.monsterDamage) totalStats.monsterDamage += item.stats.monsterDamage;
        if (item.stats.criticalChance) totalStats.criticalChance += item.stats.criticalChance;
        if (item.stats.vitality) totalStats.vitality += item.stats.vitality;
        if (item.stats.movementSpeed) totalStats.movementSpeed += item.stats.movementSpeed;
      }

      // Add gem bonuses
      if (item.gemSlots) {
        item.gemSlots.forEach(slot => {
          if (!slot.isEmpty && slot.gem && slot.gem.stats) {
            const gem = slot.gem;
            if (gem.stats.monsterDamage) totalStats.monsterDamage += gem.stats.monsterDamage;
            if (gem.stats.criticalChance) totalStats.criticalChance += gem.stats.criticalChance;
            if (gem.stats.attackDamage) totalStats.attack += gem.stats.attackDamage;
            if (gem.stats.movementSpeed) totalStats.movementSpeed += gem.stats.movementSpeed;
            if (gem.stats.vitality) totalStats.vitality += gem.stats.vitality;
            if (gem.stats.dexterity) totalStats.dexterity += gem.stats.dexterity;
          }
        });
      }

      // Add item bonuses
      if (item.bonuses) {
        item.bonuses.forEach(bonus => {
          switch (bonus.type) {
            case 'Average Damage':
              totalStats.attack += bonus.value;
              break;
            case 'Skill Damage':
              totalStats.attack += bonus.value;
              break;
            case 'Critical Hit':
              totalStats.criticalChance += bonus.value;
              break;
            case 'Penetration':
              totalStats.attack += bonus.value;
              break;
          }
        });
      }
    });

    // Calculate multipliers
    totalStats.attackSpeedMultiplier = 1 + (totalStats.attackSpeed / 100);
    totalStats.movementSpeedMultiplier = 1 + (totalStats.movementSpeed / 100);

    return totalStats;
  }

  static applyEquipmentStats(player: Player, inventory: InventoryItem[]): Player {
    // Validate inventory array
    if (!Array.isArray(inventory)) {
      console.warn('Invalid inventory provided to applyEquipmentStats');
      return player;
    }

    const equipmentStats = this.calculateEquipmentStats(inventory);
    
    return {
      ...player,
      equipmentStats,
      attack: (player.baseStats?.str || 0) + equipmentStats.attack,
      defense: (player.baseStats?.vit || 0) + equipmentStats.defense,
      attackSpeedMultiplier: equipmentStats.attackSpeedMultiplier,
      movementSpeedMultiplier: equipmentStats.movementSpeedMultiplier
    };
  }
}