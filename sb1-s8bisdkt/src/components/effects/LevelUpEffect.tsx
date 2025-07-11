import React, { useEffect, useState } from 'react';

interface LevelUpEffectProps {
  position: { x: number; y: number };
  onComplete: () => void;
  level?: number;
}

const LevelUpEffect: React.FC<LevelUpEffectProps> = ({ position, onComplete, level }) => {
  const [visible, setVisible] = useState(true);
  const [showSpecialReward, setShowSpecialReward] = useState(false);

  useEffect(() => {
    // Check if this is a level that's a multiple of 10
    if (level && level % 10 === 0) {
      setShowSpecialReward(true);
    }

    // Clear any existing timers
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete(); // Notify the system that the effect has ended
    }, 2000); // Reduced from 2500ms to 2000ms for better responsiveness

    return () => {
      clearTimeout(timer); // Cleanup timer on unmount
      onComplete(); // Ensure onComplete is called if component unmounts
    };
  }, [onComplete, level]);

  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        width: '120px',
        height: '120px',
        transform: 'translate(-50%, -50%)',
        zIndex: 15
      }}
    >
      {/* Visual effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
          animation: 'levelUpGlow 0.5s ease-out'
        }}
      />

      {/* Level Up Text */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
        style={{
          color: '#FFD700',
          textShadow: '0 0 10px #FFD700',
          fontWeight: 'bold',
          fontSize: '24px',
          animation: 'fadeOut 0.5s ease-out'
        }}
      >
        LEVEL UP!
      </div>

      {/* Special reward notification for levels divisible by 10 */}
      {showSpecialReward && (
        <div
          className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-full"
          style={{
            color: '#00FFFF',
            textShadow: '0 0 10px #00FFFF',
            fontWeight: 'bold',
            fontSize: '16px',
            animation: 'specialReward 1s ease-out',
            whiteSpace: 'nowrap',
            width: '300px',
            textAlign: 'center'
          }}
        >
          +20 Ancient Frozen Spellbook!
        </div>
      )}

      <style>
        {`
          @keyframes levelUpGlow {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          
          @keyframes fadeOut {
            0% { opacity: 1; transform: translateY(-100%) scale(1); }
            100% { opacity: 0; transform: translateY(-120%) scale(1.2); }
          }

          @keyframes specialReward {
            0% { opacity: 0; transform: translateY(-80%) scale(0.8); }
            50% { opacity: 1; transform: translateY(-100%) scale(1.2); }
            100% { opacity: 0; transform: translateY(-120%) scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default LevelUpEffect;