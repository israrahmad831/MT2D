import React from 'react';
import InventorySlot from '../slots/InventorySlot';
import { InventoryItem, Player } from '../../../types'; // Import Player type

interface InventoryGridProps {
  inventoryGrid: Array<{
    id: string;
    item: InventoryItem | undefined;
    isOccupied?: boolean;
  }>;
  dragOverSlot: string | null;
  onDragStart: (item: InventoryItem) => void;
  onDragOver: (e: React.DragEvent, slotId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, slotId: string) => void;
  onMouseEnter: (e: React.MouseEvent, item: InventoryItem) => void;
  onMouseLeave: () => void;
  isDraggingWindow: boolean;
  showDropConfirmation: boolean;
  onDeleteItem?: (id: string) => void;
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  onContextMenu?: (e: React.MouseEvent, item: InventoryItem) => void;
  player: Player; // Add this prop
}

const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventoryGrid,
  dragOverSlot,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onMouseEnter,
  onMouseLeave,
  isDraggingWindow,
  showDropConfirmation,
  onDeleteItem,
  inventory,
  setInventory,
  setPlayer,
  onContextMenu,
  player // Add this to the component props
}) => {
  return (
    <div 
      className="absolute grid grid-cols-5 gap-[2px] inventory-grid"
      style={{ 
        left: '27px',
        top: '280px',
        width: '145px',
        height: '120px',
        pointerEvents: isDraggingWindow || showDropConfirmation ? 'none' : 'auto'
      }}
    >
      {inventoryGrid.map(slot => (
        <InventorySlot
          key={slot.id}
          slot={slot}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isDragOver={dragOverSlot === slot.id}
          isOccupied={slot.isOccupied}
          onDeleteItem={onDeleteItem}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          onContextMenu={onContextMenu}
          player={player}
        />
      ))}
    </div>
  );
};

export default InventoryGrid;