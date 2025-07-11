import { InventoryItem, GemSlot } from '../../types';
import { generateId } from '../../utils';

export class GemSlotSystem {
  static readonly MAX_SLOTS = 3;
  static readonly SLOT_SUCCESS_RATE = 70; // 70% success rate for adding a slot

  static canAddGemSlot(item: InventoryItem): boolean {
    if (!['weapon', 'armor'].includes(item.type)) return false;
    if (!item.gemSlots) return true;
    return item.gemSlots.length < this.MAX_SLOTS;
  }

  static canAddGem(item: InventoryItem, gem: InventoryItem): boolean {
    if (!item.gemSlots || !gem || gem.type !== 'gem' || !['weapon', 'armor'].includes(item.type)) return false;
    
    // Check if the gem type matches the item type
    if (item.type === 'weapon' && gem.subType !== 'weapon') return false;
    if (item.type === 'armor' && gem.subType !== 'armor') return false;
    
    // Find first empty slot
    const emptySlot = item.gemSlots.find(slot => slot.isEmpty);
    if (!emptySlot) return false;

    // Check if the same type of gem is already installed
    const existingGem = item.gemSlots.find(slot => 
      !slot.isEmpty && slot.gem?.id === gem.id
    );
    
    return !existingGem;
  }

  static addGemToSlot(item: InventoryItem, gem: InventoryItem): InventoryItem {
    if (!this.canAddGem(item, gem)) return item;

    const newItem = { ...item };
    const gemSlots = [...(newItem.gemSlots || [])];
    
    // Find first empty slot
    const emptySlotIndex = gemSlots.findIndex(slot => slot.isEmpty);
    if (emptySlotIndex === -1) return item;

    // Add a single gem to slot
    const singleGem = {
      ...gem,
      stackSize: 1,
      maxStack: 1 // Ensure the gem in slot can't stack
    };

    // Add gem to slot
    gemSlots[emptySlotIndex] = {
      ...gemSlots[emptySlotIndex],
      isEmpty: false,
      gem: singleGem
    };

    newItem.gemSlots = gemSlots;

    // Update stats based on gem type
    const stats = { ...newItem.stats } || {};
    
    if (gem.subType === 'weapon') {
      if (gem.stats?.monsterDamage) {
        stats.monsterDamage = (stats.monsterDamage || 0) + gem.stats.monsterDamage;
      }
      if (gem.stats?.criticalChance) {
        stats.criticalChance = (stats.criticalChance || 0) + gem.stats.criticalChance;
      }
      if (gem.stats?.attackDamage) {
        stats.attackDamage = (stats.attackDamage || 0) + gem.stats.attackDamage;
        if (stats.minAttack) stats.minAttack += gem.stats.attackDamage;
        if (stats.maxAttack) stats.maxAttack += gem.stats.attackDamage;
      }
    } else if (gem.subType === 'armor') {
      if (gem.stats?.movementSpeed) {
        stats.movementSpeed = (stats.movementSpeed || 0) + gem.stats.movementSpeed;
      }
      if (gem.stats?.vitality) {
        stats.vitality = (stats.vitality || 0) + gem.stats.vitality;
      }
      if (gem.stats?.dexterity) {
        stats.dexterity = (stats.dexterity || 0) + gem.stats.dexterity;
      }
    }
    
    newItem.stats = stats;

    // Update description
    const baseDescription = newItem.description?.split('\n\n')[0] || '';
    const gemSlotsText = newItem.gemSlots
      .map((slot, index) => {
        if (slot.isEmpty) return `Gem Slot ${index + 1}: Empty`;
        return `Gem Slot ${index + 1}: ${slot.gem?.name} (${this.getGemEffectText(slot.gem)})`;
      })
      .join('\n');
    
    newItem.description = `${baseDescription}\n\n${gemSlotsText}`;

    return newItem;
  }

  private static getGemEffectText(gem?: InventoryItem): string {
    if (!gem?.stats) return '';
    
    if (gem.subType === 'weapon') {
      if (gem.stats.monsterDamage) return `+${gem.stats.monsterDamage}% Monster Damage`;
      if (gem.stats.criticalChance) return `+${gem.stats.criticalChance}% Critical Chance`;
      if (gem.stats.attackDamage) return `+${gem.stats.attackDamage} Attack Damage`;
    } else if (gem.subType === 'armor') {
      if (gem.stats.movementSpeed) return `+${gem.stats.movementSpeed}% Movement Speed`;
      if (gem.stats.vitality) return `+${gem.stats.vitality} Vitality`;
      if (gem.stats.dexterity) return `+${gem.stats.dexterity} DEX`;
    }
    
    return '';
  }

  static tryAddGemSlot(item: InventoryItem): { 
    success: boolean;
    newItem: InventoryItem;
  } {
    if (!this.canAddGemSlot(item)) {
      return { success: false, newItem: item };
    }

    // Always succeed in adding a slot
    const newItem = { ...item };
    const gemSlots = newItem.gemSlots || [];
    
    if (gemSlots.length >= this.MAX_SLOTS) {
      return { success: false, newItem };
    }

    const newSlot: GemSlot = {
      id: generateId(),
      isEmpty: true
    };

    newItem.gemSlots = [...gemSlots, newSlot];
    
    // Update description
    const baseDescription = newItem.description?.split('\n\n')[0] || '';
    const gemSlotsText = newItem.gemSlots
      .map((slot, index) => {
        if (slot.isEmpty) return `Gem Slot ${index + 1}: Empty`;
        return `Gem Slot ${index + 1}: ${slot.gem?.name} (${this.getGemEffectText(slot.gem)})`;
      })
      .join('\n');
    
    newItem.description = `${baseDescription}\n\n${gemSlotsText}`;

    return { success: true, newItem };
  }
}