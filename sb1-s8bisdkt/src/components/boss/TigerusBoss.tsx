import React, { useState, useEffect, useCallback } from 'react';
import { Enemy, Player } from '../../types';
import { TigerusManager } from '../../systems/boss/TigerusManager';
import DamageNumber from '../DamageNumber';
import { calculateDistance } from '../../utils';

interface TigerusBossProps {
  boss: Enemy;
  player: Player;
  onDeath: () => void;
  onAttackPlayer: (damage: number) => void;
}

const TigerusBoss: React.FC<TigerusBossProps> = ({ boss, player, onDeath, onAttackPlayer }) => {
  const [isAttacking, setIsAttacking] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    position: { x: number; y: number };
  }>>([]);

  useEffect(() => {
    if (boss.health <= 0) {
      onDeath();
    }
  }, [boss.health, onDeath]);

  const handleDamageNumberComplete = useCallback((id: string) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  }, []);

  useEffect(() => {
    if (!boss.isActive || boss.health <= 0) return;

    const checkDistance = () => {
      const distance = calculateDistance(player.position, boss.position);
      if (distance <= TigerusManager.AGGRO_RANGE) {
        setIsActive(true);
      } else {
        setIsActive(false);
        setIsAttacking(false);
      }
    };

    const distanceInterval = setInterval(checkDistance, 100);
    return () => clearInterval(distanceInterval);
  }, [boss.isActive, boss.health, boss.position, player.position]);

  useEffect(() => {
    if (!isActive || !boss.movement?.isAggressive) return;

    const attackInterval = setInterval(() => {
      const distance = calculateDistance(player.position, boss.position);
      if (distance <= TigerusManager.ATTACK_RANGE) {
        setIsAttacking(true);
        createAttackEffect();

        setTimeout(() => {
          const currentDistance = calculateDistance(player.position, boss.position);
          if (currentDistance <= TigerusManager.ATTACK_RANGE) {
            onAttackPlayer(TigerusManager.ATTACK_DAMAGE);
            setDamageNumbers(prev => [...prev, {
              id: Math.random().toString(),
              damage: TigerusManager.ATTACK_DAMAGE,
              position: player.position
            }]);
          }
          setIsAttacking(false);
        }, TigerusManager.DAMAGE_DELAY);
      }
    }, TigerusManager.ATTACK_INTERVAL);

    return () => clearInterval(attackInterval);
  }, [isActive, boss.movement?.isAggressive, player.position, boss.position, onAttackPlayer]);

  const createAttackEffect = () => {
    const effectContainer = document.createElement('div');
    effectContainer.className = 'boss-attack-effect';
    effectContainer.style.cssText = `
      position: absolute;
      left: ${boss.position.x}px;
      top: ${boss.position.y}px;
      width: ${TigerusManager.ATTACK_RANGE * 2}px;
      height: ${TigerusManager.ATTACK_RANGE * 2}px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 15;
    `;

    const glow = document.createElement('div');
    glow.className = 'boss-attack-glow';
    effectContainer.appendChild(glow);

    for (let i = 0; i < 8; i++) {
      const bolt = document.createElement('div');
      bolt.className = 'boss-attack-bolt';
      bolt.style.setProperty('--bolt-angle', `${(i * Math.PI * 2) / 8}rad`);
      effectContainer.appendChild(bolt);
    }

    document.body.appendChild(effectContainer);

    setTimeout(() => {
      effectContainer.remove();
    }, TigerusManager.ATTACK_EFFECT_DURATION);
  };

  return (
    <div 
      className="boss-container absolute"
      style={{
        left: boss.position.x,
        top: boss.position.y,
        width: 90,
        height: 90,
        transform: 'perspective(2000px) rotateX(35deg) translate(-50%, -50%)',
        transformStyle: 'preserve-3d',
        zIndex: Math.floor(boss.position.y)
      }}
    >
      {/* Health bar */}
      <div 
        className="boss-health-container absolute"
        style={{
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110
        }}
      >
        <div className="boss-level-name text-sm text-center font-bold mb-1">
          <span className="text-green-400 drop-shadow-lg">Lv50</span>
          <span className="text-yellow-400 drop-shadow-lg ml-1 uppercase tracking-wider">9 Tail</span>
        </div>
        <div className="boss-health-bar bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="boss-health-fill h-1.5 bg-red-600 transition-all duration-300"
            style={{ width: `${(boss.health / boss.maxHealth) * 100}%` }}
          />
        </div>
      </div>

      {/* Boss sprite */}
      <div 
        className="boss-sprite w-full h-full relative"
        style={{
          backgroundImage: `url(${isAttacking ? 
            'https://i.imgur.com/KRdbOST.gif' : 
            'https://i.imgur.com/KRdbOST.gif'})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: boss.isHit ? 'brightness(1.5)' : 'none',
          transform: 'rotateX(-35deg)',
          transformOrigin: 'center bottom',
          scale: '1.5'
        }}
      />

      {/* Shadow */}
      <div
        className="absolute bottom-0 left-1/2"
        style={{
          width: '100px',
          height: '30px',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
          transform: 'translate(-50%, 50%) rotateX(90deg)',
          transformOrigin: 'center top',
          zIndex: 0
        }}
      />

      {/* Damage numbers */}
      {damageNumbers.map(dn => (
        <DamageNumber
          key={dn.id}
          damage={dn.damage}
          position={dn.position}
          onComplete={() => handleDamageNumberComplete(dn.id)}
          isEnemyDamage={true}
        />
      ))}

      <style jsx>{`
        .boss-health-bar {
          height: 4px;
        }

        @keyframes lightningPulse {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1); }
        }

        @keyframes lightningBolt {
          0% { opacity: 0; transform: translate(-50%, 0) rotate(var(--bolt-angle)) scaleY(0); }
          20% { opacity: 1; transform: translate(-50%, 0) rotate(var(--bolt-angle)) scaleY(1.2); }
          100% { opacity: 0; transform: translate(-50%, 0) rotate(var(--bolt-angle)) scaleY(1); }
        }

        .boss-attack-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,165,0,0.3) 0%, transparent 70%);
          animation: lightningPulse 1s ease-out;
        }

        .boss-attack-bolt {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 3px;
          height: ${TigerusManager.ATTACK_RANGE}px;
          background: linear-gradient(to bottom, rgba(255,165,0,0.8), transparent);
          transform-origin: center top;
          transform: translate(-50%, 0) rotate(var(--bolt-angle));
          animation: lightningBolt 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default React.memo(TigerusBoss);
