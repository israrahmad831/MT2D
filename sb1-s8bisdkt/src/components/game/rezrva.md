import React, { useEffect, useState, useRef } from 'react';

interface LayeredSpriteProps {
  position: { x: number; y: number };
  attackSequence: number;
  isAttacking: boolean;
  facingLeft: boolean;
  size: { width: number; height: number };
  onAnimationComplete?: () => void;
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
  onAnimationComplete
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(0);
  
  // Define sprite layers for each attack
  const getSpriteLayers = (attack: number): SpriteLayer[] => {
    switch (attack) {
      case 1:
        return [
          { url: 'https://i.imgur.com/f4ZpQbf.png', name: 'character', zIndex: 1 },
          { url: 'https://i.imgur.com/n7LEBtf.png', name: 'weapon', zIndex: 2 },
          { url: 'https://i.imgur.com/sqiZyPx.png', name: 'effect', zIndex: 3 }
        ];
      case 2:
        return [
          { url: 'https://i.imgur.com/qTFW5GE.png', name: 'character', zIndex: 1 },
          { url: 'https://i.imgur.com/8HZt4Ud.png', name: 'weapon', zIndex: 2 },
          { url: 'https://i.imgur.com/T39fd5K.png', name: 'effect', zIndex: 3 }
        ];
      case 3:
        return [
          { url: 'https://i.imgur.com/4urh8go.png', name: 'character', zIndex: 1 },
          { url: 'https://i.imgur.com/61JCMvv.png', name: 'weapon', zIndex: 2 },
          { url: 'https://i.imgur.com/LVnXqO6.png', name: 'effect', zIndex: 3 }
        ];
      case 4:
        return [
          { url: 'https://i.imgur.com/mTcEP7U.png', name: 'character', zIndex: 1 },
          { url: 'https://i.imgur.com/Yw4iDc6.png', name: 'weapon', zIndex: 2 },
          { url: 'https://i.imgur.com/HfHF8Tt.png', name: 'effect', zIndex: 3 }
        ];
      default:
        return [];
    }
  };

  // Animation configuration
  const FRAME_DURATION = 100; // ms per frame

  // Add a function to get the frame count based on attack sequence
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
  const frameWidth = size.width * 0.8; // Reduced from full size to 60%
  const frameHeight = size.height * 0.8; // Reduced from full size to 60%

  return (
    <div
      className="absolute pointer-events-none pixel-perfect"
      style={{
        left: '50%',  // Center horizontally within the player container
        top: '50%',   // Center vertically within the player container
        width: frameWidth,
        height: frameHeight,
        transform: 'translate(-50%, -50%)', // Center the element
        zIndex: 20, // Higher z-index to ensure it appears above idle animation
        imageRendering: 'pixelated',  // Add pixelated rendering to the container
        imageRendering: '-moz-crisp-edges',  // Firefox
        imageRendering: 'crisp-edges',  // Safari
      }}
    >
      {spriteLayers.map((layer) => (
        <div
          key={layer.name}
          className="absolute inset-0 pixel-perfect"
          style={{
            zIndex: layer.zIndex,
            transform: facingLeft ? 'scaleX(1)' : 'scaleX(-1)',
            transformOrigin: 'center',
            imageRendering: 'pixelated',  // Add pixelated rendering to each layer container
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
              imageRendering: '-moz-crisp-edges',  // Firefox
              imageRendering: 'crisp-edges',  // Safari
              filter: layer.name === 'effect' ? 'brightness(1.2) contrast(1.1)' : 'none'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default LayeredSprite;