import { useEffect, useRef, useCallback } from 'react';
import { Player, Enemy, AttackHitbox } from '../types';
import { AttackManager } from '../attacks/AttackManager';
import { calculateDistance } from '../utils';
import { EnemySelector } from '../systems/selector/EnemySelector';
import { SoundManager } from '../utils/SoundManager';

interface UsePlayerMovementProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  keys: { [key: string]: boolean };
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  mapSize: { width: number; height: number };
  setCurrentAttackHitbox: React.Dispatch<React.SetStateAction<AttackHitbox | null>>;
  setCameraPosition: (pos: { x: number; y: number }) => void;
  viewportRef: React.RefObject<HTMLDivElement>;
  zoomLevel: number;
  onDamageDealt: (damage: number) => void;
}

export const usePlayerMovement = ({
  player,
  setPlayer,
  keys,
  enemies,
  setEnemies,
  mapSize,
  setCurrentAttackHitbox,
  setCameraPosition,
  viewportRef,
  zoomLevel,
  onDamageDealt
}: UsePlayerMovementProps) => {
  const BASE_PLAYER_SPEED = 1.7;
  const ATTACKING_SPEED_MULTIPLIER = 0.5;
  const ENEMY_COLLISION_RADIUS = 15;
  const PUSH_BACK_STRENGTH = 2;
  const ATTACK_RANGE = 25;
  const COLLISION_SLOWDOWN = 0.7;
  const STUCK_THRESHOLD = 5;
  const MOVEMENT_UPDATE_INTERVAL = 16;
  const TILE_SIZE = 32;

  const lastPositionRef = useRef(player.position);
  const lastUpdateTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();
  const lastMovementUpdateRef = useRef(0);
  const lastWalkSoundRef = useRef(0);
  const WALK_SOUND_INTERVAL = 400; // Play walk sound every 400ms
  
  // COMPLETELY REWRITTEN: Simplified direction tracking for attacks
  const lastAttackDirectionRef = useRef<{ x: number; y: number } | null>(null);
  const attackDirectionSetRef = useRef<boolean>(false);

  const getCurrentSpeed = useCallback((hasCollision: boolean = false) => {
    let speed = BASE_PLAYER_SPEED;
    
    // Apply mount speed bonus if mounted
    if (player.mount?.active) {
      speed *= (1 + player.mount.speedBonus);
    } else {
      // Only apply attacking speed reduction if not mounted
      if (player.isAttacking) {
        speed *= ATTACKING_SPEED_MULTIPLIER;
      }
      
      if (player.buffs?.berserker?.active) {
        speed *= player.buffs.berserker.speedMultiplier;
      }
    }

    // Apply equipment movement speed bonus
    if (player.movementSpeedMultiplier) {
      speed *= player.movementSpeedMultiplier;
    }

    if (hasCollision) {
      speed *= COLLISION_SLOWDOWN;
    }
    
    return speed;
  }, [player.isAttacking, player.buffs?.berserker, player.mount, player.movementSpeedMultiplier]);

  const checkBuildingTileCollision = useCallback((x: number, y: number): boolean => {
    // For village map, only allow walking on placed tiles
    if (window.currentMap === 'village') {
      // Convert position to tile coords
      const tileX = Math.floor(x / TILE_SIZE);
      const tileY = Math.floor(y / TILE_SIZE);
      
      // Double-check if the global reference needs to be updated
      if (!window.currentVillageTiles && window.currentPlayerId) {
        try {
          const savedTiles = localStorage.getItem(`village_map_tiles_${window.currentPlayerId}`);
          if (savedTiles) {
            window.currentVillageTiles = JSON.parse(savedTiles);
          } else {
            window.currentVillageTiles = [];
          }
        } catch (error) {
          console.error("Error loading village tiles in movement hook:", error);
        }
      }
      
      // Check if there's a tile at this position
      if (window.currentVillageTiles) {
        const tileExists = window.currentVillageTiles.some((tile: any) => 
          tile.x === tileX && tile.y === tileY
        );
        
        return !tileExists;
      }
      
      return true;
    }
    
    return false;
  }, []);

  const handleEnemyCollision = useCallback((newX: number, newY: number): { 
    collision: boolean, 
    adjustedX: number, 
    adjustedY: number,
    isStuck: boolean
  } => {
    let finalX = newX;
    let finalY = newY;
    let hadCollision = false;
    let isStuck = false;
    let closestDistance = Infinity;
    let totalPushX = 0;
    let totalPushY = 0;
    let collisionCount = 0;

    // For village map, check building tile collision first
    if (window.location.pathname === '/village' || window.currentMap === 'village') {
      if (checkBuildingTileCollision(finalX, finalY)) {
        return {
          collision: true,
          adjustedX: player.position.x,
          adjustedY: player.position.y,
          isStuck: false
        };
      }
    }

    // Check enemy collisions
    for (const enemy of enemies) {
      if (enemy.health <= 0) continue;

      const distance = calculateDistance(
        { x: finalX, y: finalY },
        enemy.position
      );
      
      if (distance < ENEMY_COLLISION_RADIUS) {
        hadCollision = true;
        collisionCount++;
        closestDistance = Math.min(closestDistance, distance);
        
        const dx = finalX - enemy.position.x;
        const dy = finalY - enemy.position.y;
        const pushDistance = ENEMY_COLLISION_RADIUS - distance;
        
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
          totalPushX += (dx / magnitude) * pushDistance;
          totalPushY += (dy / magnitude) * pushDistance;
        }
      }
    }

    if (collisionCount > 1 && closestDistance < STUCK_THRESHOLD) {
      isStuck = true;
      return { 
        collision: false,
        adjustedX: newX,
        adjustedY: newY,
        isStuck: true
      };
    }

    if (hadCollision && !isStuck) {
      const totalMagnitude = Math.sqrt(totalPushX * totalPushX + totalPushY * totalPushY);
      if (totalMagnitude > 0) {
        const normalizedPushX = totalPushX / totalMagnitude;
        const normalizedPushY = totalPushY / totalMagnitude;
        
        finalX = newX + normalizedPushX * PUSH_BACK_STRENGTH;
        finalY = newY + normalizedPushY * PUSH_BACK_STRENGTH;

        if (checkBuildingTileCollision(finalX, finalY)) {
          finalX = newX;
          finalY = newY;
        }
      }
    }

    return { 
      collision: hadCollision,
      adjustedX: finalX,
      adjustedY: finalY,
      isStuck
    };
  }, [enemies, checkBuildingTileCollision, player.position]);

  const updateCamera = useCallback((playerX: number, playerY: number) => {
    if (viewportRef.current) {
      const viewportWidth = viewportRef.current.clientWidth;
      const viewportHeight = viewportRef.current.clientHeight;
      
      setCameraPosition({
        x: playerX - viewportWidth / (2 * zoomLevel),
        y: playerY - viewportHeight / (2 * zoomLevel)
      });
    }
  }, [setCameraPosition, zoomLevel]);

  useEffect(() => {
    const movePlayer = (timestamp: number) => {
      const deltaTime = (timestamp - lastUpdateTimeRef.current) / 1000;
      lastUpdateTimeRef.current = timestamp;

      if (timestamp - lastMovementUpdateRef.current < MOVEMENT_UPDATE_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(movePlayer);
        return;
      }
      lastMovementUpdateRef.current = timestamp;

      if (player.controlsDisabled) {
        animationFrameRef.current = requestAnimationFrame(movePlayer);
        return;
      }

      let newX = player.position.x;
      let newY = player.position.y;
      let moved = false;
      let newDirection = { ...player.direction };
      let isAttacking = player.isAttacking;
      let attackSequence = player.attackSequence;
      let lastAttackTime = player.lastAttackTime;
      let isMoving = false;

      const currentTime = performance.now();
      const currentAttackDuration = attackSequence > 0 ? 
        AttackManager.getSwordAttackDuration(attackSequence) : 0;
      const attackFinished = currentTime - lastAttackTime > currentAttackDuration;

      // Check if any movement key is pressed
      const isMovementKeyPressed = keys['w'] || keys['a'] || keys['s'] || keys['d'];

      // Handle movement - RESTRICT movement during attack for ALL players (mounted and unmounted)
      if (isMovementKeyPressed) {
        if (player.autoAttacking) {
          setPlayer(prev => ({
            ...prev!,
            autoAttacking: false
          }));
        }
        
        newDirection = { x: 0, y: 0 };
        
        if (keys['w']) newDirection.y -= 1;
        if (keys['s']) newDirection.y += 1;
        if (keys['a']) newDirection.x -= 1;
        if (keys['d']) newDirection.x += 1;
        
        const magnitude = Math.sqrt(newDirection.x * newDirection.x + newDirection.y * newDirection.y);
        if (magnitude > 0) {
          newDirection.x /= magnitude;
          newDirection.y /= magnitude;
        }

        // CRITICAL CHANGE: No movement during attack for ANY player (mounted or unmounted)
        if (!player.isAttacking) {
          const currentSpeed = getCurrentSpeed();
          
          const potentialX = Math.max(0, Math.min(mapSize.width, player.position.x + newDirection.x * currentSpeed));
          const potentialY = Math.max(0, Math.min(mapSize.height, player.position.y + newDirection.y * currentSpeed));
          
          const { collision, adjustedX, adjustedY, isStuck } = handleEnemyCollision(potentialX, potentialY);
          
          newX = adjustedX;
          newY = adjustedY;
          moved = true;
          isMoving = true;

          // Play walk sound
          if (currentTime - lastWalkSoundRef.current > WALK_SOUND_INTERVAL) {
            SoundManager.playWalkSound(player.mount?.active || false);
            lastWalkSoundRef.current = currentTime;
          }
        } else {
          // SIMPLIFIED: During attack, just update direction without complex tracking
          // This ensures the sprite direction changes smoothly without frame skipping
          moved = true;
          isMoving = false; // Not actually moving, just changing direction
        }
      } else {
        isMoving = false;
        // Reset attack direction tracking when no keys are pressed
        if (!player.isAttacking) {
          lastAttackDirectionRef.current = null;
          attackDirectionSetRef.current = false;
        }
      }
      
      if (keys[' ']) {
        if (player.autoAttacking) {
          setPlayer(prev => ({
            ...prev!,
            autoAttacking: false
          }));
        }
        
        if (!isAttacking || attackFinished) {
          isAttacking = true;
          attackSequence = (attackSequence % 4) + 1;
          lastAttackTime = currentTime;
          
          // SIMPLIFIED: Reset attack direction tracking when starting a new attack
          attackDirectionSetRef.current = false;
          
          // Play swing sound only when not mounted
          if (!player.mount?.active) {
            SoundManager.playSwingSound(attackSequence);
          }
          
          const hitbox = AttackManager.calculateSwordHitbox(
            { x: newX, y: newY },
            newDirection,
            attackSequence
          );
          
          const updatedEnemies = AttackManager.checkEnemyHits(hitbox, enemies, player);
          
          updatedEnemies.forEach((enemyAfter, index) => {
            const enemyBefore = enemies[index];
            if (enemyBefore.health !== enemyAfter.health) {
              const damageDone = enemyBefore.health - enemyAfter.health;
              onDamageDealt(damageDone);
            }
          });
          
          setEnemies(updatedEnemies);
          setCurrentAttackHitbox(hitbox);
          
          moved = true;
        }
      } else if (isAttacking && attackFinished) {
        if (!player.autoAttacking) {
          isAttacking = false;
          if (AttackManager.shouldResetAttackSequence(lastAttackTime, currentTime)) {
            attackSequence = 0;
          }
          setCurrentAttackHitbox(null);
          // Reset attack direction tracking when attack ends
          lastAttackDirectionRef.current = null;
          attackDirectionSetRef.current = false;
        } else {
          isAttacking = false;
          setCurrentAttackHitbox(null);
          lastAttackDirectionRef.current = null;
          attackDirectionSetRef.current = false;
        }
        moved = true;
      }

      if (moved || isAttacking !== player.isAttacking || attackSequence !== player.attackSequence || lastAttackTime !== player.lastAttackTime || isMoving !== player.isMoving) {
        const newPosition = { x: newX, y: newY };
        
        if (newPosition.x !== lastPositionRef.current.x || newPosition.y !== lastPositionRef.current.y) {
          lastPositionRef.current = newPosition;
          updateCamera(newX, newY);
        }

        setPlayer(prev => ({
          ...prev!,
          position: newPosition,
          direction: newDirection,
          isAttacking,
          attackSequence,
          lastAttackTime,
          isMoving
        }));
      }

      animationFrameRef.current = requestAnimationFrame(movePlayer);
    };

    animationFrameRef.current = requestAnimationFrame(movePlayer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    player,
    keys,
    enemies,
    mapSize,
    handleEnemyCollision,
    getCurrentSpeed,
    updateCamera,
    setCurrentAttackHitbox,
    setEnemies,
    setPlayer,
    onDamageDealt
  ]);
};