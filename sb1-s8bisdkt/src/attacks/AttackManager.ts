import { Player, Enemy, AttackHitbox } from '../types';

// Attack durations for each attack in the sequence (in ms)
const SWORD_ATTACK_DURATIONS = [400, 450, 500, 700];

export class AttackManager {
  // Calculate sword attack hitbox based on player position, direction and attack sequence
  static calculateSwordHitbox(
    position: {x: number, y: number}, 
    direction: {x: number, y: number}, 
    sequence: number
  ): AttackHitbox {
    // Increased base radius and larger scaling for each hit
    const baseRadius = 40; // Increased from 25 to 40
    const radiusMultiplier = [1.0, 1.3, 1.6, 2.0]; // Increased multipliers for bigger hitboxes
    
    return {
      position,
      direction,
      angle: 270, // 270 degrees to cover front and sides but not back
      radius: baseRadius * radiusMultiplier[sequence - 1],
      sequence,
      duration: SWORD_ATTACK_DURATIONS[sequence - 1],
      type: 'sword'
    };
  }

  // Check if enemies are hit by the attack
  static checkEnemyHits(hitbox: AttackHitbox, enemies: Enemy[], player: Player): Enemy[] {
    return enemies.map(enemy => {
      // Calculate if enemy is within the hitbox
      const dx = enemy.position.x - hitbox.position.x;
      const dy = enemy.position.y - hitbox.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if enemy is within radius
      if (distance <= hitbox.radius) {
        // Calculate angle between player direction and enemy
        const dotProduct = hitbox.direction.x * dx + hitbox.direction.y * dy;
        const enemyAngle = Math.acos(dotProduct / distance) * (180 / Math.PI);
        
        // Check if enemy is within the angle of the hitbox
        if (enemyAngle <= hitbox.angle / 2) {
          // Calculate base damage based on attack sequence and player stats
          const baseStrDamage = Math.max(1, player.baseStats.str * 2); // 2 damage per STR point
          const baseAttack = player.attack || 5;
          const totalBaseDamage = Math.max(1, baseAttack + baseStrDamage); // Ensure minimum 1 total base damage
          
          const sequenceMultiplier = [1, 1.2, 1.5, 2]; // Damage multipliers for each attack
          let damage = Math.max(1, Math.floor(totalBaseDamage * sequenceMultiplier[hitbox.sequence - 1]));
          
          // Apply sword aura buff if active
          if (player.buffs?.swordAura?.active) {
            damage = Math.max(1, Math.floor(damage * player.buffs.swordAura.multiplier));
          }

          // Apply equipment bonuses
          if (player.equipmentStats) {
            // Apply monster damage bonus for Metin stones
            if (player.equipmentStats.monsterDamage > 0 && 
                (enemy.type === 'metin' || enemy.type === 'stone-of-metin')) {
              const monsterDamageMultiplier = 1 + (player.equipmentStats.monsterDamage / 100);
              damage = Math.max(1, Math.floor(damage * monsterDamageMultiplier));
            }

            // Apply critical hit chance
            if (player.equipmentStats.criticalChance > 0) {
              const critRoll = Math.random() * 100;
              if (critRoll <= player.equipmentStats.criticalChance) {
                damage = Math.max(1, Math.floor(damage * 1.5)); // 50% more damage on crit, minimum 1
              }
            }
          }
          
          // Apply knockback on 4th attack
          let knockback = enemy.knockback || {
            active: false,
            direction: { x: 0, y: 0 },
            distance: 0,
            startTime: 0,
            duration: 0
          };
          
          if (hitbox.sequence === 4) {
            // Apply very minimal knockback on 4th attack
            knockback = {
              active: true,
              direction: { ...hitbox.direction }, // Knockback in the direction of attack
              distance: 2, // Extremely reduced knockback distance (was 5)
              startTime: Date.now(),
              duration: 100 // Reduced duration (was 200)
            };
          }
          
          // Ensure health doesn't go below 0
          const newHealth = Math.max(0, enemy.health - damage);
          
          return {
            ...enemy,
            health: newHealth,
            isHit: true,
            hitTime: Date.now(),
            knockback
          };
        }
      }
      
      // Reset hit effect after 200ms
      if (enemy.isHit && Date.now() - enemy.hitTime > 200) {
        return { ...enemy, isHit: false };
      }
      
      return enemy;
    });
  }

  // Get attack duration based on sequence
  static getSwordAttackDuration(sequence: number): number {
    // Apply attack speed multiplier from equipment if available
    return SWORD_ATTACK_DURATIONS[sequence - 1];
  }
  
  // Check if attack sequence should reset (after timeout)
  static shouldResetAttackSequence(lastAttackTime: number, currentTime: number): boolean {
    return currentTime - lastAttackTime > 1500; // Reset after 1.5 seconds of no attack
  }
}