import { InventoryItem } from '../../types';

export class ChestItems {
  static readonly MOONLIGHT_CHEST: InventoryItem = {
    id: 'moonlight-chest',
    name: 'Moonlight Chest',
    type: 'chest',
    value: 1000,
    slotId: 'inv-0',
    icon: 'https://ro-wiki.metin2.gameforge.com/images/d/dd/Cuf%C4%83r_Lumina_Lunii.png',
    stackSize: 1,
    maxStack: 50,
    description: 'A mysterious chest that may contain Improve Item, Enchant Item, Blessing Scroll, Power Additive, or Orison.'
  };

  static readonly JEWELRY_CHEST: InventoryItem = {
    id: 'jewelry-chest',
    name: 'Jewelry Chest',
    type: 'chest',
    value: 1000,
    slotId: 'inv-0',
    icon: 'https://img2.m2icondb.com/4a3ffdb2-aff3-4401-884a-1878e8aa5774.png',
    stackSize: 1,
    maxStack: 50,
    description: 'A chest containing precious accessories or a worthless diamond.'
  };

  static readonly WARRIORS_CHEST: InventoryItem = {
    id: 'warriors-chest',
    name: "Warrior's Chest",
    type: 'chest',
    value: 2000,
    slotId: 'inv-0',
    icon: 'https://img2.m2icondb.com/2564d1d2-3aad-4100-82fe-73ef9067635b.png',
    stackSize: 1,
    maxStack: 50,
    description: 'An ancient chest crafted by a legendary warrior. Contains powerful weapons or armor from ages past.'
  };

  static readonly GOLD_PIECE: InventoryItem = {
    id: 'gold-piece',
    name: 'Gold Piece',
    type: 'chest',
    value: 500,
    slotId: 'inv-0',
    icon: 'https://ro-wiki.metin2.gameforge.com/images/5/5c/Bucat%C4%83_de_aur.png',
    stackSize: 1,
    maxStack: 50,
    description: 'A piece of pure gold that can be exchanged for Yang.'
  };

  static readonly UPGRADE_CHEST: InventoryItem = {
    id: 'upgrade-chest',
    name: 'Upgrade Chest',
    type: 'chest',
    value: 1500,
    slotId: 'inv-0',
    icon: 'https://img.m2icondb.com/50244.png',
    stackSize: 1,
    maxStack: 50,
    description: 'A chest containing precious upgrade materials from ancient lost monsters.'
  };

  static readonly ALL_CHESTS: InventoryItem[] = [
    ChestItems.MOONLIGHT_CHEST,
    ChestItems.JEWELRY_CHEST,
    ChestItems.WARRIORS_CHEST,
    ChestItems.GOLD_PIECE,
    ChestItems.UPGRADE_CHEST
  ];
}