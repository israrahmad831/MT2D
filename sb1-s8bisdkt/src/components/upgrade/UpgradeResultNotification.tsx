import React, { useEffect } from 'react';
import { InventoryItem } from '../../types';

interface UpgradeResultNotificationProps {
  success: boolean;
  item: InventoryItem;
  onClose: () => void;
}

const UpgradeResultNotification: React.FC<UpgradeResultNotificationProps> = ({
  success,
  onClose
}) => {
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, transparent 70%)'
      }}
    >
      <div 
        className={`bg-black bg-opacity-90 border-2 rounded-lg p-6 transform scale-100 pointer-events-auto
          ${success ? 'border-green-500' : 'border-red-500'}
          animate-[popIn_0.3s_ease-out]`}
        style={{
          boxShadow: success ? 
            '0 0 20px rgba(34, 197, 94, 0.3)' : 
            '0 0 20px rgba(239, 68, 68, 0.3)'
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className={`text-2xl font-bold ${success ? 'text-green-500' : 'text-red-500'}`}>
            {success ? 'Upgrade Success!' : 'Upgrade Failed!'}
          </div>
          
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm font-semibold transition-colors"
          >
            OK
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default UpgradeResultNotification;