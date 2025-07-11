import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, Player } from '../../../types';
import { GameItems } from '../../../items/GameItems';
import { generateId } from '../../../utils';
import { GemSlotSystem } from '../../../systems/gems/GemSlotSystem';
import { UpgradeSystem } from '../../../systems/upgrade/UpgradeSystem';
import { ChestManager } from '../../../systems/chest/ChestManager';
import { EquipmentStatsSystem } from '../../../systems/equipment/EquipmentStatsSystem';
import { SoundManager } from '../../../utils/SoundManager';

// Obfuscăm numele interfețelor și tipurilor
interface _0x1a2b3c {
  slot: {
    id: string;
    item: InventoryItem | undefined;
    isOccupied?: boolean;
    type?: 'weapon' | 'helmet' | 'armor' | 'boots' | 'necklace' | 'earring' | 'bracelet';
  };
  onDragStart: (item: InventoryItem) => void;
  onDragOver: (e: React.DragEvent, slotId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, slotId: string, item?: InventoryItem) => void;
  onMouseEnter: (e: React.MouseEvent, item: InventoryItem) => void;
  onMouseLeave: () => void;
  isDragOver: boolean;
  isOccupied?: boolean;
  isEquipmentSlot?: boolean;
  isFirstSlot?: boolean;
  slotCount?: number;
  customBackground?: string;
  onDeleteItem?: (id: string) => void;
  inventory?: InventoryItem[];
  setInventory?: (items: InventoryItem[]) => void;
  setPlayer?: (callback: (prev: any) => any) => void;
  setMapSelectionPosition?: (position: { x: number, y: number }) => void;
  setShowMapSelection?: (show: boolean) => void;
  onContextMenu?: (e: React.MouseEvent, item: InventoryItem) => void;
  player?: Player;
}

// Obfuscăm componenta InventorySlot
const _0x4c5d6e: React.FC<_0x1a2b3c> = ({
  slot,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onMouseEnter,
  onMouseLeave,
  isDragOver,
  isOccupied,
  isEquipmentSlot,
  isFirstSlot,
  slotCount,
  customBackground,
  onDeleteItem,
  inventory = [],
  setInventory,
  setPlayer,
  setMapSelectionPosition,
  setShowMapSelection,
  onContextMenu,
  player
}) => {
  // Obfuscăm numele stărilor
  const [_0x7f8g9h, _0x0i1j2k] = useState(false);
  const [_0x3l4m5n, _0x6o7p8q] = useState<NodeJS.Timeout | null>(null);
  const [_0x9r0s1t, _0x2u3v4w] = useState(false);
  const [_0x5x6y7z, _0x8a9b0c] = useState(false);
  const _0x1d2e3f = useRef<HTMLDivElement | null>(null);

  // Obfuscăm funcția pentru a obține fundalul slotului
  const _0x4g5h6i = () => {
    switch (slot.type) {
      case 'weapon':
        return '/assets/equipment/weapon-slot.png';
      case 'armor':
        return '/assets/equipment/armor-slot.png';
      case 'helmet':
        return '/assets/equipment/helmet-slot.png';
      case 'earring':
        return '/assets/equipment/earring-slot.png';
      case 'bracelet':
        return '/assets/equipment/bracelet-slot.png';
      case 'necklace':
        return '/assets/equipment/necklace-slot.png';
      default:
        return null;
    }
  };

  useEffect(() => {
    _0x1d2e3f.current = document.getElementById('chest-notifications') as HTMLDivElement;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        _0x2u3v4w(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        _0x2u3v4w(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (_0x5x6y7z) {
      const timer = setTimeout(() => {
        _0x8a9b0c(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [_0x5x6y7z]);

  // Obfuscăm funcția pentru afișarea notificărilor
  const _0x7j8k9l = (message: string, type: 'success' | 'error' = 'success') => {
    if (!_0x1d2e3f.current) return;

    const notification = document.createElement('div');
    notification.className = `bg-black bg-opacity-80 text-${type === 'error' ? 'red' : 'green'}-400 px-4 py-2 rounded text-sm animate-fadeIn pointer-events-auto`;
    notification.textContent = message;
    _0x1d2e3f.current.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('animate-fadeOut');
      setTimeout(() => {
        if (notification.parentNode === _0x1d2e3f.current) {
          _0x1d2e3f.current?.removeChild(notification);
        }
      }, 300);
    }, 2000);
  };

  // Obfuscăm funcția pentru a găsi primul slot gol
  const _0x0m1n2o = (newItem: InventoryItem): string | null => {
    const itemWidth = newItem.size?.width || 1;
    const itemHeight = newItem.size?.height || 1;
    const gridCols = 5;
    const totalSlots = 45;

    // First create a grid representation of occupied slots
    const occupiedGrid: boolean[][] = Array(Math.ceil(totalSlots / gridCols))
      .fill(false)
      .map(() => Array(gridCols).fill(false));
    
    // Mark all occupied slots including multi-slot items
    inventory.forEach(item => {
      // Ensure item has valid slotId
      if (!item || !item.slotId || typeof item.slotId !== 'string') return;
      
      if (item.slotId.startsWith('inv-')) {
        const slotIndex = parseInt(item.slotId.split('-')[1]);
        if (isNaN(slotIndex)) return;
        
        const row = Math.floor(slotIndex / gridCols);
        const col = slotIndex % gridCols;
        
        // Check bounds
        if (row >= occupiedGrid.length || col >= gridCols) return;
        
        // Mark the primary slot
        occupiedGrid[row][col] = true;
        
        // Mark additional slots for multi-slot items
        const width = item.size?.width || 1;
        const height = item.size?.height || 1;
        
        for (let h = 0; h < height; h++) {
          for (let w = 0; w < width; w++) {
            if (h === 0 && w === 0) continue; // Skip primary slot (already marked)
            
            const newRow = row + h;
            const newCol = col + w;
            
            // Check bounds
            if (newRow < occupiedGrid.length && newCol < gridCols) {
              occupiedGrid[newRow][newCol] = true;
            }
          }
        }
      }
    });
    
    // Now find a free spot that can accommodate the new item
    for (let row = 0; row < occupiedGrid.length; row++) {
      for (let col = 0; col < gridCols; col++) {
        // Skip if this slot is already occupied
        if (occupiedGrid[row][col]) continue;
        
        // Check if the item would fit here
        let canFit = true;
        
        for (let h = 0; h < itemHeight; h++) {
          for (let w = 0; w < itemWidth; w++) {
            const checkRow = row + h;
            const checkCol = col + w;
            
            // Check bounds and if slot is occupied
            if (
              checkRow >= occupiedGrid.length || 
              checkCol >= gridCols || 
              occupiedGrid[checkRow][checkCol]
            ) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }
        
        // If it fits, return the slot ID
        if (canFit) {
          const slotIndex = row * gridCols + col;
          return `inv-${slotIndex}`;
        }
      }
    }
    
    return null;
  };

  // Obfuscăm funcția pentru a găsi un slot stackable
  const _0x3p4q5r = (itemId: string): string | null => {
    for (let i = 0; i < 45; i++) {
      const slotId = `inv-${i}`;
      const existingItem = inventory.find(item => 
        item && 
        item.slotId === slotId && 
        item.id === itemId && 
        item.stackSize && 
        item.maxStack &&
        item.stackSize < item.maxStack
      );
      
      if (existingItem) {
        return slotId;
      }
    }
    return null;
  };

  // Obfuscăm funcția pentru a găsi primul slot de echipament gol
  const _0x6s7t8u = (type: string): string | null => {
    const slotMap: { [key: string]: string[] } = {
      weapon: ['equip-weapon-1'],
      armor: ['equip-armor-1'],
      helmet: ['equip-helmet'],
      earring: ['equip-earring'],
      bracelet: ['equip-bracelet'],
      necklace: ['equip-necklace']
    };

    // First, check if the same item ID is already equipped
    const itemId = slot.item?.id;
    if (itemId) {
      const alreadyEquippedInSlot = inventory.find(
        invItem => invItem && invItem.id === itemId && slotMap[type]?.includes(invItem.slotId || '')
      );
      
      if (alreadyEquippedInSlot) {
        // If this exact item is already equipped, return that slot to replace it
        return alreadyEquippedInSlot.slotId || null;
      }
    }

    // Otherwise, find the first empty slot
    const slots = slotMap[type] || [];
    for (const slotId of slots) {
      if (!inventory.some(item => item && item.slotId === slotId)) {
        return slotId;
      }
    }

    // If no empty slot, return the first slot for replacement
    return slots[0] || null;
  };

  // Obfuscăm funcția pentru a verifica cerințele de nivel
  const _0x9v0w1x = (item: InventoryItem): boolean => {
    if (!player || !item.requirements || !item.requirements.level) return true;
    return player.level >= item.requirements.level;
  };

  // Obfuscăm funcția pentru click dreapta
  const _0x2y3z4a = async (e: React.MouseEvent, item: InventoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Right-clicked item:", item.name, "in slot:", slot.id);

    // Basic validation
    if (!setInventory || !setPlayer) {
      console.error("Missing required props:", { setInventory: !!setInventory, setPlayer: !!setPlayer });
      return;
    }

    // Ensure item has valid slotId
    if (!item.slotId || typeof item.slotId !== 'string') {
      console.error("Item has invalid slotId:", item);
      return;
    }

    // HANDLE CHESTS FIRST - Move this check before other checks
    if (item.type === 'chest' || item.id === 'gold-piece') {
      console.log("Processing chest item:", item.id);
      
      const inventoryCopy = [...inventory];
      const result = ChestManager.openChest(item.id);
      
      if (!result.success) {
        _0x7j8k9l('Failed to open chest', 'error');
        return;
      }

      if (item.id === 'gold-piece' && result.yang) {
        setPlayer(prev => ({
          ...prev,
          yang: (prev.yang || 0) + result.yang
        }));

        const updatedInventory = inventoryCopy.map(invItem => {
          if (invItem && invItem.id === item.id && invItem.slotId === item.slotId) {
            const newStackSize = (invItem.stackSize || 1) - 1;
            return newStackSize > 0 ? { ...invItem, stackSize: newStackSize } : null;
          }
          return invItem;
        }).filter(Boolean) as InventoryItem[];

        setInventory(updatedInventory);
        _0x7j8k9l(`You got ${result.yang} Yang!`);
        return;
      }

      if (!result.loot) {
        _0x7j8k9l('Failed to open chest', 'error');
        return;
      }

      let updatedInventory = inventoryCopy.map(invItem => {
        if (invItem && invItem.id === item.id && invItem.slotId === item.slotId) {
          const newStackSize = (invItem.stackSize || 1) - 1;
          return newStackSize > 0 ? { ...invItem, stackSize: newStackSize } : null;
        }
        return invItem;
      }).filter(Boolean) as InventoryItem[];

      // Try to stack first for stackable items
      const stackableSlot = _0x3p4q5r(result.loot.id);
      if (stackableSlot) {
        updatedInventory = updatedInventory.map(invItem => {
          if (invItem && invItem.slotId === stackableSlot) {
            return {
              ...invItem,
              stackSize: (invItem.stackSize || 1) + 1
            };
          }
          return invItem;
        });
      } else {
        // Use the improved smart slot finding function that considers multi-slot items
        const emptySlot = _0x0m1n2o(result.loot);
        if (emptySlot) {
          updatedInventory.push({
            ...result.loot,
            slotId: emptySlot,
            stackSize: 1
          });
        } else {
          _0x7j8k9l('Inventory is full!', 'error');
          return;
        }
      }

      setInventory(updatedInventory);
      _0x7j8k9l(`You got: ${result.loot.name}!`);
      return;
    }
    
    // For teleport ring, ONLY use onContextMenu
    if (item.id === 'teleport-ring' && onContextMenu) {
      onContextMenu(e, item);
      return;
    }

    // Handle other context menu cases
    if (onContextMenu && !(slot.id.startsWith('equip-') || 
        item.type === 'weapon' || item.type === 'armor' || item.type === 'helmet' || 
        item.type === 'earring' || item.type === 'bracelet' || item.type === 'necklace')) {
      onContextMenu(e, item);
      return;
    }

    // Auto-equip logic for equipment items
    if (!slot.id.startsWith('equip-') && 
        (item.type === 'weapon' || item.type === 'armor' || item.type === 'helmet' || 
         item.type === 'earring' || item.type === 'bracelet' || item.type === 'necklace')) {
      
      // Check level requirement
      if (!_0x9v0w1x(item)) {
        _0x7j8k9l(`Level ${item.requirements?.level} required to equip this item!`, 'error');
        _0x8a9b0c(true);
        return;
      }
      
      // Find if same item type is already equipped in another slot
      const equippedItemsOfSameType = inventory.filter(
        invItem => invItem && 
        invItem.type === item.type && 
        invItem.slotId !== slot.id && 
        invItem.slotId && 
        invItem.slotId.startsWith('equip-')
      );
      
      if (equippedItemsOfSameType.length > 0) {
        console.log("Item of same type already equipped, swapping positions");
        
        // Get the first equipped item of this type
        const equippedItem = equippedItemsOfSameType[0];
        const equippedSlot = equippedItem.slotId;
        
        // IMPORTANT: Find the clicked item by its SLOT ID, not by item ID
        // This is crucial for identical items
        const clickedItemSlot = slot.id;
        
        // Create a deep copy to avoid reference issues
        let updatedInventory = JSON.parse(JSON.stringify(inventory));
        
        // Find indices of both items by their slot IDs - this is crucial for identical items
        const clickedItemIndex = updatedInventory.findIndex((i: InventoryItem) => i && i.slotId === clickedItemSlot);
        const equippedItemIndex = updatedInventory.findIndex((i: InventoryItem) => i && i.slotId === equippedSlot);
        
        if (clickedItemIndex !== -1 && equippedItemIndex !== -1) {
          console.log(`Swapping items at indices: ${clickedItemIndex} and ${equippedItemIndex}`);
          console.log(`From slots: ${updatedInventory[clickedItemIndex].slotId} to ${updatedInventory[equippedItemIndex].slotId}`);
          
          // Save the original slots
          const tempSlotId = updatedInventory[clickedItemIndex].slotId;
          
          // Swap the slots
          updatedInventory[clickedItemIndex].slotId = updatedInventory[equippedItemIndex].slotId;
          updatedInventory[equippedItemIndex].slotId = tempSlotId;
          
          console.log(`After swap: ${updatedInventory[clickedItemIndex].slotId} and ${updatedInventory[equippedItemIndex].slotId}`);
          
          // Play equip sound for both items
          SoundManager.playEquipSound();
          
          // Update inventory and player stats
          setInventory(updatedInventory);
          setPlayer(currentPlayer => {
            if (!currentPlayer) return currentPlayer;
            try {
              return EquipmentStatsSystem.applyEquipmentStats(currentPlayer, updatedInventory);
            } catch (error) {
              console.error("Error updating player stats:", error);
              return currentPlayer;
            }
          });
        } else {
          console.error("Failed to find items for swapping:", { 
            clickedSlot: clickedItemSlot, 
            equippedSlot: equippedSlot,
            clickedFound: clickedItemIndex !== -1,
            equippedFound: equippedItemIndex !== -1
          });
        }
        
        return;
      }
      
      console.log("Attempting to equip:", item.name, "of type:", item.type);
      
      // Check level requirement again
      if (!_0x9v0w1x(item)) {
        _0x7j8k9l(`Level ${item.requirements?.level} required to equip this item!`, 'error');
        _0x8a9b0c(true);
        return;
      }
      
      // Item is in inventory, move to equipment slot
      const targetSlotId = _0x6s7t8u(item.type);
      
      // Create a new updated inventory
      let updatedInventory = [...inventory];
      
      if (!targetSlotId) {
        console.log("No empty slot, replacing existing item");
        // If no empty slot, get the first slot of this type (for replacement)
        const slotMap: { [key: string]: string[] } = {
          weapon: ['equip-weapon-1'],
          armor: ['equip-armor-1'],
          helmet: ['equip-helmet'],
          earring: ['equip-earring'],
          bracelet: ['equip-bracelet'],
          necklace: ['equip-necklace']
        };
        const firstSlot = slotMap[item.type]?.[0];
        if (!firstSlot) return;
        
        // Find the item currently in that slot
        const existingEquippedItem = updatedInventory.find(i => i && i.slotId === firstSlot);
        if (!existingEquippedItem) {
          console.log("Expected equipped item, but none found");
          return;
        }
        
        console.log("Replacing equipped item:", existingEquippedItem.name);
        
        // Make deep copies to avoid reference issues
        const clickedItem = {...item};
        const equippedItem = {...existingEquippedItem};
        
        // Get the clicked item's current slot
        const clickedItemSlot = clickedItem.slotId;
        
        // Do a direct update rather than trying to find by ID
        updatedInventory = updatedInventory.map(invItem => {
          if (!invItem) return invItem;
          
          if (invItem.slotId === clickedItemSlot) {
            // This is the clicked item, move it to equipment
            return {
              ...invItem,
              slotId: firstSlot
            };
          } else if (invItem.slotId === firstSlot) {
            // This is the equipped item, move it to clicked item's slot
            return {
              ...invItem,
              slotId: clickedItemSlot
            };
          }
          return invItem;
        });
        
        console.log("Updated inventory after swap:", updatedInventory.map(i => i ? `${i.name} in ${i.slotId}` : 'null'));
      } else {
        console.log("Found empty slot:", targetSlotId);
        // Update the item's slot
        updatedInventory = updatedInventory.map(invItem => {
          if (!invItem) return invItem;
          
          if (invItem.id === item.id && invItem.slotId === slot.id) {
            return {
              ...invItem,
              slotId: targetSlotId
            };
          }
          return invItem;
        });
      }
      
      // Play equip sound
      SoundManager.playEquipSound();
      
      // Update the inventory first
      setInventory(updatedInventory);
      
      // Use callback pattern for updating player stats - more reliable
      setPlayer(currentPlayer => {
        if (!currentPlayer) return currentPlayer;
        try {
          return EquipmentStatsSystem.applyEquipmentStats(currentPlayer, updatedInventory);
        } catch (error) {
          console.error("Error updating player stats:", error);
          return currentPlayer;
        }
      });
      
      return;
    } else if (slot.id.startsWith('equip-')) {
      // Item is equipped, move to inventory
      const targetSlotId = _0x0m1n2o(item);
      if (!targetSlotId) return;
      
      // Create a new updated inventory
      let updatedInventory = [...inventory];
      
      // Find the item's index
      const itemIndex = updatedInventory.findIndex(i => i && i.id === item.id && i.slotId === slot.id);
      if (itemIndex === -1) return;
      
      // Update its slot
      updatedInventory[itemIndex] = {
        ...updatedInventory[itemIndex],
        slotId: targetSlotId
      };
      
      // Play equip sound (same sound for unequipping)
      SoundManager.playEquipSound();
      
      // Update the inventory first
      setInventory(updatedInventory);
      
      // Use callback pattern for updating player stats - more reliable
      setPlayer(currentPlayer => {
        if (!currentPlayer) return currentPlayer;
        try {
          return EquipmentStatsSystem.applyEquipmentStats(currentPlayer, updatedInventory);
        } catch (error) {
          console.error("Error updating player stats:", error);
          return currentPlayer;
        }
      });
      return;
    }
  };

  // Obfuscăm funcția pentru mouse down
  const _0x5b6c7d = (e: React.MouseEvent, item: InventoryItem) => {
    if (e.button === 0) {
      _0x0i1j2k(true);
      if (item.type === 'weapon' && !slot.id.startsWith('equip-')) {
        const timer = setTimeout(() => {
          if (_0x7f8g9h) {
            const targetSlotId = _0x6s7t8u('weapon');
            if (targetSlotId) {
              onDragStart(item);
              onDrop(e as unknown as React.DragEvent, targetSlotId, item);
            }
          }
        }, 500);
        _0x6o7p8q(timer);
      }
    }
  };

  // Obfuscăm funcția pentru mouse up
  const _0x8e9f0g = () => {
    _0x0i1j2k(false);
    if (_0x3l4m5n) {
      clearTimeout(_0x3l4m5n);
      _0x6o7p8q(null);
    }
  };

  // Obfuscăm funcția pentru drag start
  const _0x1h2i3j = (e: React.DragEvent<HTMLImageElement>, item: InventoryItem) => {
    // Check level requirement for equipment items
    if ((item.type === 'weapon' || item.type === 'armor') && 
        item.requirements?.level && player && 
        player.level < item.requirements.level) {
      e.preventDefault();
      _0x7j8k9l(`Level ${item.requirements.level} required to equip this item!`, 'error');
      _0x8a9b0c(true);
      return;
    }
    
    // Play pickup sound when starting to drag an item
    SoundManager.playItemPickupSound();
    
    if (item.stackSize && item.stackSize > 1 && _0x9r0s1t) {
      const halfStack = Math.ceil(item.stackSize / 2);
      const draggedItem = { ...item, stackSize: halfStack };
      onDragStart(draggedItem);
    } else {
      if (item.type === 'gem') {
        const singleItem = { ...item, stackSize: 1 };
        onDragStart(singleItem);
      } else {
        onDragStart(item);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (_0x3l4m5n) {
        clearTimeout(_0x3l4m5n);
      }
    };
  }, [_0x3l4m5n]);

  return (
    <div
      className={`bg-black bg-opacity-40 rounded-sm border border-[#3c1f1f] transition-colors duration-200 relative
        ${isDragOver ? 'bg-opacity-60' : ''}
        ${isOccupied ? 'pointer-events-none bg-opacity-20' : ''}
        ${isEquipmentSlot ? 'border-yellow-900' : ''}`}
      style={{
        width: '28px',
        height: '28px',
        position: 'relative'
      }}
      data-slot-id={slot.id}
      onDragOver={(e) => onDragOver(e, slot.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        // Play drop sound when item is dropped into slot
        SoundManager.playItemDropSound();
        onDrop(e, slot.id);
      }}
      onContextMenu={(e) => slot.item && _0x2y3z4a(e, slot.item)}
    >
      {isEquipmentSlot && !slot.item && isFirstSlot && _0x4g5h6i() && (
        <div
          className="absolute bg-contain bg-no-repeat opacity-50"
          style={{
            backgroundImage: `url(${_0x4g5h6i()})`,
            width: slot.type === 'weapon' ? '28px' : '28px',
            height: slot.type === 'weapon' ? '56px' : slotCount ? `${28 * slotCount}px` : '28px',
            backgroundSize: '100% 100%',
            left: '0',
            top: '0',
            zIndex: 1,
            imageRendering: 'pixelated'
          }}
        />
      )}
      
      {slot.item && (
        <>
          <img
            src={slot.item.icon}
            alt={slot.item.name}
            className="absolute inset-0 w-full h-full object-contain cursor-move inventory-item"
            style={{
              width: slot.item.size?.width ? `${slot.item.size.width * 28}px` : '28px',
              height: slot.item.size?.height ? `${slot.item.size.height * 28}px` : '28px',
              zIndex: 2
            }}
            draggable
            onDragStart={(e) => _0x1h2i3j(e, slot.item!)}
            onMouseEnter={(e) => onMouseEnter(e, slot.item!)}
            onMouseLeave={() => {
              onMouseLeave();
              _0x8e9f0g();
            }}
            onMouseDown={(e) => _0x5b6c7d(e, slot.item!)}
            onMouseUp={_0x8e9f0g}
            onContextMenu={(e) => _0x2y3z4a(e, slot.item!)}
          />
          {slot.item.stackSize && slot.item.stackSize > 1 && (
            <div 
              className="absolute bottom-0 right-0 text-[8px] text-yellow-400 bg-black bg-opacity-70 px-0.5 rounded-tl z-10 cursor-move"
              draggable
              onDragStart={(e) => _0x1h2i3j(e, slot.item!)}
              onMouseEnter={(e) => onMouseEnter(e, slot.item!)}
              onMouseLeave={onMouseLeave}
              onMouseDown={(e) => _0x5b6c7d(e, slot.item!)}
              onMouseUp={_0x8e9f0g}
              onContextMenu={(e) => _0x2y3z4a(e, slot.item!)}
            >
              x{slot.item.stackSize}
            </div>
          )}
        </>
      )}

      {/* Level requirement error notification */}
      {_0x5x6y7z && slot.item && slot.item.requirements?.level && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50">
          Level {slot.item.requirements.level} required!
        </div>
      )}
    </div>
  );
};

// Adăugăm cod mort pentru a face analiza statică mai dificilă
if (false) {
  const _0x3c4d5e = {
    calculateSlotPosition: (index: number, gridWidth: number) => {
      const row = Math.floor(index / gridWidth);
      const col = index % gridWidth;
      return { row, col };
    },
    isValidSlot: (row: number, col: number, gridWidth: number, gridHeight: number) => {
      return row >= 0 && row < gridHeight && col >= 0 && col < gridWidth;
    }
  };
  
  console.log(_0x3c4d5e.calculateSlotPosition(10, 5));
}

// Exportăm componenta cu numele original pentru compatibilitate
export default _0x4c5d6e;