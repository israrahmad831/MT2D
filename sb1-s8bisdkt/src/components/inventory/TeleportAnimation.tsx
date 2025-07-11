import React, { useEffect, useState } from 'react';
import { SoundManager } from '../../utils/SoundManager';

interface TeleportAnimationProps {
  onComplete: () => void;
}

const TeleportAnimation: React.FC<TeleportAnimationProps> = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'start' | 'fury' | 'fade'>('start');

  useEffect(() => {
    // Play teleport sound effect immediately
    SoundManager.playTeleportSound();

    // Animation sequence
    const sequence = [
      { phase: 'start', duration: 300 },
      { phase: 'fury', duration: 2000 },
      { phase: 'fade', duration: 400 }
    ];

    let currentStep = 0;

    const runSequence = () => {
      if (currentStep < sequence.length) {
        const step = sequence[currentStep];
        setAnimationPhase(step.phase as any);
        
        setTimeout(() => {
          currentStep++;
          if (currentStep < sequence.length) {
            runSequence();
          } else {
            setVisible(false);
            onComplete();
          }
        }, step.duration);
      }
    };

    runSequence();

    return () => {
      // Cleanup if component unmounts
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
      {/* Red fury overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: animationPhase === 'fade' 
            ? 'radial-gradient(circle, rgba(220, 38, 38, 0.1) 0%, rgba(0,0,0,1) 100%)'
            : 'radial-gradient(circle, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.6) 40%, rgba(127, 29, 29, 0.8) 80%, rgba(0,0,0,0.9) 100%)',
          transition: 'all 0.5s ease-in-out'
        }}
      />
      
      {/* Central fury energy burst */}
      {animationPhase === 'fury' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.7) 30%, rgba(185, 28, 28, 0.5) 60%, transparent 80%)',
              animation: 'furyPulse 1s ease-in-out infinite alternate',
              transform: 'translateZ(0)'
            }}
          />
        </div>
      )}

      {/* Red energy waves */}
      {animationPhase === 'fury' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                borderColor: `rgba(220, 38, 38, ${0.8 - i * 0.15})`,
                animation: `redWave ${1.5 + i * 0.3}s ease-out infinite ${i * 0.2}s`,
                transform: 'translateZ(0)'
              }}
            />
          ))}
        </div>
      )}

      {/* Background fire effect */}
      {animationPhase === 'fury' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '60px',
                height: '120px',
                left: `${40 + 3 * Math.cos((i * Math.PI * 2) / 12)}%`,
                top: `${50 + 25 * Math.sin((i * Math.PI * 2) / 12)}%`,
                transform: 'translate(-50%, -50%)',
                background: `linear-gradient(to top, 
                  rgba(139, 0, 0, 0.9) 0%,
                  rgba(220, 38, 38, 0.8) 30%,
                  rgba(239, 68, 68, 0.7) 60%,
                  rgba(252, 165, 165, 0.4) 80%,
                  transparent 100%
                )`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                filter: 'blur(2px)',
                animation: `fireFlicker ${1.5 + (i % 3) * 0.5}s ease-in-out infinite ${i * 0.1}s`,
                zIndex: -1
              }}
            />
          ))}
        </div>
      )}

      {/* Teleportation Character with red aura */}
      <div className="relative z-10 flex flex-col items-center">
        <img 
          src="https://i.imgur.com/xnBwH9Q.gif"
          alt="Teleportation Owl"
          className="object-contain"
          style={{ 
            width: animationPhase === 'start' ? '144px' : animationPhase === 'fury' ? '192px' : '240px',
            height: animationPhase === 'start' ? '144px' : animationPhase === 'fury' ? '192px' : '240px',
            imageRendering: 'pixelated',
            filter: animationPhase === 'fury' 
              ? 'drop-shadow(0 0 40px rgba(220, 38, 38, 1)) brightness(1.2) hue-rotate(-10deg) saturate(1.5)' 
              : 'drop-shadow(0 0 25px rgba(220, 38, 38, 0.8))',
            animation: animationPhase === 'fury' ? 'owlFloat 1.5s ease-in-out infinite' : 'none',
            transform: 'translateZ(0)',
            transition: 'width 0.5s ease-out, height 0.5s ease-out',
            opacity: animationPhase === 'fade' ? 0 : 1
          }}
        />
        
        {/* Teleportation Text */}
        <div className="mt-8 text-center">
          <h2 
            className="text-3xl font-bold text-red-400 pixel-text mb-2"
            style={{
              animation: animationPhase === 'fury' ? 'textGlow 1s infinite alternate' : 'none',
              opacity: animationPhase === 'fade' ? 0 : 1,
              transition: 'opacity 0.5s ease-out'
            }}
          >
            {animationPhase === 'start' && 'Preparing Teleportation...'}
            {animationPhase === 'fury' && 'Teleporting...'}
            {animationPhase === 'fade' && 'Arriving...'}
          </h2>
          
          {animationPhase === 'fury' && (
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>

      {/* Red particle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(animationPhase === 'fury' ? 16 : 8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              background: ['#dc2626', '#ef4444', '#b91c1c'][Math.floor(Math.random() * 3)],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `redSparkle ${1.5 + Math.random() * 2}s infinite ${Math.random() * 3}s`,
              opacity: animationPhase === 'fade' ? 0 : 0.8,
              transform: 'translateZ(0)',
              transition: 'opacity 0.5s ease-out'
            }}
          />
        ))}
      </div>

      {/* Energy streams radiating outward */}
      {animationPhase === 'fury' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 bg-gradient-to-t from-transparent via-red-500 to-transparent"
              style={{
                height: '250px',
                transform: `rotate(${i * 60}deg)`,
                animation: 'redEnergyStream 1s ease-in-out infinite alternate',
                transformOrigin: 'center',
                filter: 'blur(1px)',
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes owlFloat {
          0% { 
            transform: translateZ(0) translateY(0px) scale(1);
          }
          50% { 
            transform: translateZ(0) translateY(-20px) scale(1.1);
          }
          100% { 
            transform: translateZ(0) translateY(0px) scale(1);
          }
        }

        @keyframes textGlow {
          0% { 
            text-shadow: 0 0 10px #dc2626, 0 0 20px #dc2626;
          }
          100% { 
            text-shadow: 0 0 20px #dc2626, 0 0 30px #dc2626, 0 0 40px #dc2626;
          }
        }

        @keyframes redSparkle {
          0%, 100% { 
            opacity: 0;
            transform: translateZ(0) scale(0.3) translateY(0px);
          }
          50% { 
            opacity: 1;
            transform: translateZ(0) scale(1.2) translateY(-25px);
          }
        }
        
        @keyframes fireFlicker {
          0%, 100% { 
            transform: translate(-50%, -50%) scaleY(1) scaleX(0.8);
            opacity: 0.8;
          }
          25% { 
            transform: translate(-50%, -50%) scaleY(1.2) scaleX(1);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scaleY(0.9) scaleX(0.9);
            opacity: 0.9;
          }
          75% { 
            transform: translate(-50%, -50%) scaleY(1.1) scaleX(1.1);
            opacity: 0.7;
          }
        }
        
        @keyframes redWave {
          0% { 
            transform: scale(0.6);
            opacity: 1;
          }
          100% { 
            transform: scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes redEnergyStream {
          0% { 
            opacity: 0.4;
            transform: rotate(var(--rotation)) scaleY(0.8);
          }
          100% { 
            opacity: 1;
            transform: rotate(var(--rotation)) scaleY(1.4);
          }
        }
        
        @keyframes furyPulse {
          0% { 
            transform: scale(0.9);
            opacity: 0.7;
          }
          100% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TeleportAnimation;