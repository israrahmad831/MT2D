import React, { memo, useState, useEffect } from 'react';

interface TileLayerProps {
  mapUrl: string;
  mapSize: { width: number; height: number };
  tileSize: number;
  visibleArea: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  zoomLevel: number;
}

const TileLayer: React.FC<TileLayerProps> = ({ 
  mapUrl, 
  mapSize, 
  tileSize,
  visibleArea,
  zoomLevel 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullMapImage, setFullMapImage] = useState<HTMLImageElement | null>(null);
  
  // Încarcă imaginea completă la inițializare pentru o referință precisă a culorilor
  useEffect(() => {
    const img = new Image();
    img.src = mapUrl;
    img.onload = () => {
      setFullMapImage(img);
      setImageLoaded(true);
    };
  }, [mapUrl]);

  // Calculăm ce tile-uri trebuie afișate
  const visibleTiles = [];
  
  const startTileX = Math.floor(visibleArea.startX / tileSize);
  const startTileY = Math.floor(visibleArea.startY / tileSize);
  const endTileX = Math.ceil(visibleArea.endX / tileSize);
  const endTileY = Math.ceil(visibleArea.endY / tileSize);
  
  for (let y = startTileY; y <= endTileY; y++) {
    for (let x = startTileX; x <= endTileX; x++) {
      if (x >= 0 && y >= 0 && x * tileSize < mapSize.width && y * tileSize < mapSize.height) {
        visibleTiles.push({ x, y });
      }
    }
  }

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#141414' }}>
      {/* Imagine de fundal completă pentru viewport-uri mici */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${mapUrl})`,
          backgroundSize: `${mapSize.width}px ${mapSize.height}px`,
          backgroundPosition: '0 0',
          opacity: 1,
          imageRendering: 'auto',
          filter: 'brightness(0.9) contrast(1.5) saturate(0.9)',
        }}
      />
      
      {/* Tiles individuale suprapuse peste imaginea completă */}
      {visibleTiles.map(tile => (
        <div
          key={`${tile.x}_${tile.y}`}
          style={{
            position: 'absolute',
            left: tile.x * tileSize - 2, // 2px offset pentru suprapunere
            top: tile.y * tileSize - 2, // 2px offset pentru suprapunere
            width: tileSize + 4, // 4px extra (2px pe fiecare parte)
            height: tileSize + 4, // 4px extra (2px pe fiecare parte)
            backgroundImage: `url(${mapUrl})`,
            backgroundPosition: `-${tile.x * tileSize}px -${tile.y * tileSize}px`,
            backgroundSize: `${mapSize.width}px ${mapSize.height}px`,
            imageRendering: 'auto',
            filter: 'brightness(0.9) contrast(1.5) saturate(0.9)',
            // Efect subtil de blur pentru margini pentru a elimina liniile
            boxShadow: 'inset 0 0 1px rgba(0,0,0,0.1)',
            // Hardware acceleration
            transform: 'translateZ(0)',
            // Eliminare aliasing
            willChange: 'transform',
            // Prioritizare pentru randare
            zIndex: 1
          }}
        />
      ))}
    </div>
  );
};

export default memo(TileLayer);