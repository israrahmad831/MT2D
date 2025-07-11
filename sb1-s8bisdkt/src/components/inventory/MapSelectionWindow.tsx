import React from 'react';

interface MapSelectionWindowProps {
  onClose: () => void;
  onMapSelect: (mapName: string) => void;
  position: { x: number; y: number };
}

const MapSelectionWindow: React.FC<MapSelectionWindowProps> = ({
  onClose,
  onMapSelect,
  position
}) => {
  const maps = [
    {
      id: 'map1',
      name: 'Map 1'
    },
    {
      id: 'yogbi',
      name: 'Yogbi Desert'
    },
    {
      id: 'sohan',
      name: 'Mount Sohan'
    },
    {
      id: 'village',
      name: 'Village'
    }
  ];

  // Add this to stop event propagation
  const handleMapClick = (mapName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onMapSelect(mapName);
  };

  // Add this to stop event propagation
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className="fixed bg-black bg-opacity-90 rounded-lg p-4 border-2 border-yellow-900"
      style={{
        left: position.x + 20,
        top: position.y - 200,
        width: '250px',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-4">
        <h3 className="text-yellow-400 font-bold text-center text-lg pixel-text">
          Select Destination
        </h3>

        <div className="flex flex-col gap-2">
          {maps.map(map => (
            <button
              key={map.id}
              onClick={(e) => handleMapClick(map.id, e)}
              className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors text-left"
            >
              <span className="text-white pixel-text">{map.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleCloseClick}
          className="mt-2 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors pixel-text"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default MapSelectionWindow;