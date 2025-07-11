import React from 'react';
import { InventoryItem } from '../../types';

interface GemSlotConfirmationProps {
  item: InventoryItem;
  onConfirm: () => void;
  onCancel: () => void;
  position: { x: number; y: number };
}

const GemSlotConfirmation: React.FC<GemSlotConfirmationProps> = ({
  item,
  onConfirm,
  onCancel,
  position
}) => {
  return (
    <div 
      className="fixed bg-black bg-opacity-90 rounded-lg p-4 z-[100] border-2 border-yellow-900 pointer-events-auto"
      style={{
        left: position.x + 20,
        top: Math.max(20, position.y - 200)
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
            <p className="text-gray-400 text-sm">Add gem slot</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm">
          Are you sure you want to add a gem slot to this item?
        </p>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-bold text-white cursor-pointer"
          >
            Confirm
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

export default GemSlotConfirmation;