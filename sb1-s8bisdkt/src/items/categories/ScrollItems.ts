import { InventoryItem } from '../../types';

export class ScrollItems {
  static readonly BLESSING_SCROLL: InventoryItem = {
    id: 'blessing-scroll',
    name: 'Blessing Scroll',
    type: 'scroll',
    value: 100,
    slotId: 'inv-0',
    icon: 'https://i.imgur.com/aXIocX0.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Eliminates the risk of destroying an object, if its fails to improve. It will only reduce its quality (eg, previously cut by a + +6 for failure then +5, previously 0 remains 0). Recently, its dropped from all monsters, but very rarely'
  };

  static readonly ALL_SCROLLS: InventoryItem[] = [
    ScrollItems.BLESSING_SCROLL
  ];
}