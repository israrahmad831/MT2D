import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';
import { calculateDistance } from '../../utils';

export class SwordSpin {
  static readonly SKILL_ID = 'sword-spin';
  static readonly SKILL_NAME = 'Sword Vortex';
  static readonly SKILL_DESCRIPTION = 'Spin your sword around you, dealing damage to all nearby enemies (Scales with DEX).';
  static readonly SKILL_ICON = 'https://i.imgur.com/E7cFDqM.png';
  static readonly SKILL_COOLDOWN = 5000;
  static readonly SKILL_MANA_COST = 1;
  static readonly SKILL_DURATION = 1000;
  static readonly BASE_DAMAGE = 20;
  static readonly SKILL_RADIUS = 50;
  static readonly SKILL_FORWARD_MOVEMENT = 5;
  static readonly MAX_TARGET_DISTANCE = 100;
  static readonly MAX_DEX = 21;

  static getDamage(player: Player): number {
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    const dex = player.baseStats.dex;
    
    // Base damage scaling with level
    const baseDamage = this.BASE_DAMAGE + (level * 2);
    
    // DEX bonus scaling
    const dexBonus = Math.min(30, Math.floor(dex / 3) * 3);
    
    // Level multiplier (increases every 5 levels)
    const levelMultiplier = 1 + (Math.floor(level / 5) * 0.1);
    
    // Critical chance increases with level
    const criticalChance = Math.min(30, 5 + Math.floor(level / 2));
    const isCritical = Math.random() * 100 < criticalChance;
    
    let finalDamage = (baseDamage + dexBonus) * levelMultiplier;
    
    // Critical hits deal 50% more damage
    if (isCritical) {
      finalDamage *= 1.5;
    }
    
    return Math.floor(finalDamage);
  }

  static getSkill(): Skill {
    return {
      id: this.SKILL_ID,
      name: this.SKILL_NAME,
      description: this.SKILL_DESCRIPTION,
      icon: this.SKILL_ICON,
      cooldown: this.SKILL_COOLDOWN,
      manaCost: this.SKILL_MANA_COST,
      damage: this.BASE_DAMAGE,
      lastUsed: 0,
      type: 'corp',
      execute: this.execute.bind(this),
      getDamage: this.getDamage.bind(this)
    };
  }

  static execute(
    player: Player, 
    enemies: Enemy[], 
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    onDamageDealt?: (damage: number) => void
  ): void {
    const safeEnemies = enemies || [];
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    
    // Skill radius increases with level
    const skillRadius = this.SKILL_RADIUS + Math.floor(level / 3) * 5;
    
    // Duration increases with level
    const duration = this.SKILL_DURATION + Math.floor(level / 4) * 100;
    
    // Movement speed increases with level
    const movementSpeed = this.SKILL_FORWARD_MOVEMENT + Math.floor(level / 5);
    
    const skillDamage = this.getDamage(player);

    if (player.targetEnemy) {
      const targetEnemy = safeEnemies.find(enemy => enemy.id === player.targetEnemy);
      if (targetEnemy) {
        const distance = calculateDistance(player.position, targetEnemy.position);
        
        if (distance > this.MAX_TARGET_DISTANCE) {
          console.log("Target is too far away to use Sword Spin");
          return;
        }
        
        const dx = targetEnemy.position.x - player.position.x;
        const dy = targetEnemy.position.y - player.position.y;
        
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
          setPlayer(prevPlayer => {
            if (!prevPlayer) return prevPlayer;
            return {
              ...prevPlayer,
              direction: {
                x: dx / magnitude,
                y: dy / magnitude
              }
            };
          });
        }
      }
    }
    
    const checkKeyPressed = () => {
      const keys = ['w', 'a', 's', 'd'];
      for (const key of keys) {
        if (document.activeElement !== document.body) return false;
        if (document.querySelector(`[data-key="${key}"]`)?.getAttribute('data-pressed') === 'true') {
          return true;
        }
      }
      return false;
    };

    const getMovementDirection = () => {
      let dirX = 0;
      let dirY = 0;

      if (document.querySelector('[data-key="w"]')?.getAttribute('data-pressed') === 'true') dirY -= 1;
      if (document.querySelector('[data-key="s"]')?.getAttribute('data-pressed') === 'true') dirY += 1;
      if (document.querySelector('[data-key="a"]')?.getAttribute('data-pressed') === 'true') dirX -= 1;
      if (document.querySelector('[data-key="d"]')?.getAttribute('data-pressed') === 'true') dirX += 1;

      const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
      if (magnitude > 0) {
        dirX /= magnitude;
        dirY /= magnitude;
      }

      return { x: dirX * movementSpeed, y: dirY * movementSpeed };
    };

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        controlsDisabled: true
      };
    });

    const spinEffect = document.createElement('div');
    spinEffect.className = 'sword-spin-effect';
    document.body.appendChild(spinEffect);

    const updateEffectPosition = (position: { x: number, y: number }) => {
      if (spinEffect) {
        spinEffect.style.left = `${position.x}px`;
        spinEffect.style.top = `${position.y}px`;
        
        // Effect size increases with level
        const size = 100 + Math.floor(level / 4) * 10;
        spinEffect.style.width = `${size}px`;
        spinEffect.style.height = `${size}px`;
        
        // Effect glow intensity increases with level
        const glowIntensity = 8 + Math.floor(level / 3);
        spinEffect.style.filter = `drop-shadow(0 0 ${glowIntensity}px rgba(255, 0, 0, 0.8))`;
      }
    };

    let rotation = 0;
    const wasdPressed = checkKeyPressed();
    let movementDirection = wasdPressed ? getMovementDirection() : { 
      x: player.direction.x * movementSpeed,
      y: player.direction.y * movementSpeed
    };

    const originalPosition = { ...player.position };
    let currentPosition = { ...originalPosition };

    updateEffectPosition(currentPosition);
    
    // Rotation speed increases with level
    const rotationSpeed = 36 + Math.floor(level / 5) * 2;
    spinEffect.style.animation = `spin ${1000 / rotationSpeed}ms linear infinite`;

    const keyTracker = {
      w: false,
      a: false,
      s: false,
      d: false
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        keyTracker[e.key.toLowerCase() as 'w' | 'a' | 's' | 'd'] = true;
        updateMovementDirection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        keyTracker[e.key.toLowerCase() as 'w' | 'a' | 's' | 'd'] = false;
        updateMovementDirection();
      }
    };

    const updateMovementDirection = () => {
      let dirX = 0;
      let dirY = 0;

      if (keyTracker.w) dirY -= 1;
      if (keyTracker.s) dirY += 1;
      if (keyTracker.a) dirX -= 1;
      if (keyTracker.d) dirX += 1;

      const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
      if (magnitude > 0) {
        dirX /= magnitude;
        dirY /= magnitude;
      }

      movementDirection = { 
        x: dirX * movementSpeed,
        y: dirY * movementSpeed
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const spinInterval = setInterval(() => {
      rotation += rotationSpeed;
      if (spinEffect) {
        spinEffect.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
      }

      currentPosition = {
        x: currentPosition.x + movementDirection.x,
        y: currentPosition.y + movementDirection.y
      };

      setPlayer(prevPlayer => {
        if (!prevPlayer) return prevPlayer;
        return {
          ...prevPlayer,
          position: { ...currentPosition }
        };
      });

      updateEffectPosition(currentPosition);

      const updatedEnemies = safeEnemies.map(enemy => {
        const distance = calculateDistance(currentPosition, enemy.position);
        
        if (distance <= skillRadius) {
          const tickDamage = skillDamage / 10;
          if (onDamageDealt) {
            onDamageDealt(tickDamage);
          }
          return {
            ...enemy,
            health: Math.max(0, enemy.health - tickDamage),
            isHit: true,
            hitTime: Date.now()
          };
        }
        
        return enemy;
      });
      
      setEnemies(updatedEnemies);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      if (spinEffect && spinEffect.parentNode) {
        spinEffect.parentNode.removeChild(spinEffect);
      }

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      const finalEnemies = safeEnemies.map(enemy => {
        const distance = calculateDistance(currentPosition, enemy.position);
        
        if (distance <= skillRadius) {
          if (onDamageDealt) {
            onDamageDealt(skillDamage);
          }
          return {
            ...enemy,
            health: Math.max(0, enemy.health - skillDamage),
            isHit: true,
            hitTime: Date.now()
          };
        }
        
        return enemy;
      });

      setEnemies(finalEnemies);

      setPlayer(prevPlayer => {
        if (!prevPlayer) return prevPlayer;
        return {
          ...prevPlayer,
          controlsDisabled: false
        };
      });
    }, duration);
  }
}