// Obfuscăm codul pentru a proteja jocul
import { InventoryItem } from '../../types';

// Funcție de obfuscare pentru string-uri
const _0x4e8a = function(str: string): string {
  return str.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ 0x7)
  ).join('');
};

// Funcție de deobfuscare
const _0x5c4e = function(str: string): string {
  return str.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ 0x7)
  ).join('');
};

// Obfuscăm valorile constante
const _0x1a2b = {
  MONK_ID: _0x4e8a('monk-plate-armor'),
  MONK_NAME: _0x4e8a('Monk Plate Armour+0'),
  MONK_TYPE: _0x4e8a('armor'),
  MONK_VALUE: 1500,
  MONK_ICON: _0x4e8a('https://i.imgur.com/33SVCR0.png'),
  MONK_DEFENSE: 5,
  MONK_LEVEL: 1,
  
  LETHAL_ID: _0x4e8a('lethal-plate-armor'),
  LETHAL_NAME: _0x4e8a('Lethal Plate Armour+0'),
  LETHAL_TYPE: _0x4e8a('armor'),
  LETHAL_VALUE: 2500,
  LETHAL_ICON: _0x4e8a('https://en-wiki.metin2.gameforge.com/images/b/ba/Lethal_Plate_Armour.png'),
  LETHAL_DEFENSE: 8,
  LETHAL_LEVEL: 30,
  
  HELMET_ID: _0x4e8a('traditional-helmet'),
  HELMET_NAME: _0x4e8a('Traditional Helmet+0'),
  HELMET_TYPE: _0x4e8a('helmet'),
  HELMET_VALUE: 1000,
  HELMET_ICON: _0x4e8a('https://i.imgur.com/28Joct2.png'),
  HELMET_DEFENSE: 2,
  HELMET_LEVEL: 1,
  
  EARRINGS_ID: _0x4e8a('wooden-earrings'),
  EARRINGS_NAME: _0x4e8a('Wooden Earrings+0'),
  EARRINGS_TYPE: _0x4e8a('earring'),
  EARRINGS_VALUE: 500,
  EARRINGS_ICON: _0x4e8a('https://i.imgur.com/xlfxoCx.png'),
  EARRINGS_DEX: 1,
  EARRINGS_LEVEL: 1,
  
  BRACELET_ID: _0x4e8a('wooden-bracelet'),
  BRACELET_NAME: _0x4e8a('Wooden Bracelet+0'),
  BRACELET_TYPE: _0x4e8a('bracelet'),
  BRACELET_VALUE: 500,
  BRACELET_ICON: _0x4e8a('https://i.imgur.com/jGazMYV.png'),
  BRACELET_ATTACK_SPEED: 1,
  BRACELET_LEVEL: 1,
  
  NECKLACE_ID: _0x4e8a('wooden-necklace'),
  NECKLACE_NAME: _0x4e8a('Wooden Necklace+0'),
  NECKLACE_TYPE: _0x4e8a('necklace'),
  NECKLACE_VALUE: 500,
  NECKLACE_ICON: _0x4e8a('https://i.imgur.com/HdHHSOY.png'),
  NECKLACE_FIRE_RES: 1,
  NECKLACE_LEVEL: 1,
};

export class ArmorItems {
  static readonly MONK_PLATE_ARMOR: InventoryItem = {
    id: _0x5c4e(_0x1a2b.MONK_ID),
    name: _0x5c4e(_0x1a2b.MONK_NAME),
    type: _0x5c4e(_0x1a2b.MONK_TYPE),
    value: _0x1a2b.MONK_VALUE,
    slotId: 'inv-2',
    icon: _0x5c4e(_0x1a2b.MONK_ICON),
    size: {
      width: 1,
      height: 2
    },
    stats: {
      defense: _0x1a2b.MONK_DEFENSE
    },
    requirements: {
      level: _0x1a2b.MONK_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.MONK_LEVEL}
Defense: ${_0x1a2b.MONK_DEFENSE}
[Equippable]
Warrior`,
    gemSlots: []
  };

  static readonly LETHAL_PLATE_ARMOR: InventoryItem = {
    id: _0x5c4e(_0x1a2b.LETHAL_ID),
    name: _0x5c4e(_0x1a2b.LETHAL_NAME),
    type: _0x5c4e(_0x1a2b.LETHAL_TYPE),
    value: _0x1a2b.LETHAL_VALUE,
    slotId: 'inv-2',
    icon: _0x5c4e(_0x1a2b.LETHAL_ICON), 
    size: {
      width: 1,
      height: 2
    },
    stats: {
      defense: _0x1a2b.LETHAL_DEFENSE
    },
    requirements: {
      level: _0x1a2b.LETHAL_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.LETHAL_LEVEL}
Defense: ${_0x1a2b.LETHAL_DEFENSE}
[Equippable]
Warrior`,
    gemSlots: []
  };

  static readonly TRADITIONAL_HELMET: InventoryItem = {
    id: _0x5c4e(_0x1a2b.HELMET_ID),
    name: _0x5c4e(_0x1a2b.HELMET_NAME),
    type: _0x5c4e(_0x1a2b.HELMET_TYPE),
    value: _0x1a2b.HELMET_VALUE,
    slotId: 'inv-3',
    icon: _0x5c4e(_0x1a2b.HELMET_ICON),
    stats: {
      defense: _0x1a2b.HELMET_DEFENSE
    },
    requirements: {
      level: _0x1a2b.HELMET_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.HELMET_LEVEL}
Defense: ${_0x1a2b.HELMET_DEFENSE}
[Equippable]
Warrior`
  };

  static readonly WOODEN_EARRINGS: InventoryItem = {
    id: _0x5c4e(_0x1a2b.EARRINGS_ID),
    name: _0x5c4e(_0x1a2b.EARRINGS_NAME),
    type: _0x5c4e(_0x1a2b.EARRINGS_TYPE),
    value: _0x1a2b.EARRINGS_VALUE,
    slotId: 'inv-4',
    icon: _0x5c4e(_0x1a2b.EARRINGS_ICON),
    stats: {
      dexterity: _0x1a2b.EARRINGS_DEX
    },
    requirements: {
      level: _0x1a2b.EARRINGS_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.EARRINGS_LEVEL}
DEX: +${_0x1a2b.EARRINGS_DEX}
[Equippable]
Warrior`
  };

  static readonly WOODEN_BRACELET: InventoryItem = {
    id: _0x5c4e(_0x1a2b.BRACELET_ID),
    name: _0x5c4e(_0x1a2b.BRACELET_NAME),
    type: _0x5c4e(_0x1a2b.BRACELET_TYPE),
    value: _0x1a2b.BRACELET_VALUE,
    slotId: 'inv-5',
    icon: _0x5c4e(_0x1a2b.BRACELET_ICON),
    stats: {
      attackSpeed: _0x1a2b.BRACELET_ATTACK_SPEED
    },
    requirements: {
      level: _0x1a2b.BRACELET_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.BRACELET_LEVEL}
Attack Speed: +${_0x1a2b.BRACELET_ATTACK_SPEED}%
[Equippable]
Warrior`
  };

  static readonly WOODEN_NECKLACE: InventoryItem = {
    id: _0x5c4e(_0x1a2b.NECKLACE_ID),
    name: _0x5c4e(_0x1a2b.NECKLACE_NAME),
    type: _0x5c4e(_0x1a2b.NECKLACE_TYPE),
    value: _0x1a2b.NECKLACE_VALUE,
    slotId: 'inv-6',
    icon: _0x5c4e(_0x1a2b.NECKLACE_ICON),
    stats: {
      fireResistance: _0x1a2b.NECKLACE_FIRE_RES
    },
    requirements: {
      level: _0x1a2b.NECKLACE_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.NECKLACE_LEVEL}
Fire Resistance: ${_0x1a2b.NECKLACE_FIRE_RES}%
[Equippable]
Warrior`
  };

  // Adăugăm o funcție falsă pentru a induce în eroare
  private static _calculateDefense(baseDefense: number, level: number): number {
    const multiplier = 1 + (level * 0.05);
    return Math.floor(baseDefense * multiplier);
  }

  // Adăugăm o proprietate statică falsă
  private static readonly _armorTypes = [
    'light', 'medium', 'heavy', 'robe', 'leather', 'plate', 'chain'
  ];

  // Adăugăm o metodă statică falsă
  private static _getRandomArmorType(): string {
    const index = Math.floor(Math.random() * this._armorTypes.length);
    return this._armorTypes[index];
  }

  static readonly ALL_ARMORS: InventoryItem[] = [
    ArmorItems.MONK_PLATE_ARMOR,
    ArmorItems.LETHAL_PLATE_ARMOR,
    ArmorItems.TRADITIONAL_HELMET,
    ArmorItems.WOODEN_EARRINGS,
    ArmorItems.WOODEN_BRACELET,
    ArmorItems.WOODEN_NECKLACE
  ];
}

// Adăugăm cod mort pentru a face analiza statică mai dificilă
if (false) {
  const _0x3c4d5e = {
    generateArmor: (level: number) => {
      const types = ['light', 'medium', 'heavy', 'robe', 'leather', 'plate', 'chain'];
      const type = types[Math.floor(Math.random() * types.length)];
      const defense = Math.floor(5 + level * 1.5);
      
      return {
        id: `${type}-${level}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Armor+${level}`,
        type: 'armor',
        value: level * 150,
        stats: {
          defense
        }
      };
    }
  };
  
  console.log(_0x3c4d5e.generateArmor(10));
}