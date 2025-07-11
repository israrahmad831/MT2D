import { InventoryItem } from '../../types';
import { generateId } from '../../utils';

export class BuildingItems {
  static readonly BUILDING_MATERIAL: InventoryItem = {
    id: 'building-material',
    name: 'Building Material',
    description: 'Magic material allowing you to draw your path in the world',
    type: 'material',
    icon: 'https://i.imgur.com/JEpd9hW.png', // Imaginea pentru material de construcție
    rarity: 'common',
    value: 100,
    slotId: '0',
    stackSize: 1,
    maxStack: 200
  };

  static readonly ALL_BUILDING_ITEMS: InventoryItem[] = [
    BuildingItems.BUILDING_MATERIAL
  ];
}