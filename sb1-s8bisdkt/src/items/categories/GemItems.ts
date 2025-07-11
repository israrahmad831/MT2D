import { InventoryItem } from '../../types';

export class GemItems {
  static readonly DIAMOND: InventoryItem = {
    id: 'diamond',
    name: 'Diamond',
    type: 'gem',
    value: 5000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/e/ea/Diamond.png',
    stackSize: 1,
    maxStack: 50,
    description: 'The strongest and most well-known gem that can be worked into accessories and jewelry'
  };

  static readonly STONE_OF_MONSTERS: InventoryItem = {
    id: 'stone-of-monsters',
    name: 'Stone of Monsters',
    type: 'gem',
    subType: 'weapon',
    value: 3000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/f/fc/Stone_of_Monsters.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases damage against monsters by 5%',
    stats: {
      monsterDamage: 5
    }
  };

  static readonly STONE_OF_DEATHBLOW: InventoryItem = {
    id: 'stone-of-deathblow',
    name: 'Stone of Deathblow',
    type: 'gem',
    subType: 'weapon',
    value: 4000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/4/47/Stone_of_Deathblow.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases critical hit chance by 5%',
    stats: {
      criticalChance: 5
    }
  };

  static readonly STONE_OF_PENETRATION: InventoryItem = {
    id: 'stone-of-penetration',
    name: 'Stone of Penetration',
    type: 'gem',
    subType: 'weapon',
    value: 3500,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/1/1b/Stone_of_Penetration.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases attack damage by 10',
    stats: {
      attackDamage: 10
    }
  };

  static readonly STONE_OF_HASTE: InventoryItem = {
    id: 'stone-of-haste',
    name: 'Stone of Haste',
    type: 'gem',
    subType: 'armor',
    value: 3500,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/b/b8/Stone_of_Haste.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases movement speed by 5%',
    stats: {
      movementSpeed: 5
    }
  };

  static readonly STONE_OF_VITALITY: InventoryItem = {
    id: 'stone-of-vitality',
    name: 'Stone of Vitality',
    type: 'gem',
    subType: 'armor',
    value: 3500,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/1/19/Stone_of_Vitality.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases vitality by 10',
    stats: {
      vitality: 10
    }
  };

  static readonly STONE_OF_DEFENCE: InventoryItem = {
    id: 'stone-of-defence',
    name: 'Stone of Defence',
    type: 'gem',
    subType: 'armor',
    value: 3500,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/4/43/Stone_of_Defence.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Increases DEX by 10',
    stats: {
      dexterity: 10
    }
  };

  static readonly ALL_GEMS: InventoryItem[] = [
    GemItems.DIAMOND,
    GemItems.STONE_OF_MONSTERS,
    GemItems.STONE_OF_DEATHBLOW,
    GemItems.STONE_OF_PENETRATION,
    GemItems.STONE_OF_HASTE,
    GemItems.STONE_OF_VITALITY,
    GemItems.STONE_OF_DEFENCE
  ];
}