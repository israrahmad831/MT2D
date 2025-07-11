import { InventoryItem } from '../../types';

export class TeleportItems {
  static readonly TELEPORT_RING: InventoryItem = {
    id: 'teleport-ring',
    name: 'Teleportation Ring',
    type: 'misc',
    value: 5000,
    slotId: 'inv-0',
    icon: 'https://ro-wiki.metin2.gameforge.com/images/6/6f/Inel_Teleportare.png',
    description: 'A mystical ring that allows instant teleportation between maps.',
    stackSize: 1,
    maxStack: 1
  };

  static readonly ALL_TELEPORT_ITEMS: InventoryItem[] = [
    TeleportItems.TELEPORT_RING
  ];
}