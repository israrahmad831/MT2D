import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';
import { calculateDistance } from '../../utils';
import { AttackManager } from '../../attacks/AttackManager';

export class ThreeWayCut {
  static readonly SKILL_ID = 'three-way-cut';
  static readonly SKILL_NAME = 'Triple Slash';
  static readonly SKILL_DESCRIPTION = 'Execute a powerful three-way slash that continuously damages enemies in range (Scales with VIT and INT).';
  static readonly SKILL_ICON = 'https://i.imgur.com/mrCTsJw.png';
  static readonly SKILL_COOLDOWN = 5000;
  static readonly SKILL_MANA_COST = 15;
  static readonly SKILL_DURATION = 1500;
  static readonly BASE_DAMAGE = 5;
  static readonly DAMAGE_INTERVAL = 300;
  static readonly SKILL_RADIUS = 75;
  static readonly SKILL_OFFSET = 50;
  static readonly MAX_VIT = 21;
  static readonly MAX_INT = 21;

  static getDamage(player: Player): number {
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    const vit = player.baseStats.vit;
    const int = player.baseStats.int;
    
    // Base damage scaling with level
    const baseDamage = this.BASE_DAMAGE + (level * 1.5);
    
    // VIT and INT bonuses scale with level
    const vitBonus = Math.min(15, Math.floor(vit / 4) * (1 + level / 10));
    const intBonus = Math.min(15, Math.floor(int / 4) * (1 + level / 10));
    
    // Level multiplier (increases every 4 levels)
    const levelMultiplier = 1 + (Math.floor(level / 4) * 0.15);
    
    // Critical chance increases with level and INT
    const criticalChance = Math.min(35, 5 + Math.floor(level / 3) + Math.floor(int / 5));
    const isCritical = Math.random() * 100 < criticalChance;
    
    let finalDamage = (baseDamage + vitBonus + intBonus) * levelMultiplier;
    
    // Critical hits deal 60% more damage
    if (isCritical) {
      finalDamage *= 1.6;
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

  private static getWASDDirection(): { x: number, y: number } | null {
    let dirX = 0;
    let dirY = 0;

    const wPressed = document.querySelector('[data-key="w"]')?.getAttribute('data-pressed') === 'true';
    const aPressed = document.querySelector('[data-key="a"]')?.getAttribute('data-pressed') === 'true';
    const sPressed = document.querySelector('[data-key="s"]')?.getAttribute('data-pressed') === 'true';
    const dPressed = document.querySelector('[data-key="d"]')?.getAttribute('data-pressed') === 'true';

    if (wPressed) dirY -= 1;
    if (sPressed) dirY += 1;
    if (aPressed) dirX -= 1;
    if (dPressed) dirX += 1;

    if (dirX === 0 && dirY === 0) return null;

    const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
    return {
      x: dirX / magnitude,
      y: dirY / magnitude
    };
  }

  static execute(
    player: Player,
    enemies: Enemy[],
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>,
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    onDamageDealt?: (damage: number) => void
  ): void {
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    const skillDamage = this.getDamage(player);
    
    // Skill radius increases with level
    const skillRadius = this.SKILL_RADIUS + Math.floor(level / 3) * 8;
    
    // Duration increases with level
    const duration = this.SKILL_DURATION + Math.floor(level / 5) * 100;
    
    // Damage interval decreases with level (faster hits)
    const damageInterval = Math.max(200, this.DAMAGE_INTERVAL - Math.floor(level / 4) * 20);

    const wasdDirection = this.getWASDDirection();
    let direction = wasdDirection || { ...player.direction };
    
    if (!wasdDirection && player.targetEnemy) {
      const targetEnemy = enemies.find(e => e.id === player.targetEnemy);
      if (targetEnemy) {
        const dx = targetEnemy.position.x - player.position.x;
        const dy = targetEnemy.position.y - player.position.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
          direction = {
            x: dx / magnitude,
            y: dy / magnitude
          };
        }
      }
    }

    const effectPosition = {
      x: player.position.x + direction.x * this.SKILL_OFFSET,
      y: player.position.y + direction.y * this.SKILL_OFFSET
    };

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        controlsDisabled: true,
        direction
      };
    });

    const effectContainer = document.createElement('div');
    effectContainer.style.position = 'absolute';
    effectContainer.style.left = `${effectPosition.x}px`;
    effectContainer.style.top = `${effectPosition.y}px`;
    effectContainer.style.width = `${skillRadius * 2}px`;
    effectContainer.style.height = `${skillRadius * 2}px`;
    effectContainer.style.transform = 'translate(-50%, -50%)';
    effectContainer.style.zIndex = '100';
    effectContainer.style.pointerEvents = 'none';

    // Number of slashes increases with level
    const numSlashes = 3 + Math.floor(level / 7);
    
    for (let i = 0; i < numSlashes; i++) {
      const slash = document.createElement('div');
      slash.style.position = 'absolute';
      slash.style.width = '100%';
      slash.style.height = '100%';
      slash.style.backgroundImage = 'url(https://i.imgur.com/mrCTsJw.png)';
      slash.style.backgroundSize = 'contain';
      slash.style.backgroundRepeat = 'no-repeat';
      slash.style.backgroundPosition = 'center';
      slash.style.transform = `rotate(${(360 / numSlashes) * i}deg)`;
      
      // Effect intensity increases with level
      const baseOpacity = 0.4 + Math.min(0.4, level / 20);
      slash.style.animation = `threeWayCutSlash ${duration}ms infinite linear`;
      slash.style.opacity = baseOpacity.toString();
      
      effectContainer.appendChild(slash);
    }

    document.body.appendChild(effectContainer);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes threeWayCutSlash {
        from {
          transform: rotate(0deg);
          opacity: ${0.4 + Math.min(0.4, level / 20)};
        }
        to {
          transform: rotate(360deg);
          opacity: ${0.2 + Math.min(0.2, level / 20)};
        }
      }
    `;
    document.head.appendChild(style);

    const intervalId = setInterval(() => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          const distance = calculateDistance(effectPosition, enemy.position);
          
          if (distance <= skillRadius) {
            if (onDamageDealt) {
              onDamageDealt(skillDamage);
            }
            
            // Knockback effect increases with level
            const knockbackDistance = 2 + Math.floor(level / 5);
            const knockbackDuration = 100 + Math.floor(level / 4) * 20;
            
            return {
              ...enemy,
              health: Math.max(0, enemy.health - skillDamage),
              isHit: true,
              hitTime: Date.now(),
              knockback: {
                active: true,
                direction: { ...direction },
                distance: knockbackDistance,
                startTime: Date.now(),
                duration: knockbackDuration
              }
            };
          }
          
          return enemy;
        })
      );
    }, damageInterval);

    setTimeout(() => {
      clearInterval(intervalId);
      if (effectContainer.parentNode) {
        effectContainer.parentNode.removeChild(effectContainer);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }

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