import { InventoryItem } from '../../types';

export class UpgradeItems {
  static readonly BEAR_GALL: InventoryItem = {
    id: 'bear-gall',
    name: 'Bear Gall',
    type: 'misc',
    value: 5000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/7/7f/Bear_Gall.png',
    stackSize: 1,
    maxStack: 50,
    description: 'Bear gall is known to revive the sense of taste.'
  };

  static readonly BEAR_FOOT_SKIN: InventoryItem = {
    id: 'bear-foot-skin',
    name: 'Bear Foot Skin',
    type: 'misc',
    value: 5000,
    slotId: 'inv-0',
    icon: 'https://en-wiki.metin2.gameforge.com/images/4/4f/Bear_Foot_Skin.png',
    stackSize: 1,
    maxStack: 50,
    description: 'The preferred by many people stamina-giving food.'
  };

  static readonly ALL_UPGRADE_ITEMS: InventoryItem[] = [
    UpgradeItems.BEAR_GALL,
    UpgradeItems.BEAR_FOOT_SKIN
  ];
}