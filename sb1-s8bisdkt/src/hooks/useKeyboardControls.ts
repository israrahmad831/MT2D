import { useRef, useEffect, useCallback } from 'react';
import { Player } from '../types';

export const useKeyboardControls = (
  player: Player,
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
  setShowHitbox: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const keyElementsRef = useRef<{ [key: string]: HTMLDivElement }>({});

  // Memoize key handlers
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle movement and space keys here, not UI toggles
    if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
      e.preventDefault();
      
      keysRef.current[e.key.toLowerCase()] = true;
      
      const keyElement = keyElementsRef.current[e.key.toLowerCase()];
      if (keyElement) {
        keyElement.setAttribute('data-pressed', 'true');
      }
      
      if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
        const newDirection = { ...player.direction };
        
        if (e.key.toLowerCase() === 'w') newDirection.y = -1;
        if (e.key.toLowerCase() === 's') newDirection.y = 1;
        if (e.key.toLowerCase() === 'a') newDirection.x = -1;
        if (e.key.toLowerCase() === 'd') newDirection.x = 1;
        
        const magnitude = Math.sqrt(newDirection.x * newDirection.x + newDirection.y * newDirection.y);
        if (magnitude > 0) {
          newDirection.x /= magnitude;
          newDirection.y /= magnitude;
        }
        
        setPlayer(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            direction: newDirection
          };
        });
      }
    } else if (e.key === 'h') {
      setShowHitbox(prev => !prev);
    }
  }, [player.direction, setPlayer, setShowHitbox]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (['w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
      keysRef.current[e.key.toLowerCase()] = false;
      
      const keyElement = keyElementsRef.current[e.key.toLowerCase()];
      if (keyElement) {
        keyElement.setAttribute('data-pressed', 'false');
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Create hidden elements for key tracking
    ['w', 'a', 's', 'd', ' '].forEach(key => {
      if (!keyElementsRef.current[key]) {
        const keyElement = document.createElement('div');
        keyElement.style.display = 'none';
        keyElement.setAttribute('data-key', key);
        keyElement.setAttribute('data-pressed', 'false');
        document.body.appendChild(keyElement);
        keyElementsRef.current[key] = keyElement;
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Clean up key tracking elements
      Object.values(keyElementsRef.current).forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      keyElementsRef.current = {};
    };
  }, [handleKeyDown, handleKeyUp]);

  return keysRef.current;
};