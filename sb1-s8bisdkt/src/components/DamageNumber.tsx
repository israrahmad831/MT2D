import React, { useEffect, useState } from 'react';

interface DamageNumberProps {
  damage: number;
  position: { x: number; y: number };
  onComplete: () => void;
  isEnemyDamage?: boolean;
  isCritical?: boolean;
}

const DamageNumber: React.FC<DamageNumberProps> = ({ 
  damage, 
  position, 
  onComplete,
  isEnemyDamage,
  isCritical
}) => {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!mounted) return null;

  const getColor = () => {
    if (isEnemyDamage) return 'text-red-500';
    if (isCritical) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <div
      className={`fixed ${getColor()} font-bold pointer-events-none pixel-text`}
      style={{
        left: position.x,
        top: position.y - 40,
        fontSize: isCritical ? '28px' : '24px',
        textShadow: '2px 2px 0 #000',
        animation: 'float-up 1s ease-out forwards',
        zIndex: 9999,
        transform: 'translate(-50%, 0)',
        imageRendering: 'pixelated',
        letterSpacing: '2px'
      }}
    >
      {Math.round(damage)}
      <style>{`
        @keyframes float-up {
          0% { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-25px) scale(${isCritical ? 1.2 : 1.1});
          }
          100% { 
            opacity: 0;
            transform: translateY(-50px) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DamageNumber;