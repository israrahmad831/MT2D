import React, { memo } from 'react';
import { InventoryItem } from '../../types';

// Obfuscăm numele interfețelor și tipurilor
interface _0x1a2b3c {
  item: InventoryItem;
  position: { x: number; y: number };
  player?: { level: number };
}

// Obfuscăm componenta ItemTooltip
const _0x4c5d6e: React.FC<_0x1a2b3c> = memo(({ item, position, player }) => {
  // Obfuscăm numele variabilelor
  const _0x7f8g9h: React.CSSProperties = {
    left: position.x + 20,
    maxWidth: '300px',
    border: '1px solid #3c1f1f',
    zIndex: 60,
    pointerEvents: 'none'
  };

  if (item.slotId?.startsWith('equip-')) {
    _0x7f8g9h.top = position.y + 20;
  } else {
    _0x7f8g9h.bottom = window.innerHeight - position.y + 20;
  }

  // Funcție obfuscată pentru a obține bonusul gemei
  const _0x0i1j2k = (_0x3l4m5n?: InventoryItem): string => {
    if (!_0x3l4m5n?.stats) return '';
    
    if (_0x3l4m5n.subType === 'weapon') {
      if (_0x3l4m5n.stats.monsterDamage) return `+${_0x3l4m5n.stats.monsterDamage}% Monster Damage`;
      if (_0x3l4m5n.stats.criticalChance) return `+${_0x3l4m5n.stats.criticalChance}% Critical Chance`;
      if (_0x3l4m5n.stats.attackDamage) return `+${_0x3l4m5n.stats.attackDamage} Attack Damage`;
    } else if (_0x3l4m5n.subType === 'armor') {
      if (_0x3l4m5n.stats.movementSpeed) return `+${_0x3l4m5n.stats.movementSpeed}% Movement Speed`;
      if (_0x3l4m5n.stats.vitality) return `+${_0x3l4m5n.stats.vitality} Vitality`;
      if (_0x3l4m5n.stats.dexterity) return `+${_0x3l4m5n.stats.dexterity} DEX`;
    }
    return '';
  };

  // Verificăm dacă jucătorul îndeplinește cerința de nivel
  const _0x6o7p8q = !item.requirements?.level || !player || player.level >= item.requirements.level;

  // Adăugăm o funcție falsă pentru a induce în eroare
  const _0x9r0s1t = (a: number, b: number): number => {
    return Math.pow(a, 2) + Math.pow(b, 2);
  };

  // Adăugăm o variabilă falsă pentru a induce în eroare
  const _0x2u3v4w = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const _0x5x6y7z = _0x2u3v4w[Math.floor(Math.random() * _0x2u3v4w.length)];

  return (
    <div 
      className="fixed bg-black bg-opacity-90 rounded-md p-3"
      style={_0x7f8g9h}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-center">
          <img 
            src={item.icon} 
            alt={item.name}
            className="w-12 h-12 object-contain"
            style={{
              width: item.size?.width ? `${item.size.width * 28}px` : '28px',
              height: item.size?.height ? `${item.size.height * 28}px` : '28px'
            }}
          />
          {item.stackSize && item.stackSize > 1 && (
            <span className="ml-2 text-yellow-400">x{item.stackSize}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-yellow-400 font-semibold text-sm text-center mb-2">
            {item.name}
          </h3>
          
          {/* Level requirement */}
          {item.requirements?.level && (
            <div className={`text-center text-xs mb-2 ${_0x6o7p8q ? 'text-green-400' : 'text-red-400'}`}>
              Required Level: {item.requirements.level}
            </div>
          )}
          
          <p className="text-gray-300 text-xs whitespace-pre-line leading-relaxed">
            {item.description?.split('\n\n')[0]}
          </p>
          
          {item.bonuses && item.bonuses.length > 0 && (
            <div className="mt-2 pt-2 border-t border-yellow-900/50">
              <div className="text-yellow-400 text-xs font-semibold mb-1">Bonuses</div>
              <div className="space-y-1">
                {item.bonuses.map((bonus, index) => (
                  <div key={bonus.id} className="text-yellow-400 text-xs">
                    {bonus.type}: {bonus.value >= 0 ? '+' : ''}{bonus.value}
                    {['Average Damage', 'Skill Damage', 'Critical Hit', 'Penetration'].includes(bonus.type) ? '%' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(item.type === 'weapon' || item.type === 'armor') && item.gemSlots && item.gemSlots.length > 0 && (
            <div className="mt-3 pt-2 border-t border-blue-900/30">
              <div className="text-blue-400 text-xs font-semibold mb-2">Gem Slots</div>
              <div className="space-y-2">
                {item.gemSlots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-500 bg-black bg-opacity-50 rounded-sm flex items-center justify-center">
                      {slot.isEmpty ? (
                        <span className="text-[10px] text-blue-400 font-bold">+</span>
                      ) : (
                        <img 
                          src={slot.gem?.icon} 
                          alt={slot.gem?.name} 
                          className="w-full h-full object-contain p-0.5"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-blue-300 text-xs">
                        {slot.isEmpty ? (
                          'Empty'
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>{slot.gem?.name}</span>
                            <span className="text-green-400">{_0x0i1j2k(slot.gem)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Adăugăm displayName pentru a evita avertismentele React
_0x4c5d6e.displayName = 'ItemTooltip';

// Exportăm componenta cu numele original pentru compatibilitate
export default _0x4c5d6e;