import { useState, useEffect } from 'react';
import { Player, InventoryItem, DroppedItem } from '../../../types';

export function useInventoryState(
  player: Player,
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
) {
  const [draggedItem, setDraggedItem] = useState<InventoryItem | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [tooltipItem, setTooltipItem] = useState<InventoryItem | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [windowOffset, setWindowOffset] = useState({ x: 0, y: 0 });
  const [showDropConfirmation, setShowDropConfirmation] = useState(false);
  const [dropPosition, setDropPosition] = useState({ x: 0, y: 0 });

  // Load saved inventory position
  useEffect(() => {
    if (player?.id) {
      const savedPosition = localStorage.getItem(`inventory_position_${player.id}`);
      if (savedPosition) {
        try {
          const position = JSON.parse(savedPosition);
          setPlayer(prev => prev ? {
            ...prev,
            inventoryPosition: position
          } : null);
        } catch (e) {
          console.error('Error loading inventory position:', e);
        }
      }
    }
  }, [player?.id, setPlayer]);

  // Save inventory position
  useEffect(() => {
    if (player?.id && player.inventoryPosition) {
      localStorage.setItem(
        `inventory_position_${player.id}`, 
        JSON.stringify(player.inventoryPosition)
      );
    }
  }, [player?.id, player?.inventoryPosition]);

  return {
    draggedItem,
    setDraggedItem,
    dragOverSlot,
    setDragOverSlot,
    tooltipItem,
    setTooltipItem,
    tooltipPosition,
    setTooltipPosition,
    isDraggingWindow,
    setIsDraggingWindow,
    dragStart,
    setDragStart,
    windowOffset,
    setWindowOffset,
    showDropConfirmation,
    setShowDropConfirmation,
    dropPosition,
    setDropPosition
  };
}