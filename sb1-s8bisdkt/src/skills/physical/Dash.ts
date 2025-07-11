import { Player, Enemy } from '../../types';
import { Skill } from '../SkillManager';
import { calculateDistance } from '../../utils';
import { StatusEffectManager } from '../../effects/StatusEffectManager';

export class Dash {
  static readonly SKILL_ID = 'dash';
  static readonly SKILL_NAME = 'Swift Strike';
  static readonly SKILL_DESCRIPTION = 'Quickly dash towards the nearest enemy, dealing damage and stunning them (Scales with INT).';
  static readonly SKILL_ICON = 'https://i.imgur.com/txAmV0X.png';
  static readonly SKILL_COOLDOWN = 8000;
  static readonly SKILL_MANA_COST = 1;
  static readonly SKILL_RANGE = 200;
  static readonly BASE_DAMAGE = 30;
  static readonly DASH_SPEED = 30;
  static readonly STUN_DURATION = 2000;
  static readonly KNOCKBACK_DISTANCE = 2;
  static readonly KNOCKBACK_DURATION = 100;
  static readonly STOP_DISTANCE = 3;
  static readonly MAX_INT = 21;

  static getDamage(player: Player): number {
    const level = player.skillLevels?.[this.SKILL_ID] || 1;
    const int = player.baseStats.int;
    
    // Base damage scaling with level
    const baseDamage = this.BASE_DAMAGE + (level * 2);
    
    // INT bonus scales with level
    const intBonus = Math.min(25, Math.floor(int / 3) * (1 + level / 8));
    
    // Level multiplier (increases every 3 levels)
    const levelMultiplier = 1 + (Math.floor(level / 3) * 0.12);
    
    // Critical chance increases with level and INT
    const criticalChance = Math.min(40, 8 + Math.floor(level / 2) + Math.floor(int / 4));
    const isCritical = Math.random() * 100 < criticalChance;
    
    let finalDamage = (baseDamage + intBonus) * levelMultiplier;
    
    // Critical hits deal 70% more damage
    if (isCritical) {
      finalDamage *= 1.7;
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

  private static findClosestEnemy(player: Player, enemies: Enemy[]): Enemy | null {
    let closestEnemy: Enemy | null = null;
    let minDistance = this.SKILL_RANGE;

    for (const enemy of enemies) {
      if (enemy.health <= 0 && enemy.health !== Infinity) continue;

      const distance = calculateDistance(player.position, enemy.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemy;
      }
    }

    return closestEnemy;
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
    
    // Range increases with level
    const range = this.SKILL_RANGE + Math.floor(level / 4) * 15;
    
    // Dash speed increases with level
    const dashSpeed = this.DASH_SPEED + Math.floor(level / 3) * 5;
    
    // Stun duration increases with level
    const stunDuration = this.STUN_DURATION + Math.floor(level / 5) * 200;
    
    // Knockback effect increases with level
    const knockbackDistance = this.KNOCKBACK_DISTANCE + Math.floor(level / 6);
    const knockbackDuration = this.KNOCKBACK_DURATION + Math.floor(level / 4) * 25;

    const closestEnemy = this.findClosestEnemy(player, enemies);

    if (!closestEnemy) {
      console.log("No enemies in range!");
      return;
    }

    const dx = closestEnemy.position.x - player.position.x;
    const dy = closestEnemy.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const direction = {
      x: dx / distance,
      y: dy / distance
    };

    const finalPosition = {
      x: closestEnemy.position.x - direction.x * this.STOP_DISTANCE,
      y: closestEnemy.position.y - direction.y * this.STOP_DISTANCE
    };

    setPlayer(prevPlayer => {
      if (!prevPlayer) return prevPlayer;
      return {
        ...prevPlayer,
        controlsDisabled: true,
        direction
      };
    });

    let startPosition = { ...player.position };
    let startTime = Date.now();
    let dashComplete = false;

    // Create dash effect
    const dashEffect = document.createElement('div');
    dashEffect.style.position = 'absolute';
    dashEffect.style.left = `${player.position.x}px`;
    dashEffect.style.top = `${player.position.y}px`;
    dashEffect.style.width = '100px';
    dashEffect.style.height = '100px';
    dashEffect.style.backgroundImage = 'url(https://i.imgur.com/txAmV0X.png)';
    dashEffect.style.backgroundSize = 'contain';
    dashEffect.style.backgroundRepeat = 'no-repeat';
    dashEffect.style.transform = 'translate(-50%, -50%)';
    dashEffect.style.zIndex = '100';
    dashEffect.style.pointerEvents = 'none';
    
    // Effect intensity increases with level
    const effectOpacity = 0.6 + Math.min(0.3, level / 15);
    const glowIntensity = 10 + Math.floor(level / 3);
    dashEffect.style.opacity = effectOpacity.toString();
    dashEffect.style.filter = `drop-shadow(0 0 ${glowIntensity}px rgba(255, 165, 0, 0.8))`;
    
    document.body.appendChild(dashEffect);

    const performDash = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / 200, 1);
      
      if (progress < 1 && !dashComplete) {
        const newX = startPosition.x + (finalPosition.x - startPosition.x) * progress;
        const newY = startPosition.y + (finalPosition.y - startPosition.y) * progress;

        // Update dash effect position
        dashEffect.style.left = `${newX}px`;
        dashEffect.style.top = `${newY}px`;
        dashEffect.style.transform = `translate(-50%, -50%) rotate(${progress * 360}deg)`;

        setPlayer(prevPlayer => {
          if (!prevPlayer) return prevPlayer;
          return {
            ...prevPlayer,
            position: { x: newX, y: newY }
          };
        });

        requestAnimationFrame(performDash);
      } else if (!dashComplete) {
        dashComplete = true;
        
        setEnemies(prevEnemies => 
          prevEnemies.map(enemy => {
            if (enemy.id === closestEnemy.id) {
              if (onDamageDealt) {
                onDamageDealt(skillDamage);
              }
              
              return {
                ...StatusEffectManager.applyStun(enemy, stunDuration),
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

        // Remove dash effect
        if (dashEffect.parentNode) {
          dashEffect.parentNode.removeChild(dashEffect);
        }

        setTimeout(() => {
          setPlayer(prevPlayer => {
            if (!prevPlayer) return prevPlayer;
            return {
              ...prevPlayer,
              controlsDisabled: false
            };
          });
        }, 100);
      }
    };

    performDash();
  }
}