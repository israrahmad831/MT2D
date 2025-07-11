import { InventoryItem } from '../types';
import { WeaponItems } from './categories/WeaponItems';
import { ScrollItems } from './categories/ScrollItems';
import { ArmorItems } from './categories/ArmorItems';
import { GemItems } from './categories/GemItems';
import { BonusItems } from './categories/BonusItems';
import { UpgradeItems } from './categories/UpgradeItems';
import { ChestItems } from './categories/ChestItems';
import { TeleportItems } from './categories/TeleportItems';
import { BuildingItems } from './categories/BuildingItems'; // Import noua categorie

export class GameItems {
  // Itemurile existente
  static readonly BLESSING_SCROLL = ScrollItems.BLESSING_SCROLL;
  static readonly SWORD_PLUS_0 = WeaponItems.SWORD_PLUS_0;
  static readonly FULL_MOON_SWORD_PLUS_0 = WeaponItems.FULL_MOON_SWORD_PLUS_0;
  static readonly MONK_PLATE_ARMOR = ArmorItems.MONK_PLATE_ARMOR;
  static readonly LETHAL_PLATE_ARMOR = ArmorItems.LETHAL_PLATE_ARMOR;
  static readonly TRADITIONAL_HELMET = ArmorItems.TRADITIONAL_HELMET;
  static readonly WOODEN_EARRINGS = ArmorItems.WOODEN_EARRINGS;
  static readonly WOODEN_BRACELET = ArmorItems.WOODEN_BRACELET;
  static readonly WOODEN_NECKLACE = ArmorItems.WOODEN_NECKLACE;
  static readonly DIAMOND = GemItems.DIAMOND;
  static readonly STONE_OF_MONSTERS = GemItems.STONE_OF_MONSTERS;
  static readonly STONE_OF_DEATHBLOW = GemItems.STONE_OF_DEATHBLOW;
  static readonly STONE_OF_PENETRATION = GemItems.STONE_OF_PENETRATION;
  static readonly STONE_OF_HASTE = GemItems.STONE_OF_HASTE;
  static readonly STONE_OF_VITALITY = GemItems.STONE_OF_VITALITY;
  static readonly STONE_OF_DEFENCE = GemItems.STONE_OF_DEFENCE;
  static readonly IMPROVE_ITEM = BonusItems.IMPROVE_ITEM;
  static readonly ENCHANT_ITEM = BonusItems.ENCHANT_ITEM;
  static readonly POWER_ADDITIVE = BonusItems.POWER_ADDITIVE;
  static readonly ORISON = BonusItems.ORISON;
  static readonly BEAR_GALL = UpgradeItems.BEAR_GALL;
  static readonly BEAR_FOOT_SKIN = UpgradeItems.BEAR_FOOT_SKIN;
  static readonly MOONLIGHT_CHEST = ChestItems.MOONLIGHT_CHEST;
  static readonly JEWELRY_CHEST = ChestItems.JEWELRY_CHEST;
  static readonly WARRIORS_CHEST = ChestItems.WARRIORS_CHEST;
  static readonly GOLD_PIECE = ChestItems.GOLD_PIECE;
  static readonly UPGRADE_CHEST = ChestItems.UPGRADE_CHEST;
  static readonly TELEPORT_RING = TeleportItems.TELEPORT_RING;
  
  // Adaugă noul item
  static readonly BUILDING_MATERIAL = BuildingItems.BUILDING_MATERIAL;

  static readonly ALL_ITEMS: InventoryItem[] = [
    ...ScrollItems.ALL_SCROLLS,
    ...WeaponItems.ALL_WEAPONS,
    ...ArmorItems.ALL_ARMORS,
    ...GemItems.ALL_GEMS,
    ...BonusItems.ALL_BONUS_ITEMS,
    ...UpgradeItems.ALL_UPGRADE_ITEMS,
    ...ChestItems.ALL_CHESTS,
    ...TeleportItems.ALL_TELEPORT_ITEMS,
    ...BuildingItems.ALL_BUILDING_ITEMS // Adaugă noua categorie
  ];

  static getItemById(id: string): InventoryItem | undefined {
    return GameItems.ALL_ITEMS.find(item => item.id === id);
  }
}