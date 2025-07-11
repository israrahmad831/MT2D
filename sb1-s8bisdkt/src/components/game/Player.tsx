import React, { useState, useEffect } from "react";
import { Player as PlayerType } from "../../types";
import LayeredSprite from "./LayeredSprite";
import warriorRun1 from "../../components/assets/warrior/run/1.png";
import warriorRun2 from "../../components/assets/warrior/run/2.png";
import warriorRun3 from "../../components/assets/warrior/run/3.png";
import warriorIdle1 from "../../components/assets/warrior/idle/1.png";
import warriorIdle2 from "../../components/assets/warrior/idle/2.png";
import warriorIdle3 from "../../components/assets/warrior/idle/3.png";

interface PlayerProps {
  player: PlayerType;
}

const Player: React.FC<PlayerProps> = ({ player }) => {
  const isMounted = player.mount?.active;
  const isMoving = player.isMoving;
  const facingLeft = player.direction.x < 0;
  const facingRight = player.direction.x > 0;
  const facingUp = player.direction.y < 0;
  const facingDown = player.direction.y > 0;
  const playerSize = isMounted ? 70 : 40;

  // Animation frame state for spritesheet
  const [currentFrame, setCurrentFrame] = useState(0);
  const [animationCounter, setAnimationCounter] = useState(0);
  const totalFrames = 9; // 9 columns in the spritesheet

  // Spritesheet dimensions (4000x420)
  const spritesheetWidth = 4000;
  const spritesheetHeight = 420;
  const frameWidth = spritesheetWidth / totalFrames;
  const frameHeight = spritesheetHeight;

  // Display size for spritesheet (larger than player container)
  const spritesheetDisplayWidth = playerSize * 1.2; // 1.2x larger than container
  const spritesheetDisplayHeight = playerSize * 1.2; // 1.2x larger than container

  // Attack animation state
  const [isAttackAnimating, setIsAttackAnimating] = useState(false);
  const [isCompletingAttack, setIsCompletingAttack] = useState(false);

  // Image loading state
  const [imagesLoaded, setImagesLoaded] = useState({
    run1: false,
    run2: false,
    run3: false,
    idle1: false,
    idle2: false,
    idle3: false,
  });

  // Update animation frame
  useEffect(() => {
    if (!isMoving || isMounted) return;

    const frameInterval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 120); // Animation speed

    return () => clearInterval(frameInterval);
  }, [isMoving, isMounted, totalFrames]);

  // Reset frame when not moving
  useEffect(() => {
    if (!isMoving) {
      setCurrentFrame(0);
    }
  }, [isMoving]);

  // For idle animation boomerang effect
  useEffect(() => {
    const animInterval = setInterval(() => {
      // Calculate frame in boomerang pattern
      const cycle = totalFrames * 2 - 2;
      const position = animationCounter % cycle;
      const newFrame = position < totalFrames ? position : cycle - position;

      setCurrentFrame(newFrame);
      setAnimationCounter((prev) => prev + 1);
    }, 350); // Adjust timing as needed

    return () => clearInterval(animInterval);
  }, [animationCounter, totalFrames]);

  const getPlayerAnimation = () => {
    if (isMounted) {
      if (player.isAttacking) {
        return "https://i.imgur.com/kKlHrHo.gif";
      }
      if (isMoving) {
        if (facingUp) {
          return "https://imgur.com/Gg4K2LS.gif";
        }
        return "https://i.imgur.com/w1NBTZT.gif";
      }
      return "https://i.imgur.com/mdlONHf.gif";
    }

    // For unmounted player - hide idle animation when attacking
    if (player.isAttacking) {
      return null; // Don't show idle animation when attacking
    }

    // Use spritesheet for movement when not mounted
    if (isMoving) {
      return null; // We'll handle this with the spritesheet below
    }

    // Return null for idle animation - we'll use layered sprites instead
    return null;
  };

  const playerAnimation = getPlayerAnimation();

  // Determine sprite flip based on movement direction
  const getSpriteTransform = () => {
    if (!isMoving || isMounted) return "none";

    // For left movement, use normal sprite (character faces left in sprite)
    // For right movement, flip the sprite
    if (facingRight) {
      return "scaleX(-1)";
    }

    return "none";
  };

  // Check if sword aura is active
  const isSwordAuraActive = player.buffs?.swordAura?.active || false;

  // Effect to track attack state
  useEffect(() => {
    if (player.isAttacking && !isAttackAnimating) {
      setIsAttackAnimating(true);
    }
  }, [player.isAttacking, isAttackAnimating]);

  // Modify your idle animation effect to prevent running during attacks
  useEffect(() => {
    // Skip idle animation when attacking
    if (isAttackAnimating || player.isAttacking) return;

    const animInterval = setInterval(() => {
      // Calculate frame in boomerang pattern
      const cycle = totalFrames * 2 - 2;
      const position = animationCounter % cycle;
      const newFrame = position < totalFrames ? position : cycle - position;

      setCurrentFrame(newFrame);
      setAnimationCounter((prev) => prev + 1);
    }, 350); // Adjust timing as needed

    return () => clearInterval(animInterval);
  }, [animationCounter, totalFrames, isAttackAnimating, player.isAttacking]);

  // Add this effect to track attack state transitions
  useEffect(() => {
    if (player.isAttacking) {
      // When attack starts
      setIsCompletingAttack(false);
    } else if (
      !player.isAttacking &&
      !isCompletingAttack &&
      player.attackSequence > 0
    ) {
      // When attack state ends but animation should continue
      setIsCompletingAttack(true);
    }
  }, [player.isAttacking, player.attackSequence]);

  // Preload images
  useEffect(() => {
    const loadImage = (src: string, key: keyof typeof imagesLoaded) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded((prev) => ({ ...prev, [key]: true }));
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
      };
    };

    loadImage(warriorRun1, "run1");
    loadImage(warriorRun2, "run2");
    loadImage(warriorRun3, "run3");
    loadImage(warriorIdle1, "idle1");
    loadImage(warriorIdle2, "idle2");
    loadImage(warriorIdle3, "idle3");
  }, []);

  // Check if all images are loaded
  const allImagesLoaded = Object.values(imagesLoaded).every(Boolean);

  if (!allImagesLoaded) {
    // Show a placeholder or loading animation while images are loading
    return <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>;
  }

  return (
    <div
      className="absolute"
      style={{
        left: player.position.x - playerSize / 2,
        top: player.position.y - playerSize / 2,
        width: playerSize,
        height: playerSize,
        transform: "perspective(2000px) rotateX(35deg)",
        transformStyle: "preserve-3d",
        zIndex: Math.floor(player.position.y),
        animation: isMoving ? "playerWalk 0.6s infinite" : "none",
      }}
    >
      {/* Dynamic lighting effect */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)",
          animation: "playerGlow 2s infinite",
          zIndex: 2,
        }}
      />

      {/* Name and Level display */}
      <div
        className="absolute whitespace-nowrap font-semibold player-info-text flex flex-col items-center"
        style={{
          left: "50%",
          top: "-35px",
          transform: "translateX(-50%) translateZ(20px) rotateX(-35deg)",
          transformOrigin: "center bottom",
          textShadow: "2px 2px 0 rgba(0,0,0,0.8)",
          fontSize: "12px",
          letterSpacing: "0.5px",
          zIndex: 100,
          fontFamily: 'GameFont, "Press Start 2P", monospace',
        }}
      >
        <div className="flex items-center gap-1">
          <span className="text-blue-400">Lv{player.level}</span>
          <span className="text-green-400">{player.name}</span>
        </div>
      </div>

      {/* Player sprite - either GIF or layered spritesheet */}
      {playerAnimation ? (
        // Use GIF for mounted player
        <div
          className="absolute inset-0"
          style={{
            transform: "rotateX(-35deg)",
            transformOrigin: "center bottom",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            zIndex: 3,
          }}
        >
          <img
            src={playerAnimation}
            alt="Player"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: `scaleX(${facingLeft ? -1 : 1})`,
              transformOrigin: "center",
              imageRendering: "pixelated",
              filter:
                player.isAttacking && isMounted
                  ? "brightness(1.2) contrast(1.1)"
                  : "none",
              transition: "filter 0.2s ease-out",
            }}
          />
        </div>
      ) : isMoving && !isMounted ? (
        // Use layered spritesheet system for unmounted movement
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: spritesheetDisplayWidth,
            height: spritesheetDisplayHeight,
            transform: "translate(-50%, -50%) rotateX(-35deg)",
            transformOrigin: "center bottom",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            zIndex: 3,
          }}
        >
          {/* Layer 1: Base layer (1.png) - Always visible */}
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${warriorRun1})`,
              backgroundSize: `${
                totalFrames * spritesheetDisplayWidth
              }px ${spritesheetDisplayHeight}px`,
              backgroundPosition: `-${
                currentFrame * spritesheetDisplayWidth
              }px 0px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transform: getSpriteTransform(),
              transformOrigin: "center",
              transition: "transform 0.1s ease-out",
              zIndex: 1,
            }}
          />

          {/* Layer 2: Sword Aura Effect (3.png) - Only visible when sword aura is active */}
          {isSwordAuraActive && (
            <div
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${warriorRun3})`,
                backgroundSize: `${
                  totalFrames * spritesheetDisplayWidth
                }px ${spritesheetDisplayHeight}px`,
                backgroundPosition: `-${
                  currentFrame * spritesheetDisplayWidth
                }px 0px`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                transform: getSpriteTransform(),
                transformOrigin: "center",
                transition: "transform 0.1s ease-out",
                zIndex: 2,
                filter:
                  "brightness(1.2) contrast(1.1) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
              }}
            />
          )}

          {/* Layer 3: Top layer (2.png) - Always visible, on top */}
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${warriorRun2})`,
              backgroundSize: `${
                totalFrames * spritesheetDisplayWidth
              }px ${spritesheetDisplayHeight}px`,
              backgroundPosition: `-${
                currentFrame * spritesheetDisplayWidth
              }px 0px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transform: getSpriteTransform(),
              transformOrigin: "center",
              transition: "transform 0.1s ease-out",
              zIndex: 3,
            }}
          />
        </div>
      ) : !isMounted && !player.isAttacking ? (
        // Use layered spritesheet system for unmounted idle
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: spritesheetDisplayWidth,
            height: spritesheetDisplayHeight,
            transform: "translate(-50%, -50%) rotateX(-35deg)",
            transformOrigin: "center bottom",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            zIndex: 3,
          }}
        >
          {/* Layer 1: Base layer (1.png) - Always visible */}
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${warriorIdle1})`,
              backgroundSize: `${
                totalFrames * spritesheetDisplayWidth
              }px ${spritesheetDisplayHeight}px`,
              backgroundPosition: `-${
                currentFrame * spritesheetDisplayWidth
              }px 0px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transform: `scaleX(${facingLeft ? 1 : -1})`,
              transformOrigin: "center",
              zIndex: 1,
            }}
          />

          {/* Layer 2: Weapon layer (2.png) - Always visible */}
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${warriorIdle2})`,
              backgroundSize: `${
                totalFrames * spritesheetDisplayWidth
              }px ${spritesheetDisplayHeight}px`,
              backgroundPosition: `-${
                currentFrame * spritesheetDisplayWidth
              }px 0px`,
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
              transform: `scaleX(${facingLeft ? 1 : -1})`,
              transformOrigin: "center",
              zIndex: 2,
            }}
          />

          {/* Layer 3: Effect layer (3.png) - Only visible when sword aura is active */}
          {isSwordAuraActive && (
            <div
              className="absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url(${warriorIdle3})`,
                backgroundSize: `${
                  totalFrames * spritesheetDisplayWidth
                }px ${spritesheetDisplayHeight}px`,
                backgroundPosition: `-${
                  currentFrame * spritesheetDisplayWidth
                }px 0px`,
                backgroundRepeat: "no-repeat",
                imageRendering: "pixelated",
                transform: `scaleX(${facingLeft ? 1 : -1})`,
                transformOrigin: "center",
                zIndex: 3,
                filter:
                  "brightness(1.2) contrast(1.1) drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))",
              }}
            />
          )}
        </div>
      ) : null}

      {/* Layered attack sprites for unmounted player - only show when attacking */}
      {!isMounted &&
        (player.isAttacking || isCompletingAttack) &&
        player.attackSequence > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "rotateX(-35deg)",
              transformOrigin: "center bottom",
              zIndex: 3,
            }}
          >
            <LayeredSprite
              position={{ x: playerSize / 2, y: playerSize / 2 }}
              attackSequence={player.attackSequence}
              isAttacking={player.isAttacking || isCompletingAttack}
              facingLeft={facingLeft}
              size={{ width: 60, height: 60 }}
              onAnimationComplete={() => {
                setIsCompletingAttack(false);
                // Notify the movement system if needed
                console.log("Attack animation fully completed");
              }}
              isSwordAuraActive={player.buffs?.swordAura?.active || false}
            />
          </div>
        )}

      {/* Dynamic shadow */}
      <div
        className="absolute bottom-0 left-1/2"
        style={{
          width: playerSize * 0.8,
          height: playerSize * 0.2,
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 70%)",
          transform: "rotateX(90deg) translateY(50%)",
          transformOrigin: "center top",
          animation: isMoving ? "playerShadowPulse 0.6s infinite" : "none",
          zIndex: 1,
        }}
      />

      {/* Snow trail effect when mounted */}
      {isMounted && isMoving && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div
            className="snow-trail"
            style={{
              width: `${playerSize * 1.5}px`,
              height: "20px",
              position: "relative",
              zIndex: 0,
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="snow-particle"
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "8px",
                  background: "white",
                  borderRadius: "50%",
                  opacity: 0.8 - i * 0.1,
                  transform: `translate(${(i - 4) * 10}px, ${
                    Math.sin(i) * 5
                  }px)`,
                  animation: `snowTrail 0.5s infinite ${i * 0.1}s`,
                  filter: "blur(1px)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes snowTrail {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.8;
            }
            100% {
              transform: translate(${
                facingLeft ? "20px" : "-20px"
              }, 10px) scale(0.5);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Player;
