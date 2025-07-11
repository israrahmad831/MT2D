import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player } from '../../types';
import { SoundManager } from '../../utils/SoundManager';

interface Tile {
  id: string;
  x: number;
  y: number;
  type: string;
  texture: string;
  layer: number; // Adăugăm layer obligatoriu
}

interface BuildingSystemProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  isActive: boolean;
}

const TILE_SIZE = 32;
const TILE_IMAGES = [
  { id: 'grass_tile', url: 'https://i.imgur.com/o0fVRZN.png', type: 'custom_tile' }, 
  { id: 'stone_tile', url: 'https://i.imgur.com/NkQRvdZ.png', type: 'stone_tile' },
  { id: 'cobblestone_tile', url: 'https://i.imgur.com/Vpa31Q0.png', type: 'cobblestone_tile' },
  { id: 'wood_tile', url: 'https://i.imgur.com/xaVUevW.png', type: 'wood_tile' },
  { id: 'brick_tile', url: 'https://i.imgur.com/xLc7N9c.png', type: 'brick_tile' },
  { id: 'sand_tile', url: 'https://i.imgur.com/WEdoduk.png', type: 'sand_tile' },
  { id: 'yellow_sand_tile', url: 'https://i.imgur.com/7eELwEk.png', type: 'yellow_sand_tile' },
  { id: 'dark_stone_tile', url: 'https://i.imgur.com/B5P4sIk.png', type: 'dark_stone_tile' },
  { id: 'marble_tile', url: 'https://i.imgur.com/lWvFM9Z.png', type: 'marble_tile' },
  { id: 'snow_tile', url: 'https://i.imgur.com/7Wu9ymM.png', type: 'snow_tile' },
  { id: 'water_tile', url: 'https://i.imgur.com/qYDxc0O.gif', type: 'water_tile' }
];

// Definim layerele disponibile
const LAYERS = [
  { id: 1, name: 'Layer 1', description: 'Bază (iarbă, piatră, apă)' },
  { id: 2, name: 'Layer 2', description: 'Decorațiuni (plante mici)' },
  { id: 3, name: 'Layer 3', description: 'Obiecte (mobilier, pietre)' },
  { id: 4, name: 'Layer 4', description: 'Structuri mici (garduri)' },
  { id: 5, name: 'Layer 5', description: 'Clădiri (case, magazii)' }
];

const getStorageKey = (playerId: string) => `village_map_tiles_${playerId}`;

declare global {
  interface Window {
    currentMap?: string;
    checkBuildingTileCollision?: (x: number, y: number) => boolean;
    currentVillageTiles?: any[];
    currentPlayerId?: string;
  }
}

const BuildingSystem: React.FC<BuildingSystemProps> = ({ player, setPlayer, isActive }) => {
  const [showTileSelector, setShowTileSelector] = useState(false);
  const [placedTiles, setPlacedTiles] = useState<Map<string, Tile>>(new Map());
  const [layeredTiles, setLayeredTiles] = useState<Record<string, Record<number, Tile>>>({});
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState(1); // Începem cu Layer 1
  const tileImagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TILE_IMAGES.length).fill(null));
  const notificationTimeoutRef = useRef<any>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(TILE_IMAGES.length).fill(false));

  // Load tile images
  useEffect(() => {
    TILE_IMAGES.forEach((tileData, index) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        tileImagesRef.current[index] = img;
        setImagesLoaded(prev => {
          const newLoaded = [...prev];
          newLoaded[index] = true;
          return newLoaded;
        });
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${tileData.url}`);
        setImagesLoaded(prev => {
          const newLoaded = [...prev];
          newLoaded[index] = true; // Mark as loaded even if failed to prevent infinite loading
          return newLoaded;
        });
      };
      img.src = tileData.url;
    });
  }, []);

  // Load saved tiles
  useEffect(() => {
    if (player.id) {
      const storageKey = getStorageKey(player.id);
      const savedTiles = localStorage.getItem(storageKey);
      if (savedTiles) {
        try {
          const tilesArray = JSON.parse(savedTiles);
          const tilesMap = new Map();
          const layeredTilesObj: Record<string, Record<number, Tile>> = {};
          
          tilesArray.forEach((tile: Tile) => {
            // Asigurăm-ne că fiecare tile are un layer (backward compatibility)
            const tileWithLayer = {...tile, layer: tile.layer || 1};
            const tileKey = `${tile.x},${tile.y}`;
            
            // Actualizează structura veche pentru compatibilitate
            tilesMap.set(tileKey, tileWithLayer);
            
            // Actualizează structura nouă organizată pe layere
            if (!layeredTilesObj[tileKey]) {
              layeredTilesObj[tileKey] = {};
            }
            layeredTilesObj[tileKey][tileWithLayer.layer] = tileWithLayer;
          });
          
          setPlacedTiles(tilesMap);
          setLayeredTiles(layeredTilesObj);
        } catch (error) {
          console.error('Error loading saved tiles:', error);
        }
      }
    }
  }, [player.id]);

  // Convert world coordinates to tile coordinates
  const worldToTile = useCallback((x: number, y: number) => {
    return {
      x: Math.floor(x / TILE_SIZE),
      y: Math.floor(y / TILE_SIZE)
    };
  }, []);

  // Convert tile coordinates to world coordinates
  const tileToWorld = useCallback((tileX: number, tileY: number) => {
    return {
      x: tileX * TILE_SIZE,
      y: tileY * TILE_SIZE
    };
  }, []);

  // Check if player has building materials
  const checkBuildingMaterials = useCallback(() => {
    const materials = player.inventory.find(item => item.name === 'Building Material');
    return materials && materials.stackSize && materials.stackSize > 0;
  }, [player.inventory]);

  // Save tiles to localStorage and update global state
  const saveTiles = useCallback((layeredTilesObj: Record<string, Record<number, Tile>>) => {
    if (player.id) {
      // Convert layered tiles to flat array
      const tilesArray: Tile[] = [];
      Object.values(layeredTilesObj).forEach(layersAtPosition => {
        Object.values(layersAtPosition).forEach(tile => {
          tilesArray.push(tile);
        });
      });
      
      const storageKey = getStorageKey(player.id);
      localStorage.setItem(storageKey, JSON.stringify(tilesArray));
      
      // Update global reference
      window.currentVillageTiles = tilesArray;
      
      // Dispatch event to notify TiledMap
      window.dispatchEvent(new CustomEvent('mapTilesUpdated', { 
        detail: { tiles: tilesArray } 
      }));
    }
  }, [player.id]);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = player.position.x + (mouseX - window.innerWidth / 2) / 3.2;
    const worldY = player.position.y + (mouseY - window.innerHeight / 2) / 3.2;
    
    const tileCoords = worldToTile(worldX, worldY);
    setHoveredTile(tileCoords);
  }, [isActive, player.position, worldToTile]);

  // Handle tile placement
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isActive || !hoveredTile) return;
    
    e.preventDefault();
    
    const worldPos = tileToWorld(hoveredTile.x, hoveredTile.y);
    const distance = Math.sqrt(
      Math.pow(worldPos.x - player.position.x, 2) + 
      Math.pow(worldPos.y - player.position.y, 2)
    );
    
    if (distance > TILE_SIZE * 3) {
      showNotification('Too far to build!', 'error');
      return;
    }

    if (!checkBuildingMaterials()) {
      showNotification('Not enough building materials!', 'error');
      return;
    }
    
    const tileKey = `${hoveredTile.x},${hoveredTile.y}`;
    const selectedTile = TILE_IMAGES[selectedTileIndex];
    
    const newTile: Tile = {
      id: `tile_${Date.now()}`,
      x: hoveredTile.x,
      y: hoveredTile.y,
      type: selectedTile.type,
      texture: selectedTile.url,
      layer: selectedLayer // Folosim layer-ul selectat
    };
    
    // Update both data structures for backward compatibility
    const newPlacedTiles = new Map(placedTiles);
    newPlacedTiles.set(tileKey, newTile);
    setPlacedTiles(newPlacedTiles);
    
    // Update layered tiles structure - maintain tiles at different layers
    setLayeredTiles(prev => {
      const newLayered = {...prev};
      if (!newLayered[tileKey]) {
        newLayered[tileKey] = {};
      }
      // Store tile at its layer level
      newLayered[tileKey][selectedLayer] = newTile;
      return newLayered;
    });
    
    // Save the layered tiles
    const updatedLayeredTiles = {...layeredTiles};
    if (!updatedLayeredTiles[tileKey]) {
      updatedLayeredTiles[tileKey] = {};
    }
    updatedLayeredTiles[tileKey][selectedLayer] = newTile;
    saveTiles(updatedLayeredTiles);
    
    // Consume building material
    setPlayer(prev => {
      if (!prev) return prev;
      const materials = prev.inventory.find(item => item.name === 'Building Material');
      if (materials && materials.stackSize && materials.stackSize > 0) {
        return {
          ...prev,
          inventory: prev.inventory.map(item => 
            item.name === 'Building Material' 
              ? { ...item, stackSize: (item.stackSize || 0) - 1 }
              : item
          ).filter(item => !(item.name === 'Building Material' && (item.stackSize || 0) <= 0))
        };
      }
      return prev;
    });
    
    SoundManager.playSound('pick');
  }, [isActive, hoveredTile, placedTiles, layeredTiles, selectedTileIndex, selectedLayer, tileToWorld, player.position, checkBuildingMaterials, saveTiles, setPlayer]);

  // Handle tile removal
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!isActive || !hoveredTile) return;
    
    e.preventDefault();
    
    const tileKey = `${hoveredTile.x},${hoveredTile.y}`;
    
    // Pentru ștergere, eliminăm doar tile-ul de pe layer-ul selectat
    if (layeredTiles[tileKey] && layeredTiles[tileKey][selectedLayer]) {
      // Update layered structure
      setLayeredTiles(prev => {
        const newLayered = {...prev};
        if (newLayered[tileKey]) {
          delete newLayered[tileKey][selectedLayer];
          
          // Dacă nu mai sunt tile-uri la această poziție, eliminăm poziția
          if (Object.keys(newLayered[tileKey]).length === 0) {
            delete newLayered[tileKey];
          }
        }
        return newLayered;
      });
      
      // Update backward compatibility structure
      const updatedLayeredTiles = {...layeredTiles};
      if (updatedLayeredTiles[tileKey]) {
        delete updatedLayeredTiles[tileKey][selectedLayer];
        if (Object.keys(updatedLayeredTiles[tileKey]).length === 0) {
          delete updatedLayeredTiles[tileKey];
        }
      }
      
      // Salvăm modificările și actualizăm și structura veche
      saveTiles(updatedLayeredTiles);
      
      // Actualizăm structura veche pentru compatibilitate
      const newPlacedTiles = new Map(placedTiles);
      
      // Dacă mai există tile-uri la această poziție, folosim tile-ul de pe layer-ul cel mai de sus
      if (updatedLayeredTiles[tileKey]) {
        const layers = Object.keys(updatedLayeredTiles[tileKey]).map(Number).sort((a, b) => b - a);
        if (layers.length > 0) {
          const topLayer = layers[0];
          newPlacedTiles.set(tileKey, updatedLayeredTiles[tileKey][topLayer]);
        }
      } else {
        // Dacă nu mai există tile-uri, eliminăm poziția
        newPlacedTiles.delete(tileKey);
      }
      
      setPlacedTiles(newPlacedTiles);
      
      SoundManager.playSound('pick');
    }
  }, [isActive, hoveredTile, placedTiles, layeredTiles, selectedLayer, saveTiles]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      if (e.key.toLowerCase() === 'e') {
        setShowTileSelector(prev => !prev);
      }
      
      // Numere 1-5 pentru a selecta layerul rapid
      const layerNum = parseInt(e.key);
      if (layerNum >= 1 && layerNum <= 5) {
        setSelectedLayer(layerNum);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive]);

  // Render building overlay
  useEffect(() => {
    if (!isActive || !canvasRef.current || !tileImagesRef.current[selectedTileIndex]) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optimize: only resize canvas when necessary
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (hoveredTile) {
      const worldPos = tileToWorld(hoveredTile.x, hoveredTile.y);
      const screenX = (worldPos.x - player.position.x) * 3.2 + window.innerWidth / 2;
      const screenY = (worldPos.y - player.position.y) * 3.2 + window.innerHeight / 2;
      const scaledTileSize = TILE_SIZE * 3.2;

      const distance = Math.sqrt(
        Math.pow(worldPos.x - player.position.x, 2) + 
        Math.pow(worldPos.y - player.position.y, 2)
      );

      const hasMaterials = checkBuildingMaterials();

      if (distance <= TILE_SIZE * 3 && hasMaterials) {
        // Culoarea overlay-ului depinde de layer
        const layerColors = [
          'rgba(0, 255, 0, 0.2)',     // Layer 1 - verde
          'rgba(0, 180, 255, 0.2)',   // Layer 2 - albastru deschis
          'rgba(255, 200, 0, 0.2)',   // Layer 3 - galben
          'rgba(255, 100, 0, 0.2)',   // Layer 4 - portocaliu
          'rgba(255, 0, 100, 0.2)',   // Layer 5 - roșu/roz
        ];
        
        ctx.fillStyle = layerColors[selectedLayer - 1];
        ctx.fillRect(screenX, screenY, scaledTileSize, scaledTileSize);

        ctx.globalAlpha = 0.6;
        ctx.drawImage(
          tileImagesRef.current[selectedTileIndex]!,
          0, 0, 64, 64,
          screenX, screenY, scaledTileSize, scaledTileSize
        );
        ctx.globalAlpha = 1;

        // Border-ul de asemenea are culoarea layer-ului
        const strokeColors = [
          'rgba(0, 255, 0, 0.8)',     // Layer 1
          'rgba(0, 180, 255, 0.8)',   // Layer 2
          'rgba(255, 200, 0, 0.8)',   // Layer 3
          'rgba(255, 100, 0, 0.8)',   // Layer 4
          'rgba(255, 0, 100, 0.8)',   // Layer 5
        ];
        
        ctx.strokeStyle = strokeColors[selectedLayer - 1];
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, scaledTileSize, scaledTileSize);
        
        // Adăugăm indicatorul de layer în colțul tile-ului
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = strokeColors[selectedLayer - 1];
        ctx.fillText(`L${selectedLayer}`, screenX + 5, screenY + 18);
      } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(screenX, screenY, scaledTileSize, scaledTileSize);
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, scaledTileSize, scaledTileSize);
        
        if (distance <= TILE_SIZE * 3 && !hasMaterials) {
          // Afișăm textul de avertizare direct pe hover
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('No materials!', screenX + scaledTileSize/2, screenY + scaledTileSize/2);
          
          // Adăugăm și iconița de avertizare
          ctx.font = '24px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText('⚠️', screenX + scaledTileSize/2 - 12, screenY + scaledTileSize/2 - 20);
        } else if (distance > TILE_SIZE * 3) {
          // Afișăm textul de avertizare că e prea departe
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Too far!', screenX + scaledTileSize/2, screenY + scaledTileSize/2);
        }
      }

      // Draw player range indicator
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(
        window.innerWidth / 2,
        window.innerHeight / 2,
        TILE_SIZE * 3 * 3.2,
        0, Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [isActive, hoveredTile, player.position, tileToWorld, selectedTileIndex, selectedLayer, checkBuildingMaterials]);

  // Cleanup
  useEffect(() => {
    if (!isActive) return;
    
    return () => {
      delete window.checkBuildingTileCollision;
    };
  }, [isActive]);

  const handleSelectTile = (index: number) => {
    setSelectedTileIndex(index);
    setShowTileSelector(false);
  };
  
  const handleSelectLayer = (layerId: number) => {
    setSelectedLayer(layerId);
  };

  // Adaugă funcția pentru afișarea notificărilor
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Curăță timeout-ul anterior dacă există
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Verifică dacă există deja o notificare și o elimină
    const existingNotification = document.getElementById('building-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    // Creează elementul pentru notificare
    const notificationEl = document.createElement('div');
    notificationEl.id = 'building-notification';
    notificationEl.className = `building-notification ${type}`;
    
    // Stilizare în funcție de tipul notificării
    let backgroundColor;
    if (type === 'success') {
      backgroundColor = 'rgba(0, 128, 0, 0.8)';
    } else if (type === 'error') {
      backgroundColor = 'rgba(200, 0, 0, 0.8)';
    } else {
      backgroundColor = 'rgba(0, 0, 128, 0.8)';
    }
    
    // Aplică stilurile
    Object.assign(notificationEl.style, {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontWeight: 'bold',
      zIndex: '1000',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'opacity 0.3s ease',
      opacity: '0',
    });
    
    // Adaugă conținutul
    notificationEl.textContent = message;
    
    // Adaugă în DOM
    document.body.appendChild(notificationEl);
    
    // Afișează cu efect fade-in
    setTimeout(() => {
      notificationEl.style.opacity = '1';
    }, 10);
    
    // Setează timeout pentru a elimina notificarea după 3 secunde
    notificationTimeoutRef.current = setTimeout(() => {
      notificationEl.style.opacity = '0';
      setTimeout(() => {
        if (notificationEl.parentElement) {
          notificationEl.parentElement.removeChild(notificationEl);
        }
      }, 300);
    }, 3000);
  };

  if (!isActive) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-auto z-30"
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ 
          cursor: 'crosshair',
          willChange: 'transform',
          transform: 'translateZ(0)'
        }}
      />

      {/* Layer Selector (în stânga ecranului) */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 bg-black bg-opacity-80 p-3 rounded-lg flex flex-col gap-2">
        <div className="text-white text-sm mb-2 pixel-text text-center">Layers</div>
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            onClick={() => handleSelectLayer(layer.id)}
            className={`px-3 py-2 rounded transition-all ${
              selectedLayer === layer.id 
                ? 'bg-blue-700 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            title={layer.description}
          >
            <span className="pixel-text">{layer.name}</span>
          </button>
        ))}
      </div>

      {/* Current Tile Display */}
      <div className="fixed bottom-4 right-4 z-40 bg-black bg-opacity-80 p-4 rounded-lg">
        <div className="text-white text-sm mb-2 pixel-text">Building Mode</div>
        <div className="text-gray-300 text-xs mb-2 pixel-text">
          Press E to select tiles<br />
          Left click to place<br />
          Right click to remove<br />
          Press 1-5 to change layer
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 border-2 border-yellow-400 bg-gray-800 rounded overflow-hidden">
            {imagesLoaded[selectedTileIndex] && (
              <img
                src={TILE_IMAGES[selectedTileIndex].url}
                alt="Selected Tile"
                className="w-full h-full object-cover"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
          </div>
          <div>
            <div className="text-xs text-white pixel-text">
              Tile: {TILE_IMAGES[selectedTileIndex].type.replace('_tile', '').replace('_', ' ')}
            </div>
            <div className="text-xs text-blue-300 pixel-text">
              On Layer: {selectedLayer}
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-white pixel-text">
          Building Materials: {player.inventory.find(item => item.name === 'Building Material')?.stackSize || 0}
        </div>
      </div>

      {/* Tile Selector */}
      {showTileSelector && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black bg-opacity-90 p-4 rounded-lg">
          <div className="text-white text-lg mb-4 text-center pixel-text">Select Tile</div>
          <div className="grid grid-cols-4 gap-2">
            {TILE_IMAGES.map((tile, index) => (
              <button
                key={tile.id}
                onClick={() => handleSelectTile(index)}
                className={`w-16 h-16 border-2 rounded overflow-hidden transition-all ${
                  selectedTileIndex === index 
                    ? 'border-yellow-400 bg-yellow-400 bg-opacity-20' 
                    : 'border-gray-600 hover:border-gray-400'
                }`}
              >
                {imagesLoaded[index] && (
                  <img
                    src={tile.url}
                    alt={tile.id}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setShowTileSelector(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BuildingSystem;
