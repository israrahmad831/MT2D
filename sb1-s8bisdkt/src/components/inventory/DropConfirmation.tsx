import React from 'react';
import { InventoryItem } from '../../types';

interface DropConfirmationProps {
  item: InventoryItem;
  position: { x: number; y: number };
  onDestroy: () => void;
  onCancel: () => void;
}

const DropConfirmation: React.FC<DropConfirmationProps> = ({
  item,
  position,
  onDestroy,
  onCancel
}) => {
  return (
    <div 
      className="fixed bg-black bg-opacity-90 rounded-md p-3 z-[100] border border-[#3c1f1f]"
      style={{
        left: position.x + 10,
        top: position.y + 10,
        minWidth: '200px',
        pointerEvents: 'auto'
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img 
            src={item.icon} 
            alt={item.name}
            className="w-6 h-6 object-contain"
          />
          <p className="text-white text-sm">
            What would you like to do with <span className="text-yellow-400">{item.name}</span>?
          </p>
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onDestroy}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded cursor-pointer"
          >
            Destroy
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DropConfirmation;