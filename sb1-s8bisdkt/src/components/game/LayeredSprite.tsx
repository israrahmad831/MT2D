import React, { useEffect, useState, useRef } from 'react';

// Import all assets at the top of the file
import atac1Character from '../assets/warrior/atac1/1.png';
import atac1Weapon from '../assets/warrior/atac1/2.png';
import atac1Effect from '../assets/warrior/atac1/3.png';

import atac2Character from '../assets/warrior/atac2/1.png';
import atac2Weapon from '../assets/warrior/atac2/2.png';
import atac2Effect from '../assets/warrior/atac2/3.png';

import atac3Character from '../assets/warrior/atac3/1.png';
import atac3Weapon from '../assets/warrior/atac3/2.png';
import atac3Effect from '../assets/warrior/atac3/3.png';

import atac4Character from '../assets/warrior/atac4/1.png';
import atac4Weapon from '../assets/warrior/atac4/2.png';
import atac4Effect from '../assets/warrior/atac4/3.png';

interface LayeredSpriteProps {
  position: { x: number; y: number };
  attackSequence: number;
  isAttacking: boolean;
  facingLeft: boolean;
  size: { width: number; height: number };
  onAnimationComplete?: () => void;
  isSwordAuraActive?: boolean;
}

interface SpriteLayer {
  url: string;
  name: string;
  zIndex: number;
}

const LayeredSprite: React.FC<LayeredSpriteProps> = ({
  position,
  attackSequence,
  isAttacking,
  facingLeft,
  size,
  onAnimationComplete,
  isSwordAuraActive = false
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);
  
  // Define sprite layers for each attack using imported assets
  const getSpriteLayers = (attack: number): SpriteLayer[] => {
    switch (attack) {
      case 1:
        return [
          { url: atac1Character, name: 'character', zIndex: 1 },
          { url: atac1Weapon, name: 'weapon', zIndex: 2 },
          { url: atac1Effect, name: 'effect', zIndex: 3 }
        ];
      case 2:
        return [
          { url: atac2Character, name: 'character', zIndex: 1 },
          { url: atac2Weapon, name: 'weapon', zIndex: 2 },
          { url: atac2Effect, name: 'effect', zIndex: 3 }
        ];
      case 3:
        return [
          { url: atac3Character, name: 'character', zIndex: 1 },
          { url: atac3Weapon, name: 'weapon', zIndex: 2 },
          { url: atac3Effect, name: 'effect', zIndex: 3 }
        ];
      case 4:
        return [
          { url: atac4Character, name: 'character', zIndex: 1 },
          { url: atac4Weapon, name: 'weapon', zIndex: 2 },
          { url: atac4Effect, name: 'effect', zIndex: 3 }
        ];
      default:
        return [];
    }
  };

  // Animation configuration
  const FRAME_DURATION = 100; // ms per frame

  // Get frame count based on attack sequence
  const getFrameCount = (attackSequence: number): number => {
    return attackSequence === 4 ? 7 : 6; // 7 frames for attack 4, 6 frames for others
  };

  useEffect(() => {
    if (!isAttacking || attackSequence === 0) {
      setCurrentFrame(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    let startTime = performance.now();
    setCurrentFrame(0);
    const frameCount = getFrameCount(attackSequence);
    const totalAnimationTime = frameCount * FRAME_DURATION;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const frameIndex = Math.floor((elapsed / FRAME_DURATION) % frameCount);
      
      setCurrentFrame(frameIndex);

      if (elapsed >= totalAnimationTime) {
        // Animation complete
        setCurrentFrame(0);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAttacking, attackSequence, onAnimationComplete]);

  // Don't render if not attacking or no attack sequence
  if (!isAttacking || attackSequence === 0) {
    return null;
  }

  const spriteLayers = getSpriteLayers(attackSequence);
  const frameCount = getFrameCount(attackSequence);
  const frameWidth = size.width * 0.8;
  const frameHeight = size.height * 0.8;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: frameWidth,
        height: frameHeight,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        imageRendering: 'pixelated'
      }}
    >
      {spriteLayers.map((layer) => (
        // Only render the layer if it's not the effect layer or if sword aura is active
        (layer.name !== 'effect' || isSwordAuraActive) && (
          <div
            key={layer.name}
            className="absolute inset-0"
            style={{
              zIndex: layer.zIndex,
              transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)',
              transformOrigin: 'center',
              imageRendering: 'pixelated'
            }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${layer.url})`,
                backgroundSize: `${frameWidth * frameCount}px ${frameHeight}px`,
                backgroundPosition: `-${currentFrame * frameWidth}px 0px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                filter: layer.name === 'effect' ? 'brightness(1.2) contrast(1.1)' : 'none'
              }}
            />
          </div>
        )
      ))}
    </div>
  );
};

export default LayeredSprite;