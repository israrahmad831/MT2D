import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TiledMapProps {
  mapName: string;
  tileSize: number;
  zoomLevel: number;
  cameraPosition: { x: number; y: number };
  playerPosition: { x: number; y: number };
  mapSize: { width: number; height: number };
}

interface MapTile {
  id?: string;
  x: number;
  y: number;
  type: string;
  texture: string;
  layer?: number;
  category?: string;
  width?: number;
  height?: number;
}

const TiledMap: React.FC<TiledMapProps> = ({ 
  mapName, 
  tileSize, 
  zoomLevel, 
  cameraPosition,
  playerPosition,
  mapSize 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waterTilesContainerRef = useRef<HTMLDivElement>(null);
  const [mapTiles, setMapTiles] = useState<MapTile[]>([]);
  const [tileImages, setTileImages] = useState<Record<string, HTMLImageElement>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const animationFrameRef = useRef<number>(0);
  const [hasWaterTiles, setHasWaterTiles] = useState(false);
  const lastRenderHash = useRef<string>('');

  // Define the base tiles
  const BASE_TILES = {
    grass: 'https://i.imgur.com/o0fVRZN.png',
    path: 'https://i.imgur.com/o0fVRZN.png',
    custom_tile: 'https://i.imgur.com/o0fVRZN.png',
    stone_tile: 'https://i.imgur.com/NkQRvdZ.png',
    cobblestone_tile: 'https://i.imgur.com/Vpa31Q0.png',
    wood_tile: 'https://i.imgur.com/xaVUevW.png',
    brick_tile: 'https://i.imgur.com/xLc7N9c.png',
    sand_tile: 'https://i.imgur.com/WEdoduk.png',
    yellow_sand_tile: 'https://i.imgur.com/7eELwEk.png',
    dark_stone_tile: 'https://i.imgur.com/B5P4sIk.png',
    marble_tile: 'https://i.imgur.com/lWvFM9Z.png',
    snow_tile: 'https://i.imgur.com/7Wu9ymM.png',
    water_tile: 'https://i.imgur.com/qYDxc0O.gif'
  };

  // Load tile images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Object.entries(BASE_TILES).map(([type, url]) => {
        return new Promise<[string, HTMLImageElement]>((resolve) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = url;
          
          img.onload = () => resolve([type, img]);
          
          img.onerror = () => {
            console.error(`Failed to load image: ${url}`);
            const fallbackImg = new Image();
            fallbackImg.width = 64;
            fallbackImg.height = 64;
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = type === 'grass' ? '#3a5f0b' : '#8c7e58';
              ctx.fillRect(0, 0, 64, 64);
              ctx.strokeStyle = '#000';
              ctx.strokeRect(0, 0, 64, 64);
              fallbackImg.src = canvas.toDataURL();
            }
            resolve([type, fallbackImg]);
          };
        });
      });

      try {
        const loadedImages = await Promise.all(imagePromises);
        const imageMap = Object.fromEntries(loadedImages);
        setTileImages(imageMap);
        setIsLoading(false);
      } catch (error) {
        console.error('Critical error loading tile images:', error);
        setLoadError(true);
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Load initial map base and custom tiles
  useEffect(() => {
    const baseMapTiles: MapTile[] = [];
    
    if (mapName === 'village') {
      const playerTileX = Math.floor(playerPosition.x / tileSize);
      const playerTileY = Math.floor(playerPosition.y / tileSize);
      
      const initialTiles = [
        { x: playerTileX, y: playerTileY },
        { x: playerTileX + 1, y: playerTileY },
        { x: playerTileX, y: playerTileY + 1 },
        { x: playerTileX - 1, y: playerTileY }
      ];
      
      initialTiles.forEach(coords => {
        baseMapTiles.push({
          x: coords.x,
          y: coords.y,
          type: 'stone_tile',
          texture: BASE_TILES.stone_tile
        });
      });
    }
    
    try {
      if (window.currentPlayerId) {
        const storageKey = `village_map_tiles_${window.currentPlayerId}`;
        const savedTiles = localStorage.getItem(storageKey);
        
        if (savedTiles) {
          const customTiles = JSON.parse(savedTiles);
          if (customTiles.length > 0) {
            setMapTiles(customTiles);
            return;
          }
        }
      }
      
      if (baseMapTiles.length > 0 && window.currentPlayerId) {
        const storageKey = `village_map_tiles_${window.currentPlayerId}`;
        localStorage.setItem(storageKey, JSON.stringify(baseMapTiles));
        
        window.currentVillageTiles = baseMapTiles;
        
        window.dispatchEvent(new CustomEvent('mapTilesUpdated', { 
          detail: { tiles: baseMapTiles } 
        }));
      }
      
      setMapTiles(baseMapTiles);
    } catch (error) {
      console.error('Error loading map tiles:', error);
      setMapTiles(baseMapTiles);
    }
  }, [mapName, mapSize.width, mapSize.height, tileSize, playerPosition.x, playerPosition.y]);

  // Listen for map tile updates
  useEffect(() => {
    const handleMapTilesUpdated = (event: any) => {
      if (mapName === 'village' && event.detail?.tiles) {
        const customTiles = event.detail.tiles;
        
        const customTileKeys = new Set();
        customTiles.forEach((tile: MapTile) => {
          customTileKeys.add(`${tile.x},${tile.y}`);
        });
        
        const baseMapTiles = mapTiles.filter(t => t.type === 'grass' || t.type === 'path');
        const filteredBaseTiles = baseMapTiles.filter(t => !customTileKeys.has(`${t.x},${t.y}`));
        
        setMapTiles([...filteredBaseTiles, ...customTiles]);
      }
    };
    
    window.addEventListener('mapTilesUpdated', handleMapTilesUpdated);
    
    return () => {
      window.removeEventListener('mapTilesUpdated', handleMapTilesUpdated);
    };
  }, [mapName, mapTiles]);

  // Check for water tiles and update animation state
  useEffect(() => {
    const hasWater = mapTiles.some(tile => tile.type === 'water_tile');
    setHasWaterTiles(hasWater);
  }, [mapTiles]);

  // Funcție separată pentru water tiles - optimizată
  const updateWaterTiles = useCallback(() => {
    if (!waterTilesContainerRef.current) return;
    
    const container = waterTilesContainerRef.current;
    const waterTiles = mapTiles.filter(tile => tile.type === 'water_tile');
    
    const currentWaterCount = container.children.length;
    if (currentWaterCount !== waterTiles.length) {
      container.innerHTML = '';
      
      waterTiles.forEach(tile => {
        const x = tile.x * tileSize;
        const y = tile.y * tileSize;
        
        if (x >= -tileSize && x < mapSize.width + tileSize && 
            y >= -tileSize && y < mapSize.height + tileSize) {
          const waterImg = document.createElement('img');
          waterImg.src = BASE_TILES.water_tile;
          waterImg.className = 'seamless-tile';
          waterImg.style.position = 'absolute';
          waterImg.style.left = (Math.floor(x) - 0.2) + 'px';
          waterImg.style.top = (Math.floor(y) - 0.2) + 'px';
          waterImg.style.width = (tileSize + 0.4) + 'px';
          waterImg.style.height = (tileSize + 0.4) + 'px';
          waterImg.style.imageRendering = 'pixelated';
          waterImg.style.pointerEvents = 'none';
          waterImg.draggable = false;
          container.appendChild(waterImg);
        }
      });
    }
  }, [mapTiles, tileSize, mapSize]);

  // Render function for the map cu cache pentru performanță
  const renderMap = useCallback(() => {
    if (isLoading || !canvasRef.current || Object.keys(tileImages).length === 0) return;

    const currentHash = JSON.stringify(mapTiles.map(t => `${t.x},${t.y},${t.type}`));
    if (lastRenderHash.current === currentHash) return;
    lastRenderHash.current = currentHash;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = mapSize.width;
    canvas.height = mapSize.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a3000';
    ctx.fillRect(-0.5, -0.5, canvas.width + 1, canvas.height + 1);
    ctx.imageSmoothingEnabled = false;

    const sortedTiles = [...mapTiles].sort((a, b) => 
      (a.layer ?? 0) - (b.layer ?? 0)
    );
    
    sortedTiles.forEach(tile => {
      if (tile.type === 'water_tile') return;
      
      let img;
      if (tile.type === 'custom_tile') {
        img = tileImages['custom_tile'] || tileImages['grass'];
      } else {
        img = tileImages[tile.type] || tileImages['grass'];
      }
      
      if (img) {
        const x = tile.x * tileSize;
        const y = tile.y * tileSize;
        
        const isMultiTile = (tile.width && tile.width > 1) || (tile.height && tile.height > 1);
        
        const tileWidth = tile.width || 1;
        const tileHeight = tile.height || 1;
        const fullWidth = tileSize * tileWidth;
        const fullHeight = tileSize * tileHeight;
        
        if (x >= -fullWidth && x < mapSize.width + tileSize && 
            y >= -fullHeight && y < mapSize.height + tileSize) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          
          if (isMultiTile) {
            const imgWidth = img.naturalWidth || 64 * tileWidth;
            const imgHeight = img.naturalHeight || 64 * tileHeight;
            
            ctx.drawImage(
              img, 
              0, 0, 
              imgWidth, 
              imgHeight, 
              Math.floor(x) - 0.2, 
              Math.floor(y) - 0.2, 
              fullWidth + 0.4, 
              fullHeight + 0.4
            );
            
            ctx.strokeStyle = 'rgba(50, 50, 50, 0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(
              Math.floor(x) - 0.1,
              Math.floor(y) - 0.1,
              fullWidth + 0.2,
              fullHeight + 0.2
            );
          } else {
            ctx.drawImage(
              img, 
              0, 0, 
              img.naturalWidth || 64, 
              img.naturalHeight || 64, 
              Math.floor(x) - 0.2,
              Math.floor(y) - 0.2,
              tileSize + 0.4,
              tileSize + 0.4
            );
            
            if (tile.type === 'custom_tile' || tile.type === 'grass' || tile.type === 'path') {
              const borderColor = tile.type === 'grass' || tile.type === 'custom_tile' ? 
                'rgba(26, 48, 0, 0.35)' : 'rgba(50, 40, 30, 0.35)';
              
              ctx.strokeStyle = borderColor;
              ctx.lineWidth = 0.25;
              ctx.strokeRect(
                Math.floor(x) - 0.1,
                Math.floor(y) - 0.1,
                tileSize + 0.2,
                tileSize + 0.2
              );
              
              if (tile.type === 'path') {
                ctx.strokeStyle = 'rgba(70, 60, 40, 0.15)';
                ctx.lineWidth = 0.2;
                ctx.strokeRect(
                  Math.floor(x),
                  Math.floor(y),
                  tileSize,
                  tileSize
                );
              }
            }
          }
          
          ctx.restore();
        }
      }
    });

    updateWaterTiles();
  }, [isLoading, mapTiles, tileSize, mapSize, tileImages, updateWaterTiles]);

  // Animation loop optimizat pentru water tiles
  useEffect(() => {
    renderMap();
    
    if (!hasWaterTiles) return;

    let lastRenderTime = 0;
    const renderThrottle = 100;

    const animate = (timestamp: number) => {
      if (timestamp - lastRenderTime >= renderThrottle) {
        updateWaterTiles();
        lastRenderTime = timestamp;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [hasWaterTiles, updateWaterTiles]);

  // Render the map (initial render and for non-animated tiles)
  useEffect(() => {
    if (!hasWaterTiles) {
      renderMap();
    }
  }, [renderMap, hasWaterTiles]);

  if (loadError) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center">
        <div className="bg-red-900 text-white p-4 rounded-lg">
          Failed to load map tiles. Using fallback rendering.
        </div>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pixel-perfect"
        style={{
          imageRendering: 'pixelated',
          zIndex: 5, // Redus z-index-ul de la 10 la 5 pentru a fi sub BuildingSystem
          width: mapSize.width + 'px',
          height: mapSize.height + 'px',
          backgroundColor: '#2a4000',
          willChange: 'transform',
          transform: 'translateZ(0)',
          boxShadow: '0 0 0 0.5px transparent',
          margin: '-0.25px',
          pointerEvents: 'none' // Adăugat pentru a permite click-urile să treacă prin canvas
        }}
      />
      {/* Container for animated water tiles */}
      <div
        ref={waterTilesContainerRef}
        className="absolute top-0 left-0"
        style={{
          zIndex: 6, // Redus z-index-ul de la 11 la 6 pentru a fi sub BuildingSystem dar peste tile-urile normale
          width: mapSize.width + 'px',
          height: mapSize.height + 'px',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translateZ(0)',
          contain: 'layout style paint'
        }}
      />
    </>
  );
};

export default TiledMap;