import { InventoryItem } from '../../types';
import { GameItems } from '../../items/GameItems';
import { generateId } from '../../utils';

interface ChestLoot {
  item: InventoryItem;
  chance: number;
  stackable: boolean;
}

export class ChestManager {
  private static readonly CHEST_TYPES = {
    'moonlight-chest': {
      loot: [
        { item: GameItems.IMPROVE_ITEM, chance: 0.15, stackable: true },
        { item: GameItems.ENCHANT_ITEM, chance: 0.15, stackable: true },
        { item: GameItems.BLESSING_SCROLL, chance: 0.15, stackable: true },
        { item: GameItems.POWER_ADDITIVE, chance: 0.15, stackable: true },
        { item: GameItems.ORISON, chance: 0.15, stackable: true },
      ]
    },
    'jewelry-chest': {
      loot: [
        { item: GameItems.WOODEN_EARRINGS, chance: 0.1, stackable: false },
        { item: GameItems.WOODEN_BRACELET, chance: 0.1, stackable: false },
        { item: GameItems.WOODEN_NECKLACE, chance: 0.1, stackable: false },
        { item: GameItems.DIAMOND, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_MONSTERS, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_DEATHBLOW, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_PENETRATION, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_HASTE, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_VITALITY, chance: 0.1, stackable: true },
        { item: GameItems.STONE_OF_DEFENCE, chance: 0.1, stackable: true }
      ]
    },
    'warriors-chest': {
      loot: [
        { item: GameItems.SWORD_PLUS_0, chance: 0.3, stackable: false },
        { item: GameItems.MONK_PLATE_ARMOR, chance: 0.3, stackable: false },
        { item: GameItems.LETHAL_PLATE_ARMOR, chance: 0.25, stackable: false },
        { item: GameItems.FULL_MOON_SWORD_PLUS_0, chance: 0.15, stackable: false }
      ]
    },
    'upgrade-chest': {
      loot: [
        { item: GameItems.BEAR_FOOT_SKIN, chance: 0.4, stackable: true },
        { item: GameItems.BEAR_GALL, chance: 0.4, stackable: true },
        { item: GameItems.BUILDING_MATERIAL, chance: 0.2, stackable: true } // Added Building Material
      ]
    },
    'gold-piece': {
      loot: [
        { item: { id: 'yang-10', name: 'Yang', value: 10 }, chance: 0.4 },
        { item: { id: 'yang-50', name: 'Yang', value: 50 }, chance: 0.35 },
        { item: { id: 'yang-200', name: 'Yang', value: 200 }, chance: 0.25 }
      ]
    }
  };

  static openChest(chestId: string): {
    success: boolean;
    loot?: InventoryItem;
    yang?: number;
  } {
    const chestType = this.CHEST_TYPES[chestId as keyof typeof this.CHEST_TYPES];
    if (!chestType) return { success: false };

    const roll = Math.random();
    let cumulativeChance = 0;
    
    // Special handling for gold piece
    if (chestId === 'gold-piece') {
      for (const lootEntry of chestType.loot) {
        cumulativeChance += lootEntry.chance;
        if (roll < cumulativeChance) {
          return {
            success: true,
            yang: lootEntry.item.value
          };
        }
      }
      return { success: false };
    }

    // Normal chest handling
    for (const lootEntry of chestType.loot) {
      cumulativeChance += lootEntry.chance;
      if (roll < cumulativeChance) {
        // For stackable items, preserve the original item ID and properties
        const loot = lootEntry.stackable ? {
          ...lootEntry.item,
          stackSize: 1,
          maxStack: lootEntry.item.maxStack || 50
        } : {
          ...lootEntry.item,
          id: generateId()
        };

        return {
          success: true,
          loot
        };
      }
    }

    return { success: false };
  }

  static isChest(item: InventoryItem): boolean {
    return item.type === 'chest' && item.id in this.CHEST_TYPES;
  }
}