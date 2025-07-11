import React from 'react';
import InventorySlot from '../slots/InventorySlot';
import { InventoryItem, Player } from '../../../types'; // Update import

interface EquipmentSlotsProps {
  equipmentSlots: Array<{
    id: string;
    type?: 'weapon' | 'helmet' | 'armor' | 'boots' | 'necklace' | 'earring' | 'bracelet';
    item: InventoryItem | undefined;
  }>;
  dragOverSlot: string | null;
  onDragStart: (item: InventoryItem) => void;
  onDragOver: (e: React.DragEvent, slotId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, slotId: string) => void;
  onMouseEnter: (e: React.MouseEvent, item: InventoryItem) => void;
  onMouseLeave: () => void;
  isDragOver: boolean;
  isOccupied?: boolean;
  isEquipmentSlot?: boolean;
  isFirstSlot?: boolean;
  slotCount?: number;
  customBackground?: string;
  onDeleteItem?: (id: string) => void;
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  player: Player; // Add this prop
  onContextMenu?: (e: React.MouseEvent, item: InventoryItem) => void;
}

const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({
  equipmentSlots,
  dragOverSlot,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onMouseEnter,
  onMouseLeave,
  onDeleteItem,
  inventory,
  setInventory,
  setPlayer,
  player,
  onContextMenu
}) => {
  return (
    <div className="absolute" style={{ left: '57px', top: '80px' }}>
      {/* Weapon slot (only one slot now) */}
      <div className="absolute" style={{ left: '0px', top: '0px' }}>
        <InventorySlot
          key="weapon-1"
          slot={equipmentSlots[0]}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isDragOver={dragOverSlot === equipmentSlots[0].id}
          isEquipmentSlot={true}
          isFirstSlot={true}
          slotCount={1}
          onDeleteItem={onDeleteItem}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          player={player}
          onContextMenu={onContextMenu}
        />
      </div>

      {/* Helmet slot */}
      <div className="absolute" style={{ left: '40px', top: '-20px' }}>
        <InventorySlot
          slot={equipmentSlots[2]}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isDragOver={dragOverSlot === equipmentSlots[2].id}
          isEquipmentSlot={true}
          isFirstSlot={true}
          onDeleteItem={onDeleteItem}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          player={player}
          onContextMenu={onContextMenu}
        />
      </div>

      {/* Armor slot (only one slot now) - moved higher */}
      <div className="absolute" style={{ left: '40px', top: '10px' }}>
        <InventorySlot
          key="armor-1"
          slot={equipmentSlots[3]}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          isDragOver={dragOverSlot === equipmentSlots[3].id}
          isEquipmentSlot={true}
          isFirstSlot={true}
          slotCount={1}
          customBackground="https://i.imgur.com/xROMeeq.png"
          onDeleteItem={onDeleteItem}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          player={player}
          onContextMenu={onContextMenu}
        />
      </div>

      {/* Accessories (vertical column on the right) */}
      <div className="flex flex-col gap-1 absolute" style={{ left: '80px', top: '10px' }}>
        {[5, 6, 7].map((index) => (
          <InventorySlot
            key={`accessory-${index}`}
            slot={equipmentSlots[index]}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            isDragOver={dragOverSlot === equipmentSlots[index].id}
            isEquipmentSlot={true}
            isFirstSlot={true}
            onDeleteItem={onDeleteItem}
            inventory={inventory}
            setInventory={setInventory}
            setPlayer={setPlayer}
            player={player}
            onContextMenu={onContextMenu}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentSlots;