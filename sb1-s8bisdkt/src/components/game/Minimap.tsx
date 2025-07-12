// Minimap.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Player, Enemy } from "../../types";

interface MinimapProps {
  player: Player;
  enemies: Enemy[];
  currentMap: string;
  mapSize: { width: number; height: number };
  showFullMap: boolean;
  onToggleFullMap: () => void;
}

const Minimap: React.FC<MinimapProps> = ({
  player,
  enemies,
  currentMap,
  mapSize,
  showFullMap,
  onToggleFullMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullMapCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);

  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Responsive minimap size (clamp between 90px and 180px, based on both width and height)
  const MINIMAP_SIZE = Math.max(
    90,
    Math.min(
      200,
      Math.floor(Math.min(window.innerWidth * 0.12, window.innerHeight * 0.18))
    )
  );
  // Responsive full map frame size (square, clamp between 320px and 90vw/vh)
  const BASE_FRAME_SIZE = Math.max(
    320,
    Math.min(
      600,
      Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.7)
    )
  );
  const BASE_FRAME_WIDTH = BASE_FRAME_SIZE;
  const BASE_FRAME_HEIGHT = BASE_FRAME_SIZE;
  const ZOOM_AREA = 400;
  const CLICKABLE_AREA_SIZE = MINIMAP_SIZE + 15;

  const minimapMaskUrl = "https://i.imgur.com/Ft6FOho.png";

  // Calculate current frame dimensions (fixed at 100% scale)
  const currentFrameWidth = BASE_FRAME_WIDTH;
  const currentFrameHeight = BASE_FRAME_HEIGHT;
  // Responsive map canvas area inside the frame (square)
  const currentMapSize = Math.max(
    180,
    Math.floor((currentFrameWidth - 120) * 0.85)
  );
  const currentMapWidth = currentMapSize;
  const currentMapHeight = currentMapSize;

  // Center the full map on open and on resize
  useEffect(() => {
    if (showFullMap) {
      setMapPosition({
        x: Math.max(0, (window.innerWidth - currentFrameWidth) / 2),
        y: Math.max(0, (window.innerHeight - currentFrameHeight) / 2),
      });
    }
    // Listen for resize
    const handleResize = () => {
      if (showFullMap) {
        setMapPosition({
          x: Math.max(0, (window.innerWidth - currentFrameWidth) / 2),
          y: Math.max(0, (window.innerHeight - currentFrameHeight) / 2),
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showFullMap, currentFrameWidth, currentFrameHeight]);

  const getMapImageUrl = React.useCallback(() => {
    if (currentMap === "map1") return "https://i.imgur.com/dHuad2L.png";
    return null;
  }, [currentMap]);

  const getMapBackground = React.useCallback(() => {
    switch (currentMap) {
      case "sohan":
        return "#2d3748";
      case "yogbi":
        return "#d69e2e";
      case "village":
        return "#38a169";
      default:
        return "#38a169";
    }
  }, [currentMap]);

  const getMapName = () => {
    switch (currentMap) {
      case "sohan":
        return "Mount Sohan";
      case "yogbi":
        return "Yogbi Desert";
      case "village":
        return "Village";
      default:
        return "Seungryong Valley";
    }
  };

  const drawMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    const img = mapImageRef.current;
    if (currentMap === "map1" && img) {
      const scaleX = img.width / mapSize.width;
      const scaleY = img.height / mapSize.height;
      const srcX = (player.position.x - ZOOM_AREA / 2) * scaleX;
      const srcY = (player.position.y - ZOOM_AREA / 2) * scaleY;
      const srcW = ZOOM_AREA * scaleX;
      const srcH = ZOOM_AREA * scaleY;

      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcW,
        srcH,
        0,
        0,
        MINIMAP_SIZE,
        MINIMAP_SIZE
      );
    } else {
      ctx.fillStyle = getMapBackground();
      ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);
    }

    const scale = MINIMAP_SIZE / ZOOM_AREA;

    enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;
      const dx = enemy.position.x - player.position.x;
      const dy = enemy.position.y - player.position.y;
      if (Math.abs(dx) > ZOOM_AREA / 2 || Math.abs(dy) > ZOOM_AREA / 2) return;
      const x = MINIMAP_SIZE / 2 + dx * scale;
      const y = MINIMAP_SIZE / 2 + dy * scale;
      ctx.fillStyle = "#e53e3e";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#38a169";
    ctx.beginPath();
    ctx.arc(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    const dirLength = 8;
    ctx.strokeStyle = "#68d391";
    ctx.beginPath();
    ctx.moveTo(MINIMAP_SIZE / 2, MINIMAP_SIZE / 2);
    ctx.lineTo(
      MINIMAP_SIZE / 2 + player.direction.x * dirLength,
      MINIMAP_SIZE / 2 + player.direction.y * dirLength
    );
    ctx.stroke();
  }, [player, enemies, currentMap, mapSize, MINIMAP_SIZE, getMapBackground]);

  const drawFullMap = useCallback(() => {
    const canvas = fullMapCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, currentMapWidth, currentMapHeight);
    const img = mapImageRef.current;

    if (img) ctx.drawImage(img, 0, 0, currentMapWidth, currentMapHeight);
    else {
      ctx.fillStyle = getMapBackground();
      ctx.fillRect(0, 0, currentMapWidth, currentMapHeight);
    }

    const scaleX = currentMapWidth / mapSize.width;
    const scaleY = currentMapHeight / mapSize.height;

    enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;
      const x = enemy.position.x * scaleX;
      const y = enemy.position.y * scaleY;
      ctx.fillStyle = "#e53e3e";
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    const px = player.position.x * scaleX;
    const py = player.position.y * scaleY;
    ctx.fillStyle = "#38a169";
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    const dirLen = 20;
    ctx.strokeStyle = "#68d391";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + player.direction.x * dirLen,
      py + player.direction.y * dirLen
    );
    ctx.stroke();
  }, [
    player,
    enemies,
    mapSize,
    currentMapWidth,
    currentMapHeight,
    getMapBackground,
  ]);

  useEffect(() => {
    const url = getMapImageUrl();
    if (!url) {
      mapImageRef.current = null;
      return;
    }

    const img = new Image();
    img.src = url;
    img.onload = () => {
      mapImageRef.current = img;
      drawMinimap();
      if (showFullMap) drawFullMap();
    };
  }, [currentMap, drawMinimap, drawFullMap, showFullMap, getMapImageUrl]);

  useEffect(() => {
    drawMinimap();
  }, [drawMinimap]);

  useEffect(() => {
    if (showFullMap) drawFullMap();
  }, [showFullMap, drawFullMap]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset(mapPosition);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const newX = Math.max(
        0,
        Math.min(window.innerWidth - currentFrameWidth - 60, dragOffset.x + dx)
      );
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - currentFrameHeight - 120,
          dragOffset.y + dy
        )
      );
      setMapPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    dragStart,
    dragOffset,
    currentFrameWidth,
    currentFrameHeight,
  ]);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 cursor-pointer"
        style={{
          width: `${CLICKABLE_AREA_SIZE}px`,
          height: `${CLICKABLE_AREA_SIZE}px`,
          backgroundColor: "transparent",
        }}
        onClick={onToggleFullMap}
      />

      <div className="fixed top-1 left-2 z-40">
        <div
          className="relative"
          style={{
            width: `${MINIMAP_SIZE + 10}px`,
            height: `${MINIMAP_SIZE + 10}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            className="rounded-full absolute top-0 left-0 z-10"
            style={{
              imageRendering: "pixelated",
              width: `${MINIMAP_SIZE - 13}px`,
              height: `${MINIMAP_SIZE - 3}px`,
              maxWidth: "180px",
              maxHeight: "180px",
            }}
          />
          <img
            src={minimapMaskUrl}
            alt="minimap-ui"
            className="absolute top-0 left-0 z-20 w-full h-full pointer-events-none"
            style={{
              left: "-3px",
              width: `${MINIMAP_SIZE}px`,
              height: `${MINIMAP_SIZE}px`,
            }}
          />
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center z-30">
            <span className="text-white text-xs pixel-text bg-black bg-opacity-60 px-2 py-1 rounded">
              {getMapName()}
            </span>
          </div>
        </div>
      </div>

      {showFullMap && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute pointer-events-auto select-none"
            style={{
              left: mapPosition.x,
              top: mapPosition.y,
              width: currentFrameWidth,
              height: currentFrameHeight,
              maxWidth: "95vw",
              maxHeight: "90vh",
              minHeight: "400px",
              zIndex: 1000,
              cursor: isDragging ? "grabbing" : "grab",
              backgroundImage: "url(https://i.imgur.com/GzWkQp2.png)",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              imageRendering: "pixelated",
              transition: isDragging ? "none" : "all 0.2s ease-out",
              boxShadow: "0 4px 32px 0 rgba(0,0,0,0.4)",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
              <h2 className="text-yellow-400 font-bold pixel-text text-xl">
                {getMapName()}
              </h2>
              <p className="text-gray-400 pixel-text mt-2 text-sm">
                Press M or ESC to close
              </p>
            </div>

            <div
              className="absolute"
              style={{
                left: `${Math.max(40, Math.floor(currentFrameWidth * 0.16))}px`,
                top: `${Math.max(
                  140,
                  Math.floor(currentFrameHeight * 0.17)
                )}px`,
              }}
            >
              <canvas
                ref={fullMapCanvasRef}
                width={currentMapWidth}
                height={currentMapHeight}
                className="pointer-events-none"
                style={{
                  imageRendering: "pixelated",
                  width: `${currentMapWidth}px`,
                  height: `${currentMapHeight}px`,
                }}
              />
            </div>

            <div
              className="absolute left-1/2 transform -translate-x-1/2 flex justify-center gap-8"
              style={{
                bottom: "30px",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-green-500 rounded-full w-4 h-4"></div>
                <span className="text-white pixel-text text-sm">Player</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-red-500 rounded-full w-4 h-4"></div>
                <span className="text-white pixel-text text-sm">Enemies</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Minimap;
// This code defines a Minimap component that displays a minimap of the game world
