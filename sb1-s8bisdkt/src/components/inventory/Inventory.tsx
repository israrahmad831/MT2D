import React, { memo, useState, useEffect } from 'react';
import { Player, InventoryItem, DroppedItem } from '../../types';
import ItemTooltip from './ItemTooltip';
import DropConfirmation from './DropConfirmation';
import EquipmentSlots from './equipment/EquipmentSlots';
import InventoryGrid from './grid/InventoryGrid';
import UpgradeConfirmation from '../upgrade/UpgradeConfirmation';
import UpgradeResultNotification from '../upgrade/UpgradeResultNotification';
import GemSlotConfirmation from './GemSlotConfirmation';
import GemConfirmation from './GemConfirmation';
import TeleportAnimation from './TeleportAnimation';
import { EquipmentStatsSystem } from '../../systems/equipment/EquipmentStatsSystem';
import { useInventoryState } from './hooks/useInventoryState';
import { useInventoryDragDrop } from './hooks/useInventoryDragDrop';
import { useInventoryHandlers } from './hooks/useInventoryHandlers';
import { formatYang, canDropItem, getInventoryGrid, getEquipmentSlots } from './utils/inventoryUtils';
import { UpgradeSystem } from '../../systems/upgrade/UpgradeSystem';
import { GemSlotSystem } from '../../systems/gems/GemSlotSystem';
import MapSelectionWindow from './MapSelectionWindow';
import Preloader from '../Preloader';
import { SoundManager } from '../../utils/SoundManager';

interface InventoryProps {
  player: Player;
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>;
  isOpen: boolean;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  droppedItems?: DroppedItem[];
  setDroppedItems?: React.Dispatch<React.SetStateAction<DroppedItem[]>>;
  onMapSelect?: (mapName: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ 
  player, 
  setPlayer,
  isOpen, 
  inventory = [], 
  setInventory,
  droppedItems,
  setDroppedItems,
  onMapSelect
}) => {
  const [upgradeItem, setUpgradeItem] = useState<{
    item: InventoryItem;
    scrollId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  const [upgradeResult, setUpgradeResult] = useState<{
    success: boolean;
    item: InventoryItem;
  } | null>(null);
  
  const [gemSlotItem, setGemSlotItem] = useState<{
    item: InventoryItem;
    gemId: string;
    position: { x: number; y: number };
  } | null>(null);
  
  const [gemConfirmation, setGemConfirmation] = useState<{
    item: InventoryItem;
    gem: InventoryItem;
    position: { x: number; y: number };
  } | null>(null);

  const [showMapSelection, setShowMapSelection] = useState(false);
  const [mapSelectionPosition, setMapSelectionPosition] = useState({ x: 0, y: 0 });
  const [showTeleportAnimation, setShowTeleportAnimation] = useState(false);
  const [pendingMapSelection, setPendingMapSelection] = useState<string | null>(null);
  const [showMapPreloader, setShowMapPreloader] = useState(false);

  const {
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
  } = useInventoryState(player, setPlayer);

  useInventoryDragDrop(
    isDraggingWindow,
    showDropConfirmation,
    dragStart,
    windowOffset,
    draggedItem,
    setShowDropConfirmation,
    setDropPosition,
    setDraggedItem,
    setIsDraggingWindow,
    player,
    setPlayer
  );

  const { handleSpecialItems } = useInventoryHandlers(
    player,
    setPlayer,
    inventory,
    setInventory,
    setUpgradeItem,
    setGemSlotItem,
    setGemConfirmation,
    setDraggedItem
  );

  // Play window open/close sounds when inventory opens/closes
  useEffect(() => {
    if (isOpen) {
      SoundManager.playWindowOpenSound();
    } else {
      SoundManager.playWindowCloseSound();
    }
  }, [isOpen]);

  const removeItemFromInventory = (itemId: string) => {
    setInventory(prev => {
      const newInventory = prev.filter(item => item.id !== itemId);
      
      // If the item was equipped, update player stats
      const wasEquipped = prev.find(item => item.id === itemId)?.slotId.startsWith('equip-');
      if (wasEquipped) {
        const updatedPlayer = EquipmentStatsSystem.applyEquipmentStats(player, newInventory);
        setPlayer(updatedPlayer);
      }
      
      return newInventory;
    });
  };

  const handleMapSelect = (mapName: string) => {
    setShowMapSelection(false);
    setPendingMapSelection(mapName);
    
    // Disable player controls immediately
    setPlayer(prev => prev ? { ...prev, controlsDisabled: true } : null);
    
    // Start teleport animation
    setShowTeleportAnimation(true);
  };

  const handleTeleportComplete = () => {
    setShowTeleportAnimation(false);
    setShowMapPreloader(true);
  };

  const handleMapLoadComplete = () => {
    setShowMapPreloader(false);
    
    if (pendingMapSelection && onMapSelect) {
      onMapSelect(pendingMapSelection);
    }
    
    // Re-enable player controls after a small delay to ensure everything is loaded
    setTimeout(() => {
      setPlayer(prev => prev ? { ...prev, controlsDisabled: false } : null);
    }, 100);
    
    setPendingMapSelection(null);
  };

  if (!isOpen) return null;

  const inventoryGrid = getInventoryGrid(inventory);
  const equipmentSlots = getEquipmentSlots(inventory);

  const handleDragStart = (item: InventoryItem) => {
    if (showDropConfirmation) return;
    setDraggedItem(item);
    setTooltipItem(null);
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    if (showDropConfirmation) return;
    e.preventDefault();
    setDragOverSlot(slotId);
  };

  const handleDragLeave = () => {
    if (showDropConfirmation) return;
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, targetSlotId: string, droppedItem?: InventoryItem) => {
    e.preventDefault();
    setDragOverSlot(null);

    const itemToHandle = droppedItem || draggedItem;
    if (!itemToHandle || !Array.isArray(inventory)) return;

    // If dropping on the same slot, do nothing
    if (itemToHandle.slotId === targetSlotId) {
      setDraggedItem(null);
      return;
    }

    // Check level requirements for equipment slots
    if (targetSlotId.startsWith('equip-')) {
      const itemRequiredLevel = itemToHandle.requirements?.level || 0;
      if (itemRequiredLevel > player.level) {
        // Show error notification
        const notificationsContainer = document.getElementById('chest-notifications');
        if (notificationsContainer) {
          const notification = document.createElement('div');
          notification.className = 'bg-black bg-opacity-80 text-red-400 px-4 py-2 rounded text-sm animate-fadeIn';
          notification.textContent = `Level ${itemRequiredLevel} required to equip this item!`;
          notificationsContainer.appendChild(notification);

          setTimeout(() => {
            notification.classList.add('animate-fadeOut');
            setTimeout(() => {
              if (notification.parentNode === notificationsContainer) {
                notificationsContainer.removeChild(notification);
              }
            }, 300);
          }, 2000);
        }
        
        setDraggedItem(null);
        return;
      }
    }

    // Handle special items first (including teleport ring)
    if (handleSpecialItems(itemToHandle, targetSlotId, e)) return;

    if (!canDropItem(itemToHandle, targetSlotId, inventory, itemToHandle)) {
      return;
    }

    const updatedInventory = [...inventory];
    const draggedItemIndex = updatedInventory.findIndex(item => item.id === itemToHandle.id);
    const targetItem = updatedInventory.find(item => item.slotId === targetSlotId);

    if (draggedItemIndex === -1 && !droppedItem) return;

    // Handle stacking for stackable items
    if (targetItem && itemToHandle.stackSize && targetItem.stackSize && targetItem.id === itemToHandle.id) {
      const totalStack = targetItem.stackSize + (itemToHandle.stackSize || 1);
      const maxStack = targetItem.maxStack || 50;

      if (totalStack <= maxStack) {
        // Can fit entire stack
        targetItem.stackSize = totalStack;
        if (draggedItemIndex !== -1) {
          updatedInventory.splice(draggedItemIndex, 1);
        }
      } else {
        // Split stack
        targetItem.stackSize = maxStack;
        const remainingStack = totalStack - maxStack;
        
        if (draggedItemIndex !== -1) {
          updatedInventory[draggedItemIndex] = {
            ...itemToHandle,
            stackSize: remainingStack
          };
        } else {
          // Find first empty slot for remaining stack
          const emptySlot = inventoryGrid.find(slot => !slot.item && !slot.isOccupied);
          if (emptySlot) {
            updatedInventory.push({
              ...itemToHandle,
              slotId: emptySlot.id,
              stackSize: remainingStack
            });
          }
        }
      }
    } else {
      // Handle equipment slot swapping
      if (targetSlotId.startsWith('equip-')) {
        const [, equipType, slotNumber] = targetSlotId.split('-');
        
        if (itemToHandle.type !== equipType) {
          return;
        }

        // Check level requirement
        const itemRequiredLevel = itemToHandle.requirements?.level || 0;
        if (itemRequiredLevel > player.level) {
          return;
        }

        if (targetItem) {
          const oldSlotId = itemToHandle.slotId;
          if (draggedItemIndex !== -1) {
            updatedInventory[draggedItemIndex] = {
              ...itemToHandle,
              slotId: targetSlotId
            };
          } else {
            updatedInventory.push({
              ...itemToHandle,
              slotId: targetSlotId
            });
          }

          const targetItemIndex = updatedInventory.findIndex(item => item.id === targetItem.id);
          if (targetItemIndex !== -1) {
            updatedInventory[targetItemIndex] = {
              ...targetItem,
              slotId: oldSlotId
            };
          }
        } else {
          if (draggedItemIndex !== -1) {
            updatedInventory[draggedItemIndex] = {
              ...itemToHandle,
              slotId: targetSlotId
            };
          } else {
            updatedInventory.push({
              ...itemToHandle,
              slotId: targetSlotId
            });
          }
        }
      } else {
        if (targetItem) {
          if (canDropItem(targetItem, itemToHandle.slotId, inventory, itemToHandle)) {
            const oldSlotId = itemToHandle.slotId;
            if (draggedItemIndex !== -1) {
              updatedInventory[draggedItemIndex] = {
                ...itemToHandle,
                slotId: targetSlotId
              };
            } else {
              updatedInventory.push({
                ...itemToHandle,
                slotId: targetSlotId
              });
            }

            const targetItemIndex = updatedInventory.findIndex(item => item.id === targetItem.id);
            if (targetItemIndex !== -1) {
              updatedInventory[targetItemIndex] = {
                ...targetItem,
                slotId: oldSlotId
              };
            }
          }
        } else {
          if (draggedItemIndex !== -1) {
            updatedInventory[draggedItemIndex] = {
              ...itemToHandle,
              slotId: targetSlotId
            };
          } else {
            updatedInventory.push({
              ...itemToHandle,
              slotId: targetSlotId
            });
          }
        }
      }
    }

    const updatedPlayer = EquipmentStatsSystem.applyEquipmentStats(player, updatedInventory);
    setPlayer(prev => prev ? updatedPlayer : prev);
    setInventory(updatedInventory);
    setDraggedItem(null);
  };

  const handleMouseEnter = (e: React.MouseEvent, item: InventoryItem) => {
    if (showDropConfirmation) return;
    setTooltipItem(item);
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    if (showDropConfirmation) return;
    setTooltipItem(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (showDropConfirmation) return;
    if ((e.target as HTMLElement).classList.contains('inventory-background')) {
      e.preventDefault();
      setIsDraggingWindow(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setWindowOffset(player.inventoryPosition);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: InventoryItem) => {
    e.preventDefault();
    if (item.id === 'teleport-ring') {
      setShowMapSelection(true);
      setMapSelectionPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDestroy = () => {
    if (!draggedItem) return;

    // Create a copy of the current inventory
    const updatedInventory = inventory.filter(item => item.id !== draggedItem.id);

    // If the item was equipped, update player stats
    if (draggedItem.slotId.startsWith('equip-')) {
      const updatedPlayer = EquipmentStatsSystem.applyEquipmentStats(player, updatedInventory);
      setPlayer(updatedPlayer);
    }

    // Update inventory with the item removed
    setInventory(updatedInventory);
    setShowDropConfirmation(false);
    setDraggedItem(null);
  };

  const handleUpgradeConfirm = () => {
    if (!upgradeItem) return;

    const { success, newItem, cost, newYang, newInventory } = UpgradeSystem.tryUpgrade(
      upgradeItem.item,
      player.yang,
      inventory
    );

    if (newItem) {
      const updatedInventory = newInventory.map(item =>
        item.slotId === upgradeItem.item.slotId ? newItem : item
      );

      setInventory(updatedInventory);
      setPlayer(prev => {
        if (!prev) return prev;
        const updatedPlayer = {
          ...prev,
          yang: newYang
        };
        return EquipmentStatsSystem.applyEquipmentStats(updatedPlayer, updatedInventory);
      });

      setUpgradeResult({ success, item: newItem });
      
      // Play upgrade sound based on success/failure
      if (success) {
        SoundManager.playUpgradeSuccessSound();
      } else {
        SoundManager.playUpgradeFailSound();
      }
    }

    setUpgradeItem(null);
  };

  const handleGemSlotConfirm = () => {
    if (!gemSlotItem) return;

    const { success, newItem } = GemSlotSystem.tryAddGemSlot(gemSlotItem.item);

    if (success && newItem) {
      // Remove diamond
      const updatedInventory = inventory
        .map(item => {
          if (item.slotId === gemSlotItem.gemId) {
            const newStackSize = (item.stackSize || 1) - 1;
            return newStackSize > 0 ? { ...item, stackSize: newStackSize } : null;
          }
          return item;
        })
        .filter(Boolean) as InventoryItem[];

      // Update item with new gem slot
      const finalInventory = updatedInventory.map(item => 
        item.slotId === gemSlotItem.item.slotId ? newItem : item
      );

      setInventory(finalInventory);
      
      if (gemSlotItem.item.slotId.startsWith('equip-')) {
        setPlayer(prev => {
          if (!prev) return prev;
          return EquipmentStatsSystem.applyEquipmentStats(prev, finalInventory);
        });
      }
    }

    setGemSlotItem(null);
  };

  const handleGemConfirm = () => {
    if (!gemConfirmation) return;

    const newItem = GemSlotSystem.addGemToSlot(gemConfirmation.item, gemConfirmation.gem);
    
    // Remove one gem from stack
    const updatedInventory = inventory.map(item => {
      if (item.slotId === gemConfirmation.gem.slotId) {
        const newStackSize = (item.stackSize || 1) - 1;
        return newStackSize > 0 ? { ...item, stackSize: newStackSize } : null;
      }
      if (item.slotId === gemConfirmation.item.slotId) {
        return newItem;
      }
      return item;
    }).filter(Boolean) as InventoryItem[];

    setInventory(updatedInventory);
    
    if (gemConfirmation.item.slotId.startsWith('equip-')) {
      setPlayer(prev => {
        if (!prev) return prev;
        return EquipmentStatsSystem.applyEquipmentStats(prev, updatedInventory);
      });
    }

    setGemConfirmation(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div 
        className="absolute pointer-events-auto select-none"
        style={{ 
          left: player.inventoryPosition.x,
          top: player.inventoryPosition.y,
          cursor: isDraggingWindow && !showDropConfirmation ? 'grabbing' : 'grab',
          transform: 'translate3d(0,0,0)',
          width: '200px',
          height: '600px',
          position: 'relative',
          pointerEvents: showDropConfirmation ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
      >
        <img 
          src="https://i.imgur.com/MmO8gsf.png" 
          alt="Inventory background" 
          className="w-full h-full object-contain inventory-background"
          draggable={false}
        />

        <EquipmentSlots
          equipmentSlots={equipmentSlots}
          dragOverSlot={dragOverSlot}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          onDeleteItem={removeItemFromInventory}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          player={player}
        />

        <InventoryGrid
          inventoryGrid={inventoryGrid}
          dragOverSlot={dragOverSlot}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onContextMenu={handleContextMenu}
          isDraggingWindow={isDraggingWindow}
          showDropConfirmation={showDropConfirmation}
          onDeleteItem={removeItemFromInventory}
          inventory={inventory}
          setInventory={setInventory}
          setPlayer={setPlayer}
          player={player}
        />

        <div 
          className="absolute text-center"
          style={{
            left: '27px',
            bottom: '27px',
            width: '145px'
          }}
        >
          <span className="text-yellow-400 font-bold">
            {formatYang(player.yang)} Yang
          </span>
        </div>
      </div>

      {tooltipItem && !showDropConfirmation && (
        <ItemTooltip 
          item={tooltipItem}
          position={tooltipPosition}
          player={player}
        />
      )}

      {showDropConfirmation && draggedItem && (
        <DropConfirmation
          item={draggedItem}
          position={dropPosition}
          onDestroy={handleDestroy}
          onCancel={() => {
            setShowDropConfirmation(false);
            setDraggedItem(null);
          }}
        />
      )}

      {upgradeItem && (
        <UpgradeConfirmation
          item={upgradeItem.item}
          playerYang={player.yang}
          inventory={inventory}
          onConfirm={handleUpgradeConfirm}
          onCancel={() => setUpgradeItem(null)}
          position={upgradeItem.position}
        />
      )}

      {upgradeResult && (
        <UpgradeResultNotification
          success={upgradeResult.success}
          item={upgradeResult.item}
          onClose={() => setUpgradeResult(null)}
        />
      )}

      {gemSlotItem && (
        <GemSlotConfirmation
          item={gemSlotItem.item}
          onConfirm={handleGemSlotConfirm}
          onCancel={() => setGemSlotItem(null)}
          position={gemSlotItem.position}
        />
      )}

      {gemConfirmation && (
        <GemConfirmation
          item={gemConfirmation.item}
          gem={gemConfirmation.gem}
          onConfirm={handleGemConfirm}
          onCancel={() => setGemConfirmation(null)}
          position={gemConfirmation.position}
        />
      )}

      {showMapSelection && (
        <MapSelectionWindow
          onClose={() => setShowMapSelection(false)}
          onMapSelect={handleMapSelect}
          position={mapSelectionPosition}
        />
      )}

      {showTeleportAnimation && (
        <TeleportAnimation onComplete={handleTeleportComplete} />
      )}

      {showMapPreloader && (
        <Preloader 
          onLoadComplete={handleMapLoadComplete}
          mapName={pendingMapSelection || undefined}
          isMapTransition={true}
        />
      )}
    </div>
  );
};

export default memo(Inventory);