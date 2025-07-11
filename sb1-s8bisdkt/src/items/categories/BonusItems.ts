import { InventoryItem } from '../../types';

export class BonusItems {
  static readonly IMPROVE_ITEM: InventoryItem = {
    id: 'improve-item',
    name: 'Improve Item',
    type: 'scroll',
    value: 1000,
    slotId: 'inv-0',
    icon: 'https://ro-wiki.metin2.gameforge.com/images/f/fe/%C3%8Ent%C4%83rirea_Obiectului.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Adds a random bonus to a weapon or armor. Maximum 4 bonuses per item.'
  };

  static readonly ENCHANT_ITEM: InventoryItem = {
    id: 'enchant-item',
    name: 'Enchant Item',
    type: 'scroll',
    value: 2000,
    slotId: 'inv-0',
    icon: 'https://ro-wiki.metin2.gameforge.com/images/b/b9/Vr%C4%83je%C5%9Fte_Obiectul.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Rerolls all existing bonuses on a weapon or armor.'
  };

  static readonly POWER_ADDITIVE: InventoryItem = {
    id: 'power-additive',
    name: 'Power Additive',
    type: 'scroll',
    value: 1500,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/f/fd/Power_Additive.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Adds a random bonus to accessories (helmet, bracelet, earring, necklace). Maximum 2 bonuses per accessory.'
  };

  static readonly ORISON: InventoryItem = {
    id: 'orison',
    name: 'Orison',
    type: 'scroll',
    value: 3000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/6/61/Orison.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Rerolls all existing bonuses on accessories (helmet, bracelet, earring, necklace).'
  };

  static readonly ALL_BONUS_ITEMS: InventoryItem[] = [
    BonusItems.IMPROVE_ITEM,
    BonusItems.ENCHANT_ITEM,
    BonusItems.POWER_ADDITIVE,
    BonusItems.ORISON
  ];
}