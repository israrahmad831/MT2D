import { GameOptimizer } from "../systems/performance/GameOptimizer";
import { RenderOptimizer } from "../systems/performance/RenderOptimizer";
import { MemoryManager } from "../systems/performance/MemoryManager";
import { ParticleManager } from "../systems/performance/ParticleManager";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Player, Enemy, AttackHitbox } from "../types";
import SwordAttack from "../attacks/SwordAttack";
import { generateId } from "../utils";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { usePlayerMovement } from "../hooks/usePlayerMovement";
import GameMap from "./game/GameMap";
import PlayerComponent from "./game/Player";
import AbilityBar from "./game/AbilityBar";
import ActiveBuffs from "./game/ActiveBuffs";
import StatsWindow from "./stats/StatsWindow";
import DamageNumber from "./DamageNumber";
import PlayerHealthBar from "./game/PlayerHealthBar";
import DeathScreen from "./game/DeathScreen";
import LevelUpEffect from "./effects/LevelUpEffect";
import { ExperienceSystem } from "../systems/experience/ExperienceSystem";
import FPSCounter from "./game/FPSCounter";
import MetinStone from "./enemies/MetinStone";
import MetinStoneDesert from "./enemies/MetinStoneDesert";
import StoneOfMetin from "./enemies/StoneOfMetin";
import StoneMap1 from "./enemies/StoneMap1";
import WhiteTiger from "./enemies/WhiteTiger";
import TigerusBoss from "./boss/TigerusBoss";
import { TigerusManager } from "../systems/boss/TigerusManager";
import { AttackManager } from "../attacks/AttackManager";
import Inventory from "./inventory/Inventory";
import MapSelectionWindow from "./inventory/MapSelectionWindow";
import { GameItems } from "../items/GameItems";
import Minimap from "./game/Minimap";
import BuildingSystem from "./building/BuildingSystem";
import TiledMap from "./maps/TiledMap";
import SkillTreeWindow from "./skills/SkillTreeWindow";

// Global declarations should be outside the component
declare global {
  interface Window {
    currentMap?: string;
    checkBuildingTileCollision?: (x: number, y: number) => boolean;
    currentVillageTiles?: any[];
  }
}

// Constants should be outside the component
const CHUNK_SIZE = 500;
const VIEWPORT_PADDING = 1000;
const ENEMY_RENDER_DISTANCE = 200;
const OBJECT_POOL_SIZE = 50;
const TILE_SIZE = 32; // Modificat din 55 pentru dimensiuni mai mici

interface GameWorldProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  showMapSelection: boolean;
  setShowMapSelection: React.Dispatch<React.SetStateAction<boolean>>;
  mapSelectionPosition: { x: number; y: number };
  setMapSelectionPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  onMapSelect: (mapName: string) => void;
  currentMap: string;
  zoomLevel?: number;
  isOfflineMode: boolean;
  onOfflineModeToggle?: () => void;
}

const GameWorld: React.FC<GameWorldProps> = ({
  player,
  setPlayer,
  showMapSelection,
  setShowMapSelection,
  mapSelectionPosition,
  setMapSelectionPosition,
  onMapSelect,
  currentMap,
  zoomLevel = 3.2,
  isOfflineMode,
  onOfflineModeToggle,
}) => {
  // Constants inside the component
  const mapSize = { width: 2460, height: 2460 };
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraPositionRef = useRef({ x: 0, y: 0 });
  const [currentAttackHitbox, setCurrentAttackHitbox] =
    useState<AttackHitbox | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const worldMousePositionRef = useRef({ x: 0, y: 0 });
  const [damageNumbers, setDamageNumbers] = useState<
    Array<{
      id: string;
      damage: number;
      position: { x: number; y: number };
      isCritical: boolean;
    }>
  >([]);
  const [isDead, setIsDead] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [tigerusBoss, setTigerusBoss] = useState<Enemy | null>(
    currentMap === "sohan" ? TigerusManager.createTigerus() : null
  );
  const lastMetinPositionRef = useRef({ x: 1000, y: 1000 });
  const objectPoolRef = useRef<Array<{ id: string; inUse: boolean }>>([]);
  const [visibleChunks, setVisibleChunks] = useState<Set<string>>(new Set());
  const frameRef = useRef(0);
  const [offlineFarmTimer, setOfflineFarmTimer] = useState(30);
  const [isAutoFarming, setIsAutoFarming] = useState(false);
  const [showOfflineUI, setShowOfflineUI] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);

  // Building system state
  const [isBuildingMode, setIsBuildingMode] = useState(false);
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);

  const lastUpdateTimeRef = useRef(performance.now());
  const MAX_METIN_STONES = 8;
  const MAX_STONE_OF_METIN = 8;
  const SPAWN_MARGIN = 200;
  const MIN_DISTANCE_BETWEEN_STONES = 300;

  const lastFarmStonePositionRef = useRef<{ x: number; y: number } | null>(
    null
  );
  const checkForMissingStoneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showHitbox, setShowHitbox] = useState(false);
  const animationFrameRef = useRef<number>(0);

  // Check if player is in village and enable building mode
  useEffect(() => {
    if (currentMap === "village") {
      setIsBuildingMode(true);
    } else {
      setIsBuildingMode(false);
    }
  }, [currentMap]);

  // Handle M key for map toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (player.controlsDisabled) return;

      const key = e.key.toLowerCase();

      if (key === "m") {
        e.preventDefault();
        setShowFullMap((prev) => !prev);
      }

      if (key === "escape") {
        e.preventDefault();
        if (showFullMap) {
          setShowFullMap(false);
        } else if (player.isInventoryOpen) {
          setPlayer((prev) =>
            prev ? { ...prev, isInventoryOpen: false } : prev
          );
        } else if (player.isStatsWindowOpen) {
          setPlayer((prev) =>
            prev ? { ...prev, isStatsWindowOpen: false } : prev
          );
        } else if (isSkillTreeOpen) {
          setIsSkillTreeOpen(false);
        }
      }

      if (key === "i" && !e.repeat) {
        setPlayer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isInventoryOpen: !prev.isInventoryOpen,
          };
        });
      }

      if (key === "c" && !e.repeat) {
        setPlayer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isStatsWindowOpen: !prev.isStatsWindowOpen,
          };
        });
      }

      // Add handler for V key to open Skill Tree
      if (key === "v" && !e.repeat) {
        setIsSkillTreeOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    player.controlsDisabled,
    setPlayer,
    showFullMap,
    player.isInventoryOpen,
    player.isStatsWindowOpen,
    isSkillTreeOpen,
  ]);

  useEffect(() => {
    if (isOfflineMode && !showOfflineUI) {
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              mount: {
                active: true,
                type: "manny",
                speedBonus: 0.1,
              },
            }
          : prev
      );
      setShowOfflineUI(true);
    }
  }, [isOfflineMode]);

  useEffect(() => {
    if (!isOfflineMode || !showOfflineUI) return;

    let timerInterval: NodeJS.Timeout;
    let attackInterval: NodeJS.Timeout;

    if (offlineFarmTimer > 0) {
      timerInterval = setInterval(() => {
        setOfflineFarmTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setEnemies([]);

      // Create a map-specific stone based on currentMap
      let stoneType = "metin"; // Default
      let healthValue = 8000;
      let maxHealthValue = 8000;

      if (currentMap === "map1") {
        stoneType = "stone-of-map1";
        healthValue = 4000;
        maxHealthValue = 4200;
      } else if (currentMap === "yogbi") {
        stoneType = "desert-metin";
        healthValue = 6000;
        maxHealthValue = 8000;
      } else if (currentMap === "sohan") {
        stoneType = "metin";
        healthValue = 8000;
        maxHealthValue = 10000;
      }

      const stone = {
        id: generateId(),
        type: stoneType,
        position: { x: player.position.x + 50, y: player.position.y },
        health: healthValue,
        maxHealth: maxHealthValue,
        isOfflineFarmTarget: true,
        // Add a flag to potentially drop nothing (will be checked when stone is destroyed)
        shouldDropNothing: Math.random() < 0.5, // 50% chance to drop nothing
      };

      setEnemies([stone]);
      setIsAutoFarming(true);

      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          targetEnemy: stone.id,
          autoAttacking: true,
          direction: { x: 1, y: 0 },
        };
      });

      attackInterval = setInterval(() => {
        setPlayer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isAttacking: true,
            attackSequence: (prev.attackSequence + 1) % 3,
            lastAttackTime: Date.now(),
          };
        });

        const keyElement = document.querySelector('[data-key=" "]');
        if (keyElement) {
          keyElement.setAttribute("data-pressed", "true");
        }
      }, 200);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (attackInterval) clearInterval(attackInterval);

      const keyElement = document.querySelector('[data-key=" "]');
      if (keyElement) {
        keyElement.setAttribute("data-pressed", "false");
      }
    };
  }, [
    isOfflineMode,
    showOfflineUI,
    offlineFarmTimer,
    currentMap,
    player.position.x,
    player.position.y,
  ]);

  useEffect(() => {
    if (!isOfflineMode || !isAutoFarming || enemies.length === 0) return;

    const farmTarget = enemies.find((enemy) => enemy.isOfflineFarmTarget);

    if (farmTarget && farmTarget.health <= 0) {
      // Check if this stone should drop nothing (50% chance)
      if (!farmTarget.shouldDropNothing) {
        // Select appropriate chests based on the stone type
        let chests = [];

        if (farmTarget.type === "stone-of-map1") {
          chests = [GameItems.MOONLIGHT_CHEST, GameItems.GOLD_PIECE];
        } else if (farmTarget.type === "desert-metin") {
          chests = [
            GameItems.MOONLIGHT_CHEST,
            GameItems.GOLD_PIECE,
            GameItems.WARRIORS_CHEST,
          ];
        } else {
          // Default for regular metin and stone-of-metin
          chests = [
            GameItems.MOONLIGHT_CHEST,
            GameItems.JEWELRY_CHEST,
            GameItems.WARRIORS_CHEST,
            GameItems.GOLD_PIECE,
            GameItems.UPGRADE_CHEST,
          ];
        }

        const selectedChest = chests[Math.floor(Math.random() * chests.length)];
        const chestAmount = Math.floor(Math.random() * 3) + 1;
        const emptySlot = findFirstEmptyInventorySlot();

        if (emptySlot) {
          // Verificăm dacă există deja acest tip de cufăr în inventar
          const existingChest = player.inventory.find(
            (item) => item.name === selectedChest.name
          );

          if (existingChest) {
            // Actualizăm stack-ul existent
            setInventory((prev) =>
              prev.map((item) =>
                item.id === existingChest.id
                  ? { ...item, stackSize: (item.stackSize || 0) + chestAmount }
                  : item
              )
            );
          } else {
            // Adăugăm un nou stack
            setInventory((prev) => [
              ...prev,
              {
                ...selectedChest,
                id: generateId(),
                slotId: emptySlot,
                stackSize: chestAmount,
              },
            ]);
          }

          // Afișăm DOAR notificarea nouă pentru cufăr în modul offline
          const notificationId = `chest-${Date.now()}`;
          const notificationsContainer = document.getElementById(
            "chest-notifications"
          );
          if (notificationsContainer) {
            const notification = document.createElement("div");
            notification.id = notificationId;
            notification.className =
              "bg-indigo-900 bg-opacity-90 rounded-lg p-3 border border-indigo-600 flex items-center gap-3 animate-fadeIn pointer-events-auto";
            notification.innerHTML = `
              <img src="${selectedChest.icon}" alt="${
              selectedChest.name
            }" class="w-10 h-10" style="image-rendering: pixelated;">
              <div>
                <div class="font-bold text-indigo-200">Found ${
                  selectedChest.name
                }</div>
                <div class="text-xs text-indigo-300">+${chestAmount} ${
              selectedChest.name
            }${chestAmount > 1 ? "s" : ""}</div>
              </div>
            `;
            notificationsContainer.appendChild(notification);

            // Eliminăm notificarea după câteva secunde
            setTimeout(() => {
              const notificationElement =
                document.getElementById(notificationId);
              if (notificationElement) {
                notificationElement.classList.add("animate-fadeOut");
                setTimeout(() => notificationElement.remove(), 500);
              }
            }, 3000);
          }
        }

        // Adaugă Building Material drop (cod existent)
        const buildingMaterialDrop = Math.random() < 0.5 ? 0 : 1; // 50% șansă pentru 0, 50% șansă pentru 1
        const rareDrop = Math.random() < 0.05;
        const materialAmount = rareDrop ? 3 : buildingMaterialDrop;

        if (materialAmount > 0) {
          const materialSlot = findFirstEmptyInventorySlot();
          if (materialSlot) {
            // Verificăm dacă există deja Building Material în inventar
            const existingMaterial = player.inventory.find(
              (item) => item.name === "Building Material"
            );

            if (existingMaterial) {
              // Actualizăm stack-ul existent
              setInventory((prev) =>
                prev.map((item) =>
                  item.id === existingMaterial.id
                    ? {
                        ...item,
                        stackSize: (item.stackSize || 0) + materialAmount,
                      }
                    : item
                )
              );
            } else {
              // Adăugăm un nou stack
              setInventory((prev) => [
                ...prev,
                {
                  ...GameItems.BUILDING_MATERIAL,
                  id: generateId(),
                  slotId: materialSlot,
                  stackSize: materialAmount,
                },
              ]);
            }

            // Afișăm notificarea pentru Building Material în modul offline
            const notificationId = `building-material-${Date.now()}`;
            const notificationsContainer = document.getElementById(
              "chest-notifications"
            );
            if (notificationsContainer) {
              const notification = document.createElement("div");
              notification.id = notificationId;
              notification.className =
                "bg-green-900 bg-opacity-90 rounded-lg p-3 border border-green-600 flex items-center gap-3 animate-fadeIn pointer-events-auto";
              notification.innerHTML = `
                <img src="${GameItems.BUILDING_MATERIAL.icon}" alt="Building Material" class="w-10 h-10" style="image-rendering: pixelated;">
                <div>
                  <div class="font-bold text-green-200">Found Building Materials</div>
                  <div class="text-xs text-green-300">+${materialAmount} Building Materials</div>
                </div>
              `;
              notificationsContainer.appendChild(notification);

              // Eliminăm notificarea după câteva secunde
              setTimeout(() => {
                const notificationElement =
                  document.getElementById(notificationId);
                if (notificationElement) {
                  notificationElement.classList.add("animate-fadeOut");
                  setTimeout(() => notificationElement.remove(), 500);
                }
              }, 3000);
            }
          }
        }
      }

      // Spawn a new stone with the same type (cod existent)
      const newStone = {
        id: generateId(),
        type: farmTarget.type,
        position: { ...farmTarget.position },
        health: farmTarget.maxHealth,
        maxHealth: farmTarget.maxHealth,
        isOfflineFarmTarget: true,
        shouldDropNothing: Math.random() < 0.5, // 50% chance for no drop again
      };

      setEnemies([newStone]);

      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          targetEnemy: newStone.id,
          autoAttacking: true,
          direction: { x: 1, y: 0 },
        };
      });
    }
  }, [isOfflineMode, isAutoFarming, enemies, currentMap]);

  useEffect(() => {
    objectPoolRef.current = Array.from({ length: OBJECT_POOL_SIZE }, () => ({
      id: generateId(),
      inUse: false,
    }));

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  useEffect(() => {
    const processDamage = () => {
      enemies.forEach((enemy) => {
        if (enemy.lastDamageDealt && enemy.lastDamageTime) {
          const timeSinceLastDamage = Date.now() - enemy.lastDamageTime;
          if (timeSinceLastDamage >= 1000) {
            const newHealth = Math.max(
              0,
              player.health - enemy.lastDamageDealt
            );

            player.health = newHealth;

            setPlayer((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                health: newHealth,
              };
            });

            setEnemies((prev) =>
              prev.map((e) =>
                e.id === enemy.id
                  ? {
                      ...e,
                      lastDamageTime: Date.now(),
                    }
                  : e
              )
            );
          }
        }
      });
    };

    const interval = setInterval(processDamage, 16);
    return () => clearInterval(interval);
  }, [enemies, player.health, setPlayer]);

  useEffect(() => {
    if (tigerusBoss) {
      const updatedBoss = TigerusManager.updateBoss(tigerusBoss, player);
      if (updatedBoss !== tigerusBoss) {
        setTigerusBoss(updatedBoss);
      }

      if (tigerusBoss.deathTime && TigerusManager.shouldRespawn(tigerusBoss)) {
        setTigerusBoss(TigerusManager.createTigerus());
      }
    }
  }, [tigerusBoss, player]);

  useEffect(() => {
    if (currentMap === "sohan" && !tigerusBoss) {
      setTigerusBoss(TigerusManager.createTigerus());
    } else if (currentMap !== "sohan" && tigerusBoss) {
      setTigerusBoss(null);
    }
  }, [currentMap, tigerusBoss]);

  const getFromPool = useCallback(() => {
    const availableObject = objectPoolRef.current.find((obj) => !obj.inUse);
    if (availableObject) {
      availableObject.inUse = true;
      return availableObject.id;
    }
    return generateId();
  }, []);

  const returnToPool = useCallback((id: string) => {
    const poolObject = objectPoolRef.current.find((obj) => obj.id === id);
    if (poolObject) {
      poolObject.inUse = false;
    }
  }, []);

  const updateVisibleChunks = useCallback(() => {
    const newVisibleChunks = new Set<string>();
    const playerChunkX = Math.floor(player.position.x / CHUNK_SIZE);
    const playerChunkY = Math.floor(player.position.y / CHUNK_SIZE);

    const viewportLeft = player.position.x - VIEWPORT_PADDING;
    const viewportRight = player.position.x + VIEWPORT_PADDING;
    const viewportTop = player.position.y - VIEWPORT_PADDING;
    const viewportBottom = player.position.y + VIEWPORT_PADDING;

    const startChunkX = Math.max(0, Math.floor(viewportLeft / CHUNK_SIZE));
    const endChunkX = Math.min(
      Math.floor(mapSize.width / CHUNK_SIZE),
      Math.ceil(viewportRight / CHUNK_SIZE)
    );
    const startChunkY = Math.max(0, Math.floor(viewportTop / CHUNK_SIZE));
    const endChunkY = Math.min(
      Math.floor(mapSize.height / CHUNK_SIZE),
      Math.ceil(viewportBottom / CHUNK_SIZE)
    );

    for (let x = startChunkX; x <= endChunkX; x++) {
      for (let y = startChunkY; y <= endChunkY; y++) {
        newVisibleChunks.add(`${x},${y}`);
      }
    }

    setVisibleChunks(newVisibleChunks);
  }, [player.position, mapSize]);

  const visibleEnemies = useMemo(() => {
    if (isOfflineMode && showOfflineUI) {
      return enemies.filter((enemy) => enemy.isOfflineFarmTarget);
    }

    return enemies.filter((enemy) => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - player.position.x, 2) +
          Math.pow(enemy.position.y - player.position.y, 2)
      );
      return distance <= ENEMY_RENDER_DISTANCE;
    });
  }, [enemies, player.position, isOfflineMode, showOfflineUI]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (GameOptimizer.startFrame()) {
        const deltaTime = timestamp - lastUpdateTimeRef.current;
        lastUpdateTimeRef.current = timestamp;

        if (deltaTime >= 16) {
          // Update particles
          ParticleManager.update(deltaTime);

          // Process render queue
          RenderOptimizer.processRenderQueue();
        }

        // Cleanup optimizers
        GameOptimizer.cleanup();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const getNextStonePosition = () => {
    const existingStonePositions = enemies
      .filter(
        (enemy) => enemy.type === "metin" || enemy.type === "stone-of-metin"
      )
      .map((enemy) => enemy.position);

    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const newPosition = {
        x: SPAWN_MARGIN + Math.random() * (mapSize.width - 2 * SPAWN_MARGIN),
        y: SPAWN_MARGIN + Math.random() * (mapSize.height - 2 * SPAWN_MARGIN),
      };

      const isFarEnough = existingStonePositions.every((pos) => {
        const distance = Math.sqrt(
          Math.pow(pos.x - newPosition.x, 2) +
            Math.pow(pos.y - newPosition.y, 2)
        );
        return distance >= MIN_DISTANCE_BETWEEN_STONES;
      });

      if (isFarEnough) {
        return newPosition;
      }

      attempts++;
    }

    return {
      x: mapSize.width - lastMetinPositionRef.current.x,
      y: mapSize.height - lastMetinPositionRef.current.y,
    };
  };

  useEffect(() => {
    if (isOfflineMode && showOfflineUI) return;

    // Don't spawn any stones in village map
    if (currentMap === "village") {
      setEnemies([]);
      return;
    }

    const initialStones: Enemy[] = [];

    if (currentMap === "sohan") {
      // Spawn regular metin stones for Sohan map
      for (let i = 0; i < 4; i++) {
        const position = getNextStonePosition();
        initialStones.push({
          id: generateId(),
          type: "metin",
          position: position,
          health: 8000,
          maxHealth: 10000,
        });
      }

      for (let i = 0; i < 4; i++) {
        const position = getNextStonePosition();
        initialStones.push({
          id: generateId(),
          type: "stone-of-metin",
          position: position,
          health: 8000,
          maxHealth: 10000,
        });
      }
    } else if (currentMap === "yogbi") {
      // Spawn desert-specific metin stones for Yogbi map
      for (let i = 0; i < 5; i++) {
        const position = getNextStonePosition();
        initialStones.push({
          id: generateId(),
          type: "desert-metin",
          position: position,
          health: 6000,
          maxHealth: 8000,
        });
      }
    } else if (currentMap === "map1") {
      // Spawn map1-specific stones
      for (let i = 0; i < 6; i++) {
        const position = getNextStonePosition();
        initialStones.push({
          id: generateId(),
          type: "stone-of-map1",
          position: position,
          health: 4000,
          maxHealth: 4200,
        });
      }
    }

    setEnemies(initialStones);
  }, [currentMap, isOfflineMode, showOfflineUI]);

  useEffect(() => {
    if (currentAttackHitbox && player.isAttacking) {
      const playerWithCallback = {
        ...player,
        onDamageDealt: (damage: number, isCritical: boolean = false) => {
          const newDamageNumber = {
            id: generateId(),
            damage,
            position: { ...player.position },
            isCritical,
          };
          setDamageNumbers((prev) => [...prev, newDamageNumber]);
        },
      };

      setEnemies((prevEnemies) =>
        AttackManager.checkEnemyHits(
          currentAttackHitbox,
          prevEnemies,
          playerWithCallback
        )
      );

      if (tigerusBoss) {
        const updatedBoss = TigerusManager.handlePlayerAttack(tigerusBoss);
        if (updatedBoss !== tigerusBoss) {
          setTigerusBoss(updatedBoss);
        }
      }
    }
  }, [currentAttackHitbox, player.isAttacking]);

  const handleSpawnWhiteTiger = (tiger: Enemy) => {
    if (!isOfflineMode) {
      setEnemies((prev) => [...prev, tiger]);
    }
  };

  // Modificăm funcția pentru a gestiona corect adăugarea de cufere și a afișa notificări uniforme
  const handleStoneDeath = (stoneId: string) => {
    setEnemies((prev) => {
      // Găsim piatra ucisă pentru a determina tipul
      const killedStone = prev.find((enemy) => enemy.id === stoneId);
      const newEnemies = prev.filter(
        (enemy) => enemy.id !== stoneId && enemy.parentMetinId !== stoneId
      );

      // Dacă nu suntem în sat, generăm drop-uri
      if (currentMap !== "village" && killedStone) {
        // Determinăm ce tip de cufăr să dăm în funcție de hartă și tipul pietrei
        let possibleChests = [];

        if (killedStone.type === "stone-of-map1") {
          possibleChests = [GameItems.MOONLIGHT_CHEST, GameItems.GOLD_PIECE];
        } else if (killedStone.type === "desert-metin") {
          possibleChests = [
            GameItems.MOONLIGHT_CHEST,
            GameItems.GOLD_PIECE,
            GameItems.WARRIORS_CHEST,
          ];
        } else {
          // Default pentru pietrele obișnuite
          possibleChests = [
            GameItems.MOONLIGHT_CHEST,
            GameItems.JEWELRY_CHEST,
            GameItems.WARRIORS_CHEST,
            GameItems.GOLD_PIECE,
            GameItems.UPGRADE_CHEST,
          ];
        }

        // 50% șansă pentru drop de cufăr
        if (Math.random() < 0.5) {
          // Alege un cufăr aleatoriu din lista disponibilă
          const selectedChest =
            possibleChests[Math.floor(Math.random() * possibleChests.length)];
          // Determină numărul de cufere (între 1 și 3)
          const chestAmount = Math.floor(Math.random() * 3) + 1;

          const emptySlot = findFirstEmptyInventorySlot();

          if (emptySlot) {
            // Verificăm dacă există deja acest tip de cufăr în inventar
            const existingChest = player.inventory.find(
              (item) => item.name === selectedChest.name
            );

            if (existingChest) {
              // Actualizăm stack-ul existent
              setInventory((prev) =>
                prev.map((item) =>
                  item.id === existingChest.id
                    ? {
                        ...item,
                        stackSize: (item.stackSize || 0) + chestAmount,
                      }
                    : item
                )
              );
            } else {
              // Adăugăm un nou stack
              setInventory((prev) => [
                ...prev,
                {
                  ...selectedChest,
                  id: generateId(),
                  slotId: emptySlot,
                  stackSize: chestAmount,
                },
              ]);
            }

            // Afișăm DOAR notificarea nouă pentru cufăr în modul offline
            const notificationId = `chest-${Date.now()}`;
            const notificationsContainer = document.getElementById(
              "chest-notifications"
            );
            if (notificationsContainer) {
              const notification = document.createElement("div");
              notification.id = notificationId;
              notification.className =
                "bg-indigo-900 bg-opacity-90 rounded-lg p-3 border border-indigo-600 flex items-center gap-3 animate-fadeIn pointer-events-auto";
              notification.innerHTML = `
                <img src="${selectedChest.icon}" alt="${
                selectedChest.name
              }" class="w-10 h-10" style="image-rendering: pixelated;">
                <div>
                  <div class="font-bold text-indigo-200">Found ${
                    selectedChest.name
                  }</div>
                  <div class="text-xs text-indigo-300">+${chestAmount} ${
                selectedChest.name
              }${chestAmount > 1 ? "s" : ""}</div>
                </div>
              `;
              notificationsContainer.appendChild(notification);

              // Eliminăm notificarea după câteva secunde
              setTimeout(() => {
                const notificationElement =
                  document.getElementById(notificationId);
                if (notificationElement) {
                  notificationElement.classList.add("animate-fadeOut");
                  setTimeout(() => notificationElement.remove(), 500);
                }
              }, 3000);
            }
          }
        }

        // Adaugă Building Material drop
        const buildingMaterialDrop = Math.random() < 0.5 ? 0 : 1; // 50% șansă pentru 0, 50% șansă pentru 1
        const rareDrop = Math.random() < 0.05;
        const materialAmount = rareDrop ? 3 : buildingMaterialDrop;

        if (materialAmount > 0) {
          const emptySlot = findFirstEmptyInventorySlot();

          if (emptySlot) {
            // Verificăm dacă există deja Building Material în inventar
            const existingMaterial = player.inventory.find(
              (item) => item.name === "Building Material"
            );

            if (existingMaterial) {
              // Actualizăm stack-ul existent
              setInventory((prev) =>
                prev.map((item) =>
                  item.id === existingMaterial.id
                    ? {
                        ...item,
                        stackSize: (item.stackSize || 0) + materialAmount,
                      }
                    : item
                )
              );
            } else {
              // Adăugăm un nou stack
              setInventory((prev) => [
                ...prev,
                {
                  ...GameItems.BUILDING_MATERIAL,
                  id: generateId(),
                  slotId: emptySlot,
                  stackSize: materialAmount,
                },
              ]);
            }

            // Afișăm notificarea uniformizată
            const notificationId = `building-material-${Date.now()}`;
            const notificationsContainer = document.getElementById(
              "chest-notifications"
            );
            if (notificationsContainer) {
              const notification = document.createElement("div");
              notification.id = notificationId;
              notification.className =
                "bg-green-900 bg-opacity-90 rounded-lg p-3 border border-green-600 flex items-center gap-3 animate-fadeIn pointer-events-auto";
              notification.innerHTML = `
                <img src="${GameItems.BUILDING_MATERIAL.icon}" alt="Building Material" class="w-10 h-10" style="image-rendering: pixelated;">
                <div>
                  <div class="font-bold text-green-200">Found Building Materials</div>
                  <div class="text-xs text-green-300">+${materialAmount} Building Materials</div>
                </div>
              `;
              notificationsContainer.appendChild(notification);

              // Eliminăm notificarea după câteva secunde
              setTimeout(() => {
                const notificationElement =
                  document.getElementById(notificationId);
                if (notificationElement) {
                  notificationElement.classList.add("animate-fadeOut");
                  setTimeout(() => notificationElement.remove(), 500);
                }
              }, 3000);
            }
          }
        }
      }

      // Nu respawna pietre în sat
      if (currentMap === "village") {
        return newEnemies;
      }

      // Restul codului pentru respawn-ul pietrelor în funcție de hartă
      if (currentMap === "sohan") {
        const currentMetinCount = newEnemies.filter(
          (e) => e.type === "metin"
        ).length;
        const currentStoneOfMetinCount = newEnemies.filter(
          (e) => e.type === "stone-of-metin"
        ).length;

        const newPosition = getNextStonePosition();
        lastMetinPositionRef.current = newPosition;

        const spawnStoneOfMetin = Math.random() < 0.6;

        if (
          spawnStoneOfMetin &&
          currentStoneOfMetinCount < MAX_STONE_OF_METIN
        ) {
          const newStoneOfMetin: Enemy = {
            id: generateId(),
            type: "stone-of-metin",
            position: newPosition,
            health: 8000,
            maxHealth: 10000,
          };
          return [...newEnemies, newStoneOfMetin];
        } else if (currentMetinCount < MAX_METIN_STONES) {
          const newMetin: Enemy = {
            id: generateId(),
            type: "metin",
            position: newPosition,
            health: 8000,
            maxHealth: 10000,
          };
          return [...newEnemies, newMetin];
        }
      } else if (currentMap === "map1") {
        // Respawn a map1 stone when one is destroyed
        const currentStoneMap1Count = newEnemies.filter(
          (e) => e.type === "stone-of-map1"
        ).length;
        const MAX_MAP1_STONES = 6;

        if (currentStoneMap1Count < MAX_MAP1_STONES) {
          const newPosition = getNextStonePosition();
          const newStone: Enemy = {
            id: generateId(),
            type: "stone-of-map1",
            position: newPosition,
            health: 4000,
            maxHealth: 4200,
          };
          return [...newEnemies, newStone];
        }
      }

      return newEnemies;
    });
  };

  const handleTigerMove = (
    id: string,
    newPosition: { x: number; y: number }
  ) => {
    setEnemies((prev) =>
      prev.map((enemy) =>
        enemy.id === id ? { ...enemy, position: newPosition } : enemy
      )
    );
  };

  const updateCameraPosition = useCallback(
    (playerX: number, playerY: number) => {
      if (viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const viewportHeight = viewportRef.current.clientHeight;

        cameraPositionRef.current = {
          x: playerX - viewportWidth / (2 * zoomLevel),
          y: playerY - viewportHeight / (2 * zoomLevel),
        };
      }
    },
    [zoomLevel]
  );

  useEffect(() => {
    updateCameraPosition(player.position.x, player.position.y);
  }, [player.position.x, player.position.y, updateCameraPosition]);

  useEffect(() => {
    if (player.health <= 0 && !isDead) {
      setIsDead(true);
      setPlayer((prev) => (prev ? { ...prev, controlsDisabled: true } : prev));
    }
  }, [player.health, isDead, setPlayer]);

  useEffect(() => {
    if (player.levelUpEffect?.active) {
      setPlayer((prev) =>
        prev
          ? {
              ...prev,
              controlsDisabled: false,
            }
          : prev
      );
    }
  }, [player.levelUpEffect?.active]);

  const handleRespawn = useCallback(
    (atHome: boolean) => {
      const respawnPosition = atHome
        ? { x: 4800, y: 4800 }
        : { ...player.position };

      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          health: prev.maxHealth,
          mana: prev.maxMana,
          position: respawnPosition,
          isAttacking: false,
          attackSequence: 0,
          autoAttacking: false,
          targetEnemy: undefined,
          controlsDisabled: false,
        };
      });

      setIsDead(false);
    },
    [player.position, setPlayer]
  );

  const handleDamageDealt = useCallback(
    (damage: number, isCritical: boolean = false) => {
      const newDamageNumber = {
        id: generateId(),
        damage,
        position: { ...player.position },
        isCritical,
      };
      setDamageNumbers((prev) => [...prev, newDamageNumber]);
    },
    [player.position]
  );

  const handleTigerusAttack = useCallback(
    (damage: number) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const newHealth = Math.max(0, prev.health - damage);
        return {
          ...prev,
          health: newHealth,
        };
      });

      const newDamageNumber = {
        id: generateId(),
        damage,
        position: { ...player.position },
        isCritical: false,
      };
      setDamageNumbers((prev) => [...prev, newDamageNumber]);
    },
    [player.position, setPlayer]
  );

  const keys = useKeyboardControls(player, setPlayer, setShowHitbox);

  usePlayerMovement({
    player,
    setPlayer,
    keys,
    enemies,
    setEnemies,
    mapSize,
    setCurrentAttackHitbox,
    setCameraPosition: (pos) => {
      cameraPositionRef.current = pos;
    },
    viewportRef,
    zoomLevel,
    onDamageDealt: handleDamageDealt,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const worldX =
          (e.clientX - rect.left) / zoomLevel + cameraPositionRef.current.x;
        const worldY =
          (e.clientY - rect.top) / zoomLevel + cameraPositionRef.current.y;
        worldMousePositionRef.current = {
          x: Math.round(worldX),
          y: Math.round(worldY),
        };
      }
    },
    [zoomLevel]
  );

  const handleDamageNumberComplete = useCallback((id: string) => {
    setDamageNumbers((prev) => prev.filter((dn) => dn.id !== id));
  }, []);

  const findFirstEmptyInventorySlot = () => {
    const usedSlots = player.inventory.map((item) => item.slotId);
    for (let i = 1; i <= 24; i++) {
      if (!usedSlots.includes(i)) {
        return i;
      }
    }
    return null;
  };

  const setInventory = (updater: any) => {
    setPlayer((prev) => {
      if (!prev) return prev;

      // Dacă updater este o funcție, o aplicăm pe inventarul actual
      if (typeof updater === "function") {
        return {
          ...prev,
          inventory: updater(prev.inventory),
        };
      }

      // Altfel, folosim direct valoarea
      return {
        ...prev,
        inventory: updater,
      };
    });
  };

  useEffect(() => {
    if (!isOfflineMode || !showOfflineUI || !isAutoFarming) {
      if (checkForMissingStoneIntervalRef.current) {
        clearInterval(checkForMissingStoneIntervalRef.current);
        checkForMissingStoneIntervalRef.current = null;
      }
      return;
    }

    const currentFarmStone = enemies.find((enemy) => enemy.isOfflineFarmTarget);

    if (currentFarmStone) {
      lastFarmStonePositionRef.current = { ...currentFarmStone.position };
    }

    checkForMissingStoneIntervalRef.current = setInterval(() => {
      const farmStoneExists = enemies.some(
        (enemy) => enemy.isOfflineFarmTarget
      );

      if (
        !farmStoneExists &&
        isAutoFarming &&
        lastFarmStonePositionRef.current
      ) {
        console.log("Farming stone not found! Creating a new one...");

        // Determine the type of stone based on the current map
        let stoneType = "metin"; // Default
        let healthValue = 8000;
        let maxHealthValue = 8000;

        if (currentMap === "map1") {
          stoneType = "stone-of-map1";
          healthValue = 4000;
          maxHealthValue = 4200;
        } else if (currentMap === "yogbi") {
          stoneType = "desert-metin";
          healthValue = 6000;
          maxHealthValue = 8000;
        } else if (currentMap === "sohan") {
          stoneType = "metin";
          healthValue = 8000;
          maxHealthValue = 10000;
        }

        const newStone = {
          id: generateId(),
          type: stoneType,
          position: { ...lastFarmStonePositionRef.current },
          health: healthValue,
          maxHealth: maxHealthValue,
          isOfflineFarmTarget: true,
          shouldDropNothing: Math.random() < 0.5,
        };

        setEnemies([newStone]);

        setPlayer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            targetEnemy: newStone.id,
            autoAttacking: true,
            direction: { x: 1, y: 0 },
          };
        });
      }
    }, 5000);

    return () => {
      if (checkForMissingStoneIntervalRef.current) {
        clearInterval(checkForMissingStoneIntervalRef.current);
        checkForMissingStoneIntervalRef.current = null;
      }
    };
  }, [
    isOfflineMode,
    showOfflineUI,
    isAutoFarming,
    enemies,
    setPlayer,
    currentMap,
  ]);

  const handleReturnToOnline = useCallback(() => {
    if (checkForMissingStoneIntervalRef.current) {
      clearInterval(checkForMissingStoneIntervalRef.current);
      checkForMissingStoneIntervalRef.current = null;
    }

    const keyElement = document.querySelector('[data-key=" "]');
    if (keyElement) {
      keyElement.setAttribute("data-pressed", "false");
    }

    setIsAutoFarming(false);
    setShowOfflineUI(false);
    setOfflineFarmTimer(30);

    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        targetEnemy: undefined,
        autoAttacking: false,
        isAttacking: false,
      };
    });

    setEnemies((prev) => prev.filter((enemy) => !enemy.isOfflineFarmTarget));

    if (onOfflineModeToggle) {
      onOfflineModeToggle();
    }
  }, [setPlayer, onOfflineModeToggle]);

  // Listen for map tile updates
  useEffect(() => {
    const handleMapTilesUpdated = (event: any) => {
      if (currentMap === "village") {
        // You could potentially do something here with the updated tiles
        // event.detail.tiles contains the array of placed tiles
      }
    };

    window.addEventListener("mapTilesUpdated", handleMapTilesUpdated);

    return () => {
      window.removeEventListener("mapTilesUpdated", handleMapTilesUpdated);
    };
  }, [currentMap]);

  // Update the ensureVillageTilesLoaded function:
  const ensureVillageTilesLoaded = useCallback(() => {
    if (currentMap === "village" && player.id) {
      // Set the current player ID in the global window object
      window.currentPlayerId = player.id;

      try {
        const storageKey = `village_map_tiles_${player.id}`;
        const savedTiles = localStorage.getItem(storageKey);

        if (savedTiles) {
          const parsedTiles = JSON.parse(savedTiles);
          window.currentVillageTiles = parsedTiles;

          // Dispatch event to update the TiledMap
          window.dispatchEvent(
            new CustomEvent("mapTilesUpdated", {
              detail: { tiles: parsedTiles },
            })
          );
        } else {
          // If no tiles found, we'll create the starter tiles in the TiledMap component
          // Clear any existing global reference
          window.currentVillageTiles = undefined;
        }
      } catch (error) {
        console.error("Error loading village tiles:", error);
        // On error, clear the global reference
        window.currentVillageTiles = undefined;
      }
    }
  }, [currentMap, player.id]);

  // Make sure to call this when entering the map
  useEffect(() => {
    // Set global reference to current map
    window.currentMap = currentMap;

    // Clear any existing tiles when changing maps
    window.currentVillageTiles = undefined;

    // Ensure village tiles are loaded if we're in village map
    if (currentMap === "village") {
      ensureVillageTilesLoaded();
    }
  }, [currentMap, ensureVillageTilesLoaded]);

  // Modificăm funcția de selecție a hărții pentru a seta o poziție fixă atunci când jucătorul intră în satul "village"
  const handleMapSelection = useCallback(
    (mapName: string) => {
      setShowMapSelection(false);

      // Definim poziții fixă pentru diferite hărți
      let targetPosition;
      if (mapName === "village") {
        // Poziție fixă pentru teleportare în sat
        targetPosition = { x: 1325, y: 1294 };
      } else {
        // Pentru alte hărți, folosim poziții predefinite sau poziția curentă
        switch (mapName) {
          case "map1":
            targetPosition = { x: 600, y: 400 };
            break;
          case "yogbi":
            targetPosition = { x: 800, y: 800 };
            break;
          case "sohan":
            targetPosition = { x: 1200, y: 1200 };
            break;
          default:
            targetPosition = player.position;
        }
      }

      // Actualizăm playerul cu noua poziție și schimbăm harta
      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          position: targetPosition,
          isInventoryOpen: false,
        };
      });

      onMapSelect(mapName);
    },
    [player, setPlayer, onMapSelect]
  );

  // Create a reusable function for generating stone drops
  const generateStoneDrops = (stoneType: string) => {
    // Don't generate drops if in village
    if (currentMap === "village") return;

    // 50% chance for no drop
    if (Math.random() < 0.5) return;

    // Determine chest options based on stone type
    let possibleChests = [];

    if (stoneType === "stone-of-map1") {
      possibleChests = [GameItems.MOONLIGHT_CHEST, GameItems.GOLD_PIECE];
    } else if (stoneType === "desert-metin") {
      possibleChests = [
        GameItems.MOONLIGHT_CHEST,
        GameItems.GOLD_PIECE,
        GameItems.WARRIORS_CHEST,
      ];
    } else {
      // Default for regular metin and stone-of-metin
      possibleChests = [
        GameItems.MOONLIGHT_CHEST,
        GameItems.JEWELRY_CHEST,
        GameItems.WARRIORS_CHEST,
        GameItems.GOLD_PIECE,
        GameItems.UPGRADE_CHEST,
      ];
    }

    // Select chest and amount
    const selectedChest =
      possibleChests[Math.floor(Math.random() * possibleChests.length)];
    const chestAmount = Math.floor(Math.random() * 3) + 1;

    // Add to inventory
    const emptySlot = findFirstEmptyInventorySlot();
    if (emptySlot) {
      // Check if player already has this chest type
      const existingChest = player.inventory.find(
        (item) => item.name === selectedChest.name
      );

      if (existingChest) {
        // Update existing stack
        setInventory((prev) =>
          prev.map((item) =>
            item.id === existingChest.id
              ? { ...item, stackSize: (item.stackSize || 0) + chestAmount }
              : item
          )
        );
      } else {
        // Add new stack
        setInventory((prev) => [
          ...prev,
          {
            ...selectedChest,
            id: generateId(),
            slotId: emptySlot,
            stackSize: chestAmount,
          },
        ]);
      }

      // Display notification
      displayChestNotification(selectedChest, chestAmount);
    }

    // Generate building materials
    generateBuildingMaterials();
  };

  // Helper function for showing chest notifications
  const displayChestNotification = (chest, amount) => {
    const notificationId = `chest-${Date.now()}`;
    const notificationsContainer = document.getElementById(
      "chest-notifications"
    );
    if (notificationsContainer) {
      const notification = document.createElement("div");
      notification.id = notificationId;
      notification.className =
        "bg-indigo-900 bg-opacity-90 rounded-lg p-3 border border-indigo-600 flex items-center gap-3 animate-fadeIn pointer-events-auto";
      notification.innerHTML = `
        <img src="${chest.icon}" alt="${
        chest.name
      }" class="w-10 h-10" style="image-rendering: pixelated;">
        <div>
          <div class="font-bold text-indigo-200">Found ${chest.name}</div>
          <div class="text-xs text-indigo-300">+${amount} ${chest.name}${
        amount > 1 ? "s" : ""
      }</div>
        </div>
      `;
      notificationsContainer.appendChild(notification);

      // Remove notification after a few seconds
      setTimeout(() => {
        const notificationElement = document.getElementById(notificationId);
        if (notificationElement) {
          notificationElement.classList.add("animate-fadeOut");
          setTimeout(() => notificationElement.remove(), 500);
        }
      }, 3000);
    }
  };

  // Helper function for generating building materials
  const generateBuildingMaterials = () => {
    const buildingMaterialDrop = Math.random() < 0.5 ? 0 : 1;
    const rareDrop = Math.random() < 0.05;
    const materialAmount = rareDrop ? 3 : buildingMaterialDrop;

    if (materialAmount > 0) {
      const materialSlot = findFirstEmptyInventorySlot();
      if (materialSlot) {
        const existingMaterial = player.inventory.find(
          (item) => item.name === "Building Material"
        );

        if (existingMaterial) {
          setInventory((prev) =>
            prev.map((item) =>
              item.id === existingMaterial.id
                ? { ...item, stackSize: (item.stackSize || 0) + materialAmount }
                : item
            )
          );
        } else {
          setInventory((prev) => [
            ...prev,
            {
              ...GameItems.BUILDING_MATERIAL,
              id: generateId(),
              slotId: materialSlot,
              stackSize: materialAmount,
            },
          ]);
        }

        // Display building material notification
        displayBuildingMaterialNotification(materialAmount);
      }
    }
  };

  return (
    <div
      ref={viewportRef}
      className="relative w-full h-full overflow-hidden bg-gray-900"
      style={{ height: "100vh" }}
      onMouseMove={handleMouseMove}
    >
      {isOfflineMode && showOfflineUI && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 px-4 py-2 rounded z-50">
          <div className="text-center">
            <div className="text-yellow-400 font-bold mb-2">
              Auto-Farming Mode
            </div>
            {!isAutoFarming ? (
              <div className="text-white">
                Next stone in: {offlineFarmTimer}s
              </div>
            ) : (
              <div className="text-green-400">Attacking stone...</div>
            )}

            <button
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              onClick={handleReturnToOnline}
            >
              Return to Online
            </button>
          </div>
        </div>
      )}

      <FPSCounter />

      {/* Minimap */}
      <Minimap
        player={player}
        enemies={visibleEnemies}
        currentMap={currentMap}
        mapSize={mapSize}
        showFullMap={showFullMap}
        onToggleFullMap={() => setShowFullMap((prev) => !prev)}
      />

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[300px] bg-black bg-opacity-50 px-3 py-1 rounded z-50 font-mono text-sm coordinates-display">
        <div className="coordinates-inner flex-row">
          <span className="text-green-400">
            X: {Math.round(player.position.x)}
          </span>
          <span className="text-blue-400 ml-2">
            Y: {Math.round(player.position.y)}
          </span>
        </div>
        <style>{`
          @media (max-width: 767px) {
            .coordinates-display {
              top: 10px !important;
              left: 50% !important;
              transform: translateX(-50%) !important;
              -webkit-transform: translateX(-50%) !important;
              font-size: 0.60rem !important;
              padding: 1px 6px !important;
              border-radius: 6px !important;
              min-width: 90px;
              background: rgba(0,0,0,0.7) !important;
              z-index: 9999;
            }
            .coordinates-inner {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              gap: 0.05rem !important;
            }
            .coordinates-inner span {
              margin-left: 0 !important;
            }
          }
          @media (min-width: 768px) {
            .coordinates-inner {
              display: flex;
              flex-direction: row;
              align-items: center;
            }
          }
        `}</style>
      </div>

      <div
        className="absolute"
        style={{
          transform: `scale(${zoomLevel}) translate(${-cameraPositionRef.current
            .x}px, ${-cameraPositionRef.current.y}px)`,
          transformOrigin: "0 0",
          width: mapSize.width,
          height: mapSize.height,
          willChange: "transform",
        }}
      >
        {/* Choose between standard GameMap or TiledMap based on currentMap */}
        {currentMap === "village" ? (
          <TiledMap
            mapName={currentMap}
            tileSize={TILE_SIZE}
            zoomLevel={zoomLevel}
            cameraPosition={cameraPositionRef.current}
            playerPosition={player.position}
            mapSize={mapSize}
          />
        ) : (
          <GameMap
            mapSize={mapSize}
            currentMap={currentMap}
            zoomLevel={zoomLevel}
            cameraPosition={cameraPositionRef.current}
          />
        )}

        {/* Player always renders on top of the map */}
        <PlayerComponent player={player} />

        {/* Only render enemies if not in building mode */}
        {!isBuildingMode &&
          visibleEnemies.map((enemy) => {
            if (enemy.type === "metin") {
              // If we're in Yogbi map, use the desert version
              if (currentMap === "yogbi") {
                return (
                  <MetinStoneDesert
                    key={enemy.id}
                    position={enemy.position}
                    onSpawnWhiteTiger={handleSpawnWhiteTiger}
                    onDeath={() => handleStoneDeath(enemy.id)}
                    player={player}
                  />
                );
              } else {
                // Regular metin stone for other maps
                return (
                  <MetinStone
                    key={enemy.id}
                    position={enemy.position}
                    onSpawnWhiteTiger={handleSpawnWhiteTiger}
                    onDeath={() => handleStoneDeath(enemy.id)}
                    player={player}
                  />
                );
              }
            } else if (enemy.type === "stone-of-metin") {
              // Similar logic for stone-of-metin
              if (currentMap === "yogbi") {
                return (
                  <MetinStoneDesert
                    key={enemy.id}
                    position={enemy.position}
                    onSpawnWhiteTiger={handleSpawnWhiteTiger}
                    onDeath={() => handleStoneDeath(enemy.id)}
                    player={player}
                  />
                );
              } else {
                // Regular stone-of-metin for other maps
                return (
                  <StoneOfMetin
                    key={enemy.id}
                    position={enemy.position}
                    onSpawnWhiteTiger={handleSpawnWhiteTiger} // Add this prop
                    onDeath={() => handleStoneDeath(enemy.id)}
                    player={player}
                  />
                );
              }
            } else if (enemy.type === "desert-metin") {
              // Always use desert version for this type
              return (
                <MetinStoneDesert
                  key={enemy.id}
                  position={enemy.position}
                  onSpawnWhiteTiger={handleSpawnWhiteTiger}
                  onDeath={() => handleStoneDeath(enemy.id)}
                  player={player}
                />
              );
            } else if (enemy.type === "stone-of-map1") {
              // Stone for map1
              return (
                <StoneMap1
                  key={enemy.id}
                  position={enemy.position}
                  onDeath={() => handleStoneDeath(enemy.id)}
                  player={player}
                />
              );
            }
            // Handle other enemy types...
          })}

        {!isBuildingMode && tigerusBoss && (
          <TigerusBoss
            boss={tigerusBoss}
            player={player}
            onDeath={() => {
              setTigerusBoss((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  health: 0,
                  deathTime: Date.now(),
                };
              });
            }}
            onAttackPlayer={handleTigerusAttack}
          />
        )}

        {!isBuildingMode &&
          currentAttackHitbox &&
          currentAttackHitbox.type === "sword" && (
            <SwordAttack
              hitbox={currentAttackHitbox}
              player={player}
              showNumber={false}
            />
          )}

        {damageNumbers.map((dn) => (
          <DamageNumber
            key={dn.id}
            damage={dn.damage}
            position={dn.position}
            onComplete={() => handleDamageNumberComplete(dn.id)}
            isCritical={dn.isCritical}
          />
        ))}

        {player.levelUpEffect?.active && (
          <LevelUpEffect
            position={player.position}
            onComplete={() => {
              setPlayer((prev) =>
                prev
                  ? {
                      ...prev,
                      levelUpEffect: undefined,
                      controlsDisabled: false,
                    }
                  : prev
              );
            }}
          />
        )}
      </div>

      {/* Building System Overlay - only active in village map */}
      {currentMap === "village" && (
        <BuildingSystem player={player} setPlayer={setPlayer} isActive={true} />
      )}

      <PlayerHealthBar player={player} />

      {/* Only show ability bar if not in building mode */}
      {!isBuildingMode && (
        <AbilityBar
          player={player}
          setPlayer={setPlayer}
          enemies={enemies}
          setEnemies={setEnemies}
          onDamageDealt={handleDamageDealt}
          currentMap={currentMap}
        />
      )}

      <ActiveBuffs player={player} />

      {player.isStatsWindowOpen && (
        <StatsWindow player={player} setPlayer={setPlayer} />
      )}

      {isSkillTreeOpen && (
        <SkillTreeWindow
          player={player}
          setPlayer={setPlayer}
          onClose={() => setIsSkillTreeOpen(false)}
        />
      )}

      {player.isInventoryOpen && (
        <Inventory
          player={player}
          setPlayer={setPlayer}
          isOpen={player.isInventoryOpen}
          inventory={player.inventory}
          setInventory={(newInventory) =>
            setPlayer((prev) =>
              prev ? { ...prev, inventory: newInventory } : prev
            )
          }
          setMapSelectionPosition={setMapSelectionPosition}
          setShowMapSelection={setShowMapSelection}
          onMapSelect={onMapSelect}
        />
      )}

      {isDead && <DeathScreen player={player} onRespawn={handleRespawn} />}

      {showMapSelection && (
        <MapSelectionWindow
          onClose={() => setShowMapSelection(false)}
          onMapSelect={onMapSelect}
          position={mapSelectionPosition}
        />
      )}
    </div>
  );
};

export default GameWorld;
