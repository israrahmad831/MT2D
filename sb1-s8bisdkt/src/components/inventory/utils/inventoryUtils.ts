import { InventoryItem } from '../../../types';

export const formatYang = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toString();
};

export const canDropItem = (
  item: InventoryItem,
  targetSlotId: string,
  inventory: InventoryItem[],
  draggedItem: InventoryItem
): boolean => {
  // Validate item and slotId
  if (!item || !item.slotId || typeof item.slotId !== 'string') {
    console.warn('Invalid item or slotId in canDropItem:', item);
    return false;
  }

  if (!targetSlotId || typeof targetSlotId !== 'string') {
    console.warn('Invalid targetSlotId in canDropItem:', targetSlotId);
    return false;
  }

  // Equipment slot validation
  if (targetSlotId.startsWith('equip-')) {
    const [, equipType] = targetSlotId.split('-');
    return item.type === equipType;
  }

  // Inventory slot validation
  if (targetSlotId.startsWith('inv-')) {
    const targetSlotIndex = parseInt(targetSlotId.split('-')[1]);
    if (isNaN(targetSlotIndex)) return false;

    const itemWidth = item.size?.width || 1;
    const itemHeight = item.size?.height || 1;
    const gridCols = 5;
    const totalSlots = 45;

    const targetRow = Math.floor(targetSlotIndex / gridCols);
    const targetCol = targetSlotIndex % gridCols;

    // Check if item fits within grid bounds
    if (targetRow + itemHeight > Math.ceil(totalSlots / gridCols) || 
        targetCol + itemWidth > gridCols) {
      return false;
    }

    // Check for collisions with other items
    for (let h = 0; h < itemHeight; h++) {
      for (let w = 0; w < itemWidth; w++) {
        const checkRow = targetRow + h;
        const checkCol = targetCol + w;
        const checkSlotIndex = checkRow * gridCols + checkCol;
        const checkSlotId = `inv-${checkSlotIndex}`;

        const existingItem = inventory.find(invItem => 
          invItem && 
          invItem.slotId === checkSlotId && 
          invItem.id !== draggedItem.id
        );

        if (existingItem) {
          // Allow stacking for same items
          if (existingItem.id === item.id && 
              existingItem.stackSize && 
              item.stackSize &&
              existingItem.maxStack &&
              existingItem.stackSize < existingItem.maxStack) {
            continue;
          }
          return false;
        }
      }
    }
  }

  return true;
};

export const getInventoryGrid = (inventory: InventoryItem[]) => {
  const grid = [];
  
  for (let i = 0; i < 45; i++) {
    const slotId = `inv-${i}`;
    const item = inventory.find(invItem => 
      invItem && 
      invItem.slotId === slotId
    );
    
    // Check if this slot is occupied by a multi-slot item
    let isOccupied = false;
    if (!item) {
      for (const invItem of inventory) {
        // Add typeof check to ensure slotId is a string
        if (!invItem || !invItem.slotId || typeof invItem.slotId !== 'string' || !invItem.slotId.startsWith('inv-')) continue;
        
        const itemSlotIndex = parseInt(invItem.slotId.split('-')[1]);
        if (isNaN(itemSlotIndex)) continue;
        
        const itemWidth = invItem.size?.width || 1;
        const itemHeight = invItem.size?.height || 1;
        const gridCols = 5;
        
        const itemRow = Math.floor(itemSlotIndex / gridCols);
        const itemCol = itemSlotIndex % gridCols;
        const currentRow = Math.floor(i / gridCols);
        const currentCol = i % gridCols;
        
        // Check if current slot is within the item's area
        if (currentRow >= itemRow && 
            currentRow < itemRow + itemHeight &&
            currentCol >= itemCol && 
            currentCol < itemCol + itemWidth &&
            itemSlotIndex !== i) {
          isOccupied = true;
          break;
        }
      }
    }
    
    grid.push({
      id: slotId,
      item,
      isOccupied
    });
  }
  
  return grid;
};

export const getEquipmentSlots = (inventory: InventoryItem[]) => {
  const equipmentSlots = [
    { id: 'equip-weapon-1', type: 'weapon' as const },
    { id: 'equip-weapon-2', type: 'weapon' as const },
    { id: 'equip-armor-1', type: 'armor' as const },
    { id: 'equip-armor-2', type: 'armor' as const },
    { id: 'equip-helmet', type: 'helmet' as const },
    { id: 'equip-earring', type: 'earring' as const },
    { id: 'equip-bracelet', type: 'bracelet' as const },
    { id: 'equip-necklace', type: 'necklace' as const }
  ];

  return equipmentSlots.map(slot => ({
    ...slot,
    item: inventory.find(item => 
      item && 
      item.slotId === slot.id
    )
  }));
};