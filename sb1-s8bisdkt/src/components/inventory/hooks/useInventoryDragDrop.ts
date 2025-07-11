import { useEffect } from 'react';
import { Player, InventoryItem } from '../../../types';
import { EquipmentStatsSystem } from '../../../systems/equipment/EquipmentStatsSystem';

export function useInventoryDragDrop(
  isDraggingWindow: boolean,
  showDropConfirmation: boolean,
  dragStart: { x: number; y: number },
  windowOffset: { x: number; y: number },
  draggedItem: InventoryItem | null,
  setShowDropConfirmation: (show: boolean) => void,
  setDropPosition: (position: { x: number; y: number }) => void,
  setDraggedItem: (item: InventoryItem | null) => void,
  setIsDraggingWindow: (isDragging: boolean) => void,
  player: Player,
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
) {
  // Handle window dragging
  useEffect(() => {
    if (!isDraggingWindow || showDropConfirmation) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      
      const newX = Math.max(0, Math.min(window.innerWidth - 200, windowOffset.x + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 600, windowOffset.y + dy));
      
      setPlayer(prev => prev ? {
        ...prev,
        inventoryPosition: { x: newX, y: newY }
      } : null);
    };

    const handleMouseUp = () => {
      setIsDraggingWindow(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWindow, dragStart, windowOffset, showDropConfirmation, setPlayer, setIsDraggingWindow]);

  // Handle item dragging
  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      if (!draggedItem) return;

      const inventoryRect = document.querySelector('.inventory-grid')?.getBoundingClientRect();
      if (!inventoryRect) return;

      const isOutsideInventory = 
        e.clientX < inventoryRect.left ||
        e.clientX > inventoryRect.right ||
        e.clientY < inventoryRect.top ||
        e.clientY > inventoryRect.bottom;

      if (isOutsideInventory) {
        e.preventDefault();
        const dragEndEvent = new Event('dragend');
        document.dispatchEvent(dragEndEvent);
        
        setDropPosition({ x: e.clientX, y: e.clientY });
        setShowDropConfirmation(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (draggedItem) {
        e.preventDefault();
      }
    };

    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragOver);

    return () => {
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [draggedItem, setDropPosition, setShowDropConfirmation]);
}