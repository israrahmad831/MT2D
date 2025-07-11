// Obfuscăm codul pentru a proteja jocul
import { InventoryItem } from '../../types';

// Funcție de obfuscare pentru string-uri
const _0x4e8a = function(str: string): string {
  return str.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ 0x5)
  ).join('');
};

// Funcție de deobfuscare
const _0x5c4e = function(str: string): string {
  return str.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) ^ 0x5)
  ).join('');
};

// Obfuscăm valorile constante
const _0x1a2b = {
  SWORD_ID: _0x4e8a('sword-plus-0'),
  SWORD_NAME: _0x4e8a('Sword+0'),
  SWORD_TYPE: _0x4e8a('weapon'),
  SWORD_VALUE: 1000,
  SWORD_ICON: _0x4e8a('https://i.imgur.com/SiKfXAi.png'),
  SWORD_MIN_ATTACK: 27,
  SWORD_MAX_ATTACK: 29,
  SWORD_ATTACK_SPEED: 5,
  SWORD_LEVEL: 1,
  
  FULL_MOON_ID: _0x4e8a('full-moon-sword-plus-0'),
  FULL_MOON_NAME: _0x4e8a('Full Moon Sword+0'),
  FULL_MOON_TYPE: _0x4e8a('weapon'),
  FULL_MOON_VALUE: 1000,
  FULL_MOON_ICON: _0x4e8a('https://ro-wiki.metin2.gameforge.com/images/9/95/Sabie_lun%C4%83_plin%C4%83.png'),
  FULL_MOON_MIN_ATTACK: 47,
  FULL_MOON_MAX_ATTACK: 49,
  FULL_MOON_ATTACK_SPEED: 5,
  FULL_MOON_LEVEL: 30,
};

export class WeaponItems {
  static readonly SWORD_PLUS_0: InventoryItem = {
    id: _0x5c4e(_0x1a2b.SWORD_ID),
    name: _0x5c4e(_0x1a2b.SWORD_NAME),
    type: _0x5c4e(_0x1a2b.SWORD_TYPE),
    value: _0x1a2b.SWORD_VALUE,
    slotId: 'inv-1',
    icon: _0x5c4e(_0x1a2b.SWORD_ICON),
    size: {
      width: 1,
      height: 2
    },
    stats: {
      minAttack: _0x1a2b.SWORD_MIN_ATTACK,
      maxAttack: _0x1a2b.SWORD_MAX_ATTACK,
      attackSpeed: _0x1a2b.SWORD_ATTACK_SPEED
    },
    requirements: {
      level: _0x1a2b.SWORD_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.SWORD_LEVEL}
Attack Value: ${_0x1a2b.SWORD_MIN_ATTACK}-${_0x1a2b.SWORD_MAX_ATTACK}
Attack Speed: ${_0x1a2b.SWORD_ATTACK_SPEED}%
[Equippable]
Warrior`,
    gemSlots: []
  };

  static readonly FULL_MOON_SWORD_PLUS_0: InventoryItem = {
    id: _0x5c4e(_0x1a2b.FULL_MOON_ID),
    name: _0x5c4e(_0x1a2b.FULL_MOON_NAME),
    type: _0x5c4e(_0x1a2b.FULL_MOON_TYPE),
    value: _0x1a2b.FULL_MOON_VALUE,
    slotId: 'inv-1',
    icon: _0x5c4e(_0x1a2b.FULL_MOON_ICON),
    size: {
      width: 1,
      height: 2
    },
    stats: {
      minAttack: _0x1a2b.FULL_MOON_MIN_ATTACK,
      maxAttack: _0x1a2b.FULL_MOON_MAX_ATTACK,
      attackSpeed: _0x1a2b.FULL_MOON_ATTACK_SPEED
    },
    requirements: {
      level: _0x1a2b.FULL_MOON_LEVEL,
      classes: ['Warrior']
    },
    description: `From Level: ${_0x1a2b.FULL_MOON_LEVEL}
Attack Value: ${_0x1a2b.FULL_MOON_MIN_ATTACK}-${_0x1a2b.FULL_MOON_MAX_ATTACK}
Attack Speed: ${_0x1a2b.FULL_MOON_ATTACK_SPEED}%
[Equippable]
Warrior`,
    gemSlots: [],
    bonuses: [
      {
        id: 'initial-avg-dmg',
        type: 'Average Damage',
        value: 5
      }
    ]
  };

  // Adăugăm o funcție falsă pentru a induce în eroare
  private static _calculateDamage(baseMin: number, baseMax: number, level: number): { min: number, max: number } {
    const multiplier = 1 + (level * 0.05);
    return {
      min: Math.floor(baseMin * multiplier),
      max: Math.floor(baseMax * multiplier)
    };
  }

  // Adăugăm o proprietate statică falsă
  private static readonly _weaponTypes = [
    'sword', 'axe', 'mace', 'dagger', 'bow', 'staff', 'spear'
  ];

  // Adăugăm o metodă statică falsă
  private static _getRandomWeaponType(): string {
    const index = Math.floor(Math.random() * this._weaponTypes.length);
    return this._weaponTypes[index];
  }

  static readonly ALL_WEAPONS: InventoryItem[] = [
    WeaponItems.SWORD_PLUS_0,
    WeaponItems.FULL_MOON_SWORD_PLUS_0
  ];
}

// Adăugăm cod mort pentru a face analiza statică mai dificilă
if (false) {
  const _0x3c4d5e = {
    generateWeapon: (level: number) => {
      const types = ['sword', 'axe', 'mace', 'dagger', 'bow', 'staff', 'spear'];
      const type = types[Math.floor(Math.random() * types.length)];
      const minAttack = Math.floor(10 + level * 2.5);
      const maxAttack = Math.floor(minAttack * 1.2);
      
      return {
        id: `${type}-${level}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)}+${level}`,
        type: 'weapon',
        value: level * 100,
        stats: {
          minAttack,
          maxAttack,
          attackSpeed: 5
        }
      };
    }
  };
  
  console.log(_0x3c4d5e.generateWeapon(10));
}