import { InventoryItem, Player } from '../../../types';
import { BonusSystem } from '../../../systems/bonus/BonusSystem';
import { EquipmentStatsSystem } from '../../../systems/equipment/EquipmentStatsSystem';
import { UpgradeSystem } from '../../../systems/upgrade/UpgradeSystem';
import { GemSlotSystem } from '../../../systems/gems/GemSlotSystem';

export function useInventoryHandlers(
  player: Player,
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
  inventory: InventoryItem[],
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>,
  setUpgradeItem: React.Dispatch<React.SetStateAction<any>>,
  setGemSlotItem: React.Dispatch<React.SetStateAction<any>>,
  setGemConfirmation: React.Dispatch<React.SetStateAction<any>>,
  setDraggedItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>
) {
  const handleSpecialItems = (
    draggedItem: InventoryItem,
    targetSlotId: string,
    e: React.DragEvent
  ): boolean => {
    const targetItem = inventory.find(item => item.slotId === targetSlotId);
    if (!targetItem) return false;

    // Handle Improve Item
    if (draggedItem.id === 'improve-item') {
      if (!BonusSystem.canAddBonus(targetItem)) return true;
      
      const updatedItem = BonusSystem.addRandomBonus(targetItem);
      handleItemConsumption(draggedItem, targetItem, updatedItem);
      return true;
    }

    // Handle Enchant Item
    if (draggedItem.id === 'enchant-item') {
      const enchantedItem = BonusSystem.rerollAllBonuses(targetItem);
      handleItemConsumption(draggedItem, targetItem, enchantedItem);
      return true;
    }

    // Handle Power Additive
    if (draggedItem.id === 'power-additive' && 
        ['helmet', 'bracelet', 'earring', 'necklace'].includes(targetItem.type)) {
      if (!BonusSystem.canAddBonus(targetItem)) return true;
      
      const updatedItem = BonusSystem.addRandomBonus(targetItem);
      handleItemConsumption(draggedItem, targetItem, updatedItem);
      return true;
    }

    // Handle Orison
    if (draggedItem.id === 'orison' && 
        ['helmet', 'bracelet', 'earring', 'necklace'].includes(targetItem.type)) {
      const enchantedItem = BonusSystem.rerollAllBonuses(targetItem);
      handleItemConsumption(draggedItem, targetItem, enchantedItem);
      return true;
    }

    // Handle Blessing Scroll
    if (draggedItem.id === 'blessing-scroll') {
      if (targetItem.id === 'blessing-scroll' && targetItem.slotId !== draggedItem.slotId) {
        handleScrollStacking(draggedItem, targetItem);
        return true;
      }
      
      if (UpgradeSystem.canUpgrade(targetItem)) {
        const rect = e.currentTarget.getBoundingClientRect();
        setUpgradeItem({
          item: targetItem,
          scrollId: draggedItem.slotId,
          position: { x: rect.left, y: rect.top }
        });
        setDraggedItem(null);
        return true;
      }
    }

    // Handle Diamond
    if (draggedItem.id === 'diamond' && 
        (targetItem.type === 'weapon' || targetItem.type === 'armor') && 
        GemSlotSystem.canAddGemSlot(targetItem)) {
      const rect = e.currentTarget.getBoundingClientRect();
      setGemSlotItem({
        item: targetItem,
        gemId: draggedItem.slotId,
        position: { x: rect.left, y: rect.top }
      });
      setDraggedItem(null);
      return true;
    }

    // Handle Gems
    if (draggedItem.type === 'gem' && draggedItem.id !== 'diamond' &&
        (targetItem.type === 'weapon' || targetItem.type === 'armor') && 
        targetItem.gemSlots?.length > 0 && 
        GemSlotSystem.canAddGem(targetItem, draggedItem)) {
      const rect = e.currentTarget.getBoundingClientRect();
      setGemConfirmation({
        item: targetItem,
        gem: draggedItem,
        position: { x: rect.left, y: rect.top }
      });
      setDraggedItem(null);
      return true;
    }

    return false;
  };

  const handleItemConsumption = (
    consumedItem: InventoryItem,
    targetItem: InventoryItem,
    updatedItem: InventoryItem
  ) => {
    const newInventory = inventory.map(item => {
      if (item.slotId === consumedItem.slotId) {
        const newStackSize = (item.stackSize || 1) - 1;
        return newStackSize > 0 ? { ...item, stackSize: newStackSize } : null;
      }
      if (item.slotId === targetItem.slotId) {
        return updatedItem;
      }
      return item;
    }).filter(Boolean) as InventoryItem[];
    
    setInventory(newInventory);
    
    if (targetItem.slotId.startsWith('equip-')) {
      const updatedPlayer = EquipmentStatsSystem.applyEquipmentStats(player, newInventory);
      setPlayer(updatedPlayer);
    }
    
    setDraggedItem(null);
  };

  const handleScrollStacking = (sourceScroll: InventoryItem, targetScroll: InventoryItem) => {
    const sourceStack = sourceScroll.stackSize || 1;
    const targetStack = targetScroll.stackSize || 1;
    const maxStack = targetScroll.maxStack || 50;
    const newStack = Math.min(sourceStack + targetStack, maxStack);
    
    const updatedInventory = inventory
      .filter(item => item.slotId !== sourceScroll.slotId)
      .map(item => 
        item.slotId === targetScroll.slotId 
          ? { ...item, stackSize: newStack }
          : item
      );
    
    setInventory(updatedInventory);
    setDraggedItem(null);
  };

  return {
    handleSpecialItems
  };
}