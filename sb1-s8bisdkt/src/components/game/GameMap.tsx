import React, { useState, useEffect, memo, useRef } from 'react';
import TileLayer from './TileLayer';

interface GameMapProps {
  mapSize: {
    width: number;
    height: number;
  };
  currentMap: string;
  zoomLevel: number;
  cameraPosition: { x: number; y: number };
}

const GameMap: React.FC<GameMapProps> = ({ mapSize, currentMap, zoomLevel, cameraPosition }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentMapUrl, setCurrentMapUrl] = useState('');
  // Folosim un tile size mai mare pentru mai puține segmente
  const TILE_SIZE = 820; 
  
  const cameraRef = useRef({ x: 0, y: 0 });
  
  // URL-uri de calitate maximă pentru hărți
  const getMapUrl = (mapId: string): string => {
    switch(mapId) {
      case 'sohan':
        return "https://i.imgur.com/kB7Fgpe.png";
      case 'yogbi':
        return "https://i.imgur.com/YOddcME.png";
      case 'village':
        return "https://i.imgur.com/0m9WhiF.png";
      case 'map1':
      default:
        return "https://i.imgur.com/hO4ZwGt.png";
    }
  };

  useEffect(() => {
    const loadNewMap = async () => {
      setIsLoading(true);
      const mapUrl = getMapUrl(currentMap);
      
      // Preîncărcăm imaginea pentru a asigura disponibilitatea imediată
      const preloadImage = new Image();
      preloadImage.src = mapUrl;
      
      preloadImage.onload = () => {
        setCurrentMapUrl(mapUrl);
        setIsLoading(false);
      };
    };

    loadNewMap();
  }, [currentMap]);

  // Actualizăm referința la poziția camerei
  useEffect(() => {
    cameraRef.current = cameraPosition;
  }, [cameraPosition]);

  // Extindem zona vizibilă considerabil pentru a preveni orice artefacte
  const visibleArea = {
    startX: Math.max(0, cameraRef.current.x - TILE_SIZE * 2),
    startY: Math.max(0, cameraRef.current.y - TILE_SIZE * 2),
    endX: Math.min(mapSize.width, cameraRef.current.x + window.innerWidth / zoomLevel + TILE_SIZE * 2),
    endY: Math.min(mapSize.height, cameraRef.current.y + window.innerHeight / zoomLevel + TILE_SIZE * 2)
  };

  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#141414', overflow: 'hidden' }}>
      {isLoading ? (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading map...</div>
        </div>
      ) : (
        <>
          {/* Strategie hibridă: imagine completă de fundal + tiles pentru detalii */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${currentMapUrl})`,
              backgroundSize: `${mapSize.width}px ${mapSize.height}px`,
              backgroundPosition: '0 0',
              opacity: 0.8, // Ușor transparent pentru a se îmbina cu tile-urile
              filter: 'blur(0.5px) brightness(0.8) contrast(1.2)',
            }}
          />
          
          <TileLayer 
            mapUrl={currentMapUrl}
            mapSize={mapSize}
            tileSize={TILE_SIZE}
            visibleArea={visibleArea}
            zoomLevel={zoomLevel}
          />
          
          {/* Efecte de overlay pentru atmosferă */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
          
          <div 
            className="absolute inset-0"
            style={{
              animation: 'pulse 8s infinite alternate',
              background: 'radial-gradient(circle at 50% 50%, rgba(255,220,150,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}
    </div>
  );
};

export default memo(GameMap);