import { Enemy, Player } from '../../types';

export class EnemySelector {
  private static lastAutoSelectTime = 0;
  private static AUTO_SELECT_COOLDOWN = 100; // Prevent too frequent auto-selections

  /**
   * Handle enemy selection when clicked
   */
  static handleEnemyClick(
    enemyId: string,
    player: Player,
    enemies: Enemy[],
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
    setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>
  ): void {
    // Find the clicked enemy
    const clickedEnemy = enemies.find(enemy => enemy.id === enemyId);
    if (!clickedEnemy) return;

    // If enemy is dead, don't allow selection
    if (clickedEnemy.health <= 0 && clickedEnemy.health !== Infinity) {
      // Clear target if it's the current target
      if (player.targetEnemy === enemyId) {
        setPlayer(prevPlayer => {
          if (!prevPlayer) return prevPlayer;
          return {
            ...prevPlayer,
            targetEnemy: undefined,
            autoAttacking: false
          };
        });

        setEnemies(prevEnemies => 
          prevEnemies.map(enemy => ({
            ...enemy,
            isSelected: false
          }))
        );
      }
      return;
    }

    // Check if this enemy is already selected
    const isAlreadySelected = player.targetEnemy === enemyId;

    // Get current time for auto-select throttling
    const currentTime = Date.now();

    // Only process auto-select if enough time has passed
    if (currentTime - this.lastAutoSelectTime < this.AUTO_SELECT_COOLDOWN) {
      return;
    }

    this.lastAutoSelectTime = currentTime;

    if (isAlreadySelected) {
      // If already selected, toggle auto-attack
      setPlayer(prevPlayer => {
        if (!prevPlayer) return prevPlayer;
        return {
          ...prevPlayer,
          autoAttacking: !prevPlayer.autoAttacking
        };
      });
    } else {
      // Select the new enemy
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => ({
          ...enemy,
          isSelected: enemy.id === enemyId
        }))
      );
      
      setPlayer(prevPlayer => {
        if (!prevPlayer) return prevPlayer;
        return {
          ...prevPlayer,
          targetEnemy: enemyId,
          autoAttacking: false
        };
      });
    }
  }

  /**
   * Get direction vector from player to target enemy
   */
  static getDirectionToEnemy(
    player: Player,
    targetEnemy: Enemy
  ): { x: number; y: number } | null {
    // Calculate direction vector
    const dx = targetEnemy.position.x - player.position.x;
    const dy = targetEnemy.position.y - player.position.y;
    
    // Normalize the direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude === 0) return null;
    
    return {
      x: dx / magnitude,
      y: dy / magnitude
    };
  }

  /**
   * Check if player is close enough to the target enemy to attack
   */
  static isInAttackRange(
    player: Player,
    targetEnemy: Enemy,
    attackRange: number = 25
  ): boolean {
    const dx = targetEnemy.position.x - player.position.x;
    const dy = targetEnemy.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= attackRange;
  }

  /**
   * Check and clear target if enemy is dead
   */
  static checkAndClearDeadTarget(
    player: Player,
    enemies: Enemy[],
    setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
  ): void {
    if (!player.targetEnemy) return;

    const targetEnemy = enemies.find(enemy => enemy.id === player.targetEnemy);
    if (!targetEnemy || (targetEnemy.health <= 0 && targetEnemy.health !== Infinity)) {
      setPlayer(prevPlayer => {
        if (!prevPlayer) return prevPlayer;
        return {
          ...prevPlayer,
          targetEnemy: undefined,
          autoAttacking: false
        };
      });
    }
  }
}