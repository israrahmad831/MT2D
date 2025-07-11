import React, { useState, useEffect } from 'react';
import { SoundManager } from '../utils/SoundManager';

interface PreloaderProps {
  onLoadComplete: () => void;
  mapName?: string;
  isMapTransition?: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadComplete, mapName, isMapTransition = false }) => {
  const [progress, setProgress] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing...');

  useEffect(() => {
    // Play loading sound effect immediately
    SoundManager.playLoadingSound();

    // Different asset sets based on whether it's initial load or map transition
    const getAssetsForMap = (map?: string) => {
      const baseAssets = [
        // Core UI assets
        'https://i.imgur.com/yjPNKPp.png', // Stats button
        'https://i.imgur.com/dXPMDxd.png', // Stats window
        'https://i.imgur.com/MmO8gsf.png', // Inventory background
      ];

      const mapAssets: { [key: string]: string[] } = {
        'map1': [
          'https://i.imgur.com/hO4ZwGt.png', // Map1 background
          'https://i.imgur.com/Dypgayh.gif', // Stone of Map1
        ],
        'sohan': [
          'https://i.imgur.com/kB7Fgpe.png', // Sohan background
          'https://i.imgur.com/smRpWH4.gif', // Metin Stone
          'https://i.imgur.com/UT1iu3O.gif', // White Tiger Idle
          'https://i.imgur.com/ehO4EP2.gif', // White Tiger Moving
          'https://i.imgur.com/ARyPnuF.gif', // White Tiger Attack
        ],
        'yogbi': [
          'https://i.imgur.com/YOddcME.png', // Yogbi background
          'https://i.imgur.com/WquAPAc.gif', // Desert Stone
        ],
        'village': [
          'https://i.imgur.com/0m9WhiF.png', // Village background
          'https://i.imgur.com/o0fVRZN.png', // Grass tile
          'https://i.imgur.com/NkQRvdZ.png', // Stone tile
          'https://i.imgur.com/Vpa31Q0.png', // Cobblestone tile
          'https://i.imgur.com/xaVUevW.png', // Wood tile
          'https://i.imgur.com/xLc7N9c.png', // Brick tile
          'https://i.imgur.com/WEdoduk.png', // Sand tile
        ]
      };

      if (isMapTransition && map && mapAssets[map]) {
        return [...baseAssets, ...mapAssets[map]];
      }

      // Full asset list for initial load
      return [
        ...baseAssets,
        // Player assets
        'https://i.imgur.com/sGRAaBX.gif', // Player Attack
        'https://i.imgur.com/NtGwERq.gif', // Player Idle
        'https://i.imgur.com/mdlONHf.gif', // Mounted Player Idle
        'https://i.imgur.com/w1NBTZT.gif', // Mounted Player Moving
        'https://imgur.com/Gg4K2LS.gif',   // Mounted Player Moving Up
        'https://i.imgur.com/kKlHrHo.gif', // Mounted Player Attack

        // Skill icons
        'https://i.imgur.com/oGASkmn.png', // Sword Aura
        'https://i.imgur.com/64TUUYd.png', // Berserker
        'https://i.imgur.com/E7cFDqM.png', // Sword Spin
        'https://i.imgur.com/mrCTsJw.png', // Triple Slash
        'https://i.imgur.com/txAmV0X.png', // Swift Strike
        'https://ro-wiki.metin2.gameforge.com/images/a/a1/Licoare_Ro%C8%99ie%28L%29.png', // Red Potion

        // Item icons
        'https://i.imgur.com/SiKfXAi.png', // Sword
        'https://ro-wiki.metin2.gameforge.com/images/9/95/Sabie_lun%C4%83_plin%C4%83.png', // Full Moon Sword
        'https://ro-wiki.metin2.gameforge.com/images/7/7f/Manny_%28Sigiliu%29.png', // Mount Manny
        'https://ro-wiki.metin2.gameforge.com/images/6/6f/Inel_Teleportare.png', // Teleport Ring

        // All map assets for initial load
        ...Object.values(mapAssets).flat()
      ];
    };

    const gameAssets = getAssetsForMap(mapName);
    setTotalAssets(gameAssets.length);

    // Create a cache to store loaded images
    const imageCache = new Map<string, HTMLImageElement>();

    const loadImage = (src: string, index: number) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        
        img.onload = () => {
          imageCache.set(src, img);
          setLoadedAssets(prev => {
            const newLoaded = prev + 1;
            const progressPercent = Math.floor((newLoaded / gameAssets.length) * 100);
            setProgress(progressPercent);
            
            // Update current task based on progress
            if (progressPercent < 30) {
              setCurrentTask('Loading textures...');
            } else if (progressPercent < 60) {
              setCurrentTask('Loading sprites...');
            } else if (progressPercent < 90) {
              setCurrentTask('Loading map data...');
            } else {
              setCurrentTask('Finalizing...');
            }
            
            return newLoaded;
          });
          resolve();
        };
        
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
          // Still count as loaded to prevent hanging
          setLoadedAssets(prev => prev + 1);
          resolve();
        };
      });
    };

    // Load all assets with staggered timing for smoother progress
    const loadAssets = async () => {
      const promises = gameAssets.map((asset, index) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            loadImage(asset, index).then(resolve);
          }, index * 50); // Stagger loading by 50ms
        });
      });

      await Promise.all(promises);
      
      // Store cache in window object for global access
      (window as any).gameImageCache = imageCache;
      
      // Add a small delay to ensure smooth transition
      setTimeout(() => {
        setCurrentTask('Complete!');
        setTimeout(onLoadComplete, 300);
      }, 500);
    };

    loadAssets();
  }, [onLoadComplete, mapName, isMapTransition]);

  const getMapDisplayName = (map?: string) => {
    const mapNames: { [key: string]: string } = {
      'map1': 'Seungryong Valley',
      'sohan': 'Mount Sohan',
      'yogbi': 'Yogbi Desert',
      'village': 'Village'
    };
    return mapNames[map || ''] || 'Game World';
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[10001]">
      <div className="relative w-full max-w-md aspect-video">
        {/* Background */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            backgroundImage: isMapTransition 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
              : 'url(https://metin2.download/picture/Z6HrP8F5QYDpIu1F9X8DS0gPrH335Xa5/.gif)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg" />
        
        {/* Loading content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {/* Title */}
          <div className="text-white text-2xl font-bold mb-2 pixel-text text-center">
            {isMapTransition ? `Entering ${getMapDisplayName(mapName)}` : 'Loading MT2D'}
          </div>
          
          {/* Subtitle */}
          <div className="text-gray-300 text-sm mb-6 pixel-text text-center">
            {isMapTransition ? 'Preparing new area...' : 'Initializing game world...'}
          </div>
          
          {/* Progress bar container */}
          <div className="w-full max-w-xs mb-4">
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Progress text */}
          <div className="text-white mb-2 pixel-text text-center">
            {progress}% ({loadedAssets}/{totalAssets})
          </div>
          
          {/* Current task */}
          <div className="text-yellow-400 text-sm pixel-text text-center animate-pulse">
            {currentTask}
          </div>
          
          {/* Loading animation */}
          <div className="mt-4 flex space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        
        {/* Decorative elements for map transition */}
        {isMapTransition && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-60"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `twinkle ${2 + Math.random() * 2}s infinite ${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Preloader;