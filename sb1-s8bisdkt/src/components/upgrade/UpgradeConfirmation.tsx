import React from 'react';
import { InventoryItem } from '../../types';
import { UpgradeSystem } from '../../systems/upgrade/UpgradeSystem';

interface UpgradeConfirmationProps {
  item: InventoryItem;
  playerYang: number;
  inventory: InventoryItem[];
  onConfirm: () => void;
  onCancel: () => void;
  position: { x: number; y: number };
}

const UpgradeConfirmation: React.FC<UpgradeConfirmationProps> = ({
  item,
  playerYang,
  inventory,
  onConfirm,
  onCancel,
  position
}) => {
  const currentPlus = UpgradeSystem.getCurrentPlus(item);
  const { successRate, cost, requirements } = UpgradeSystem.getUpgradeRates(currentPlus, item.type, item.id);
  const canAfford = playerYang >= cost;

  const hasRequiredItems = UpgradeSystem.hasRequiredItems(inventory, requirements);

  const getBearGallCount = () => {
    return inventory
      .filter(item => item.id === 'bear-gall')
      .reduce((total, item) => total + (item.stackSize || 1), 0);
  };

  const getBearFootSkinCount = () => {
    return inventory
      .filter(item => item.id === 'bear-foot-skin')
      .reduce((total, item) => total + (item.stackSize || 1), 0);
  };

  return (
    <div 
      className="fixed bg-black bg-opacity-90 rounded-lg p-4 z-[100] border-2 border-yellow-900 pointer-events-auto"
      style={{
        left: position.x + 20,
        top: Math.max(20, position.y - 320), // Position above the item
        minWidth: '300px'
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b border-yellow-900/50 pb-3">
          <img 
            src={item.icon} 
            alt={item.name}
            className="w-12 h-12 object-contain"
          />
          <div>
            <h3 className="text-yellow-400 font-bold">{item.name}</h3>
            <p className="text-gray-400 text-sm">Current: +{currentPlus} → Next: +{currentPlus + 1}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Success Rate:</span>
            <span className="text-green-400">{successRate}%</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Cost:</span>
            <span className={playerYang >= cost ? 'text-yellow-400' : 'text-red-400'}>
              {cost} Yang
            </span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Your Yang:</span>
            <span className="text-white">{playerYang} Yang</span>
          </div>

          {/* Requirements Section */}
          {requirements && (
            <div className="mt-4 space-y-2 border-t border-yellow-900/30 pt-2">
              <div className="text-gray-300 font-semibold">Requirements:</div>
              
              {/* Bear Gall Requirement */}
              {requirements.bearGall && (
                <div className="flex items-center gap-2">
                  <img 
                    src="https://en-wiki.metin2.gameforge.com/images/7/7f/Bear_Gall.png"
                    alt="Bear Gall"
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <div className="text-gray-300">Bear Gall</div>
                    <div className={getBearGallCount() >= requirements.bearGall ? 'text-green-400' : 'text-red-400'}>
                      {getBearGallCount()}/{requirements.bearGall}
                    </div>
                  </div>
                </div>
              )}

              {/* Bear Foot Skin Requirement */}
              {requirements.bearFootSkin && (
                <div className="flex items-center gap-2">
                  <img 
                    src="https://en-wiki.metin2.gameforge.com/images/4/4f/Bear_Foot_Skin.png"
                    alt="Bear Foot Skin"
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <div className="text-gray-300">Bear Foot Skin</div>
                    <div className={getBearFootSkinCount() >= requirements.bearFootSkin ? 'text-green-400' : 'text-red-400'}>
                      {getBearFootSkinCount()}/{requirements.bearFootSkin}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {(!canAfford || !hasRequiredItems) && (
          <p className="text-red-400 text-sm mt-2">
            {!canAfford && "Not enough Yang for upgrade!"}
            {!canAfford && !hasRequiredItems && " and "}
            {!hasRequiredItems && "Missing required items!"}
          </p>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onConfirm}
            disabled={!canAfford || !hasRequiredItems}
            className={`px-4 py-2 rounded text-sm font-bold ${
              canAfford && hasRequiredItems
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer' 
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            Upgrade
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeConfirmation;