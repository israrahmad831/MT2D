import React, { useEffect, useState, useRef } from 'react';
import { Enemy, Player } from '../../types';
import { calculateDistance } from '../../utils';
import { ExperienceSystem } from '../../systems/experience/ExperienceSystem';
import DamageNumber from '../DamageNumber';

interface WhiteTigerProps {
  enemy: Enemy;
  player: Player;
  onMove: (id: string, newPosition: { x: number; y: number }) => void;
  onDeath: (id: string) => void;
}

const WhiteTiger: React.FC<WhiteTigerProps> = ({ enemy, player, onMove, onDeath }) => {
  const [isHit, setIsHit] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackCooldown, setAttackCooldown] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState([]);

  const positionRef = useRef(enemy.position);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastUpdateRef = useRef(performance.now());
  const lastDamageTimeRef = useRef(0);

  const MOVEMENT_THRESHOLD = 0.05;
  const MOVEMENT_SPEED = 0.1;
  const ATTACK_RANGE = 50;
  const ATTACK_DAMAGE = 10;
  const ATTACK_COOLDOWN = 3000;
  const COLLISION_RADIUS = 25;
  const ATTACK_WINDUP = 500;
  const ATTACK_DURATION = 300;
  const ACCELERATION = 0.1;
  const DECELERATION = 0.2;
  const MAX_SPEED = 0.2;
  const DAMAGE_COOLDOWN = 1000;
  const PLAYER_COLLISION_DISTANCE = 40;
  const TIGER_COLLISION_DISTANCE = 50;

  const handleDamageNumberComplete = (id: string) => {
    setDamageNumbers(prev => prev.filter(dn => dn.id !== id));
  };

  const getPlayerAnimation = () => {
    const speed = Math.sqrt(
      velocityRef.current.x ** 2 + velocityRef.current.y ** 2
    );
    if (isAttacking) return 'https://i.imgur.com/ARyPnuF.gif';
    if (speed > MOVEMENT_THRESHOLD) return 'https://i.imgur.com/ehO4EP2.gif';
    return 'https://i.imgur.com/UT1iu3O.gif';
  };

  const shouldFlip = () => {
    return player.position.x > positionRef.current.x;
  };

  const getTransformStyle = () => {
    return `translate(-50%, -50%) scaleX(${shouldFlip() ? -1 : 1})`;
  };

  useEffect(() => {
    if (enemy.health <= 0) {
      const updatedPlayer = ExperienceSystem.gainExperience(player, 0.5);
      Object.assign(player, updatedPlayer);

      const element = document.querySelector(`[data-tiger-id="${enemy.id}"]`);
      if (element) element.classList.add('enemy-death');
      setTimeout(() => onDeath(enemy.id), 500);
      return;
    }

    let animationFrame: number;

    const update = (timestamp: number) => {
      if (enemy.health <= 0) return;

      const deltaTime = (timestamp - lastUpdateRef.current) / 16;
      lastUpdateRef.current = timestamp;

      const distance = calculateDistance(positionRef.current, player.position);

      if (distance <= ATTACK_RANGE && !attackCooldown) {
        setIsAttacking(true);
        setAttackCooldown(true);

        setTimeout(() => {
          const currentDistance = calculateDistance(positionRef.current, player.position);
          if (currentDistance <= ATTACK_RANGE) {
            const now = Date.now();
            if (now - lastDamageTimeRef.current >= DAMAGE_COOLDOWN) {
              player.health = Math.max(0, player.health - ATTACK_DAMAGE);
              lastDamageTimeRef.current = now;
              setDamageNumbers(prev => [
                ...prev,
                {
                  id: Math.random().toString(),
                  damage: ATTACK_DAMAGE,
                  position: player.position
                }
              ]);
            }
          }

          setTimeout(() => {
            setIsAttacking(false);
            setTimeout(() => setAttackCooldown(false), ATTACK_COOLDOWN - (ATTACK_WINDUP + ATTACK_DURATION));
          }, ATTACK_DURATION);
        }, ATTACK_WINDUP);
      }

      if (distance > ATTACK_RANGE && !isAttacking) {
        const dx = player.position.x - positionRef.current.x;
        const dy = player.position.y - positionRef.current.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0.01) {
          const targetVelocity = {
            x: (dx / magnitude) * MAX_SPEED,
            y: (dy / magnitude) * MAX_SPEED
          };

          velocityRef.current = {
            x: velocityRef.current.x + (targetVelocity.x - velocityRef.current.x) * ACCELERATION * deltaTime,
            y: velocityRef.current.y + (targetVelocity.y - velocityRef.current.y) * ACCELERATION * deltaTime
          };

          const newPosition = {
            x: positionRef.current.x + velocityRef.current.x,
            y: positionRef.current.y + velocityRef.current.y
          };

          let canMove = true;

          if (calculateDistance(newPosition, player.position) < PLAYER_COLLISION_DISTANCE) {
            canMove = false;
            const pushAngle = Math.atan2(player.position.y - newPosition.y, player.position.x - newPosition.x);
            player.position.x = newPosition.x + Math.cos(pushAngle) * PLAYER_COLLISION_DISTANCE;
            player.position.y = newPosition.y + Math.sin(pushAngle) * PLAYER_COLLISION_DISTANCE;
          }

          document.querySelectorAll('[data-tiger-id]').forEach((el) => {
            const id = el.getAttribute('data-tiger-id');
            if (id && id !== enemy.id) {
              const rect = el.getBoundingClientRect();
              const tigerPosition = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };
              if (calculateDistance(newPosition, tigerPosition) < TIGER_COLLISION_DISTANCE) {
                canMove = false;
                const angle = Math.atan2(tigerPosition.y - newPosition.y, tigerPosition.x - newPosition.x);
                velocityRef.current = {
                  x: -Math.cos(angle) * MAX_SPEED * 0.5,
                  y: -Math.sin(angle) * MAX_SPEED * 0.5
                };
              }
            }
          });

          if (canMove) {
            positionRef.current = newPosition;
            onMove(enemy.id, newPosition);
          }
        } else {
          velocityRef.current = {
            x: velocityRef.current.x * (1 - DECELERATION * deltaTime),
            y: velocityRef.current.y * (1 - DECELERATION * deltaTime)
          };
          if (Math.abs(velocityRef.current.x) < 0.01) velocityRef.current.x = 0;
          if (Math.abs(velocityRef.current.y) < 0.01) velocityRef.current.y = 0;
        }
      }

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, [enemy, player, onMove, onDeath, isAttacking, attackCooldown]);

  useEffect(() => {
    if (enemy.isHit) {
      setIsHit(true);
      const timer = setTimeout(() => setIsHit(false), 200);
      return () => clearTimeout(timer);
    }
  }, [enemy.isHit]);

  return (
    <>
      <div
        data-tiger-id={enemy.id}
        className={`absolute transition-transform duration-100 ${isHit ? 'scale-110' : 'scale-100'}`}
        style={{
          left: enemy.position.x,
          top: enemy.position.y,
          width: 60,
          height: 60,
          transform: getTransformStyle(),
          zIndex: 5
        }}
      >
        <img
          src={getPlayerAnimation()}
          alt="White Tiger"
          className="w-full h-full object-contain"
          style={{
            filter: isHit ? 'brightness(1.5)' : 'none',
            transition: 'filter 0.2s ease-out',
            imageRendering: 'pixelated',
            transform: `scale(${isAttacking ? 1.2 : 1})`,
            transformOrigin: 'center'
          }}
        />

        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
            />
          </div>
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,200,100,0.1) 0%, transparent 70%)',
            mixBlendMode: 'screen',
            animation: 'tigerGlow 2s infinite alternate ease-in-out',
            zIndex: -1
          }}
        />

        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: '40px',
            height: '10px',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
            borderRadius: '50%',
            zIndex: -2
          }}
        />
      </div>

      {damageNumbers.map(dn => (
        <DamageNumber
          key={dn.id}
          damage={dn.damage}
          position={dn.position}
          onComplete={() => handleDamageNumberComplete(dn.id)}
          isEnemyDamage={true}
        />
      ))}

      <style>{`
        @keyframes tigerGlow {
          0% { opacity: 0.5; transform: scale(0.95); }
          100% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </>
  );
};

export default WhiteTiger;
