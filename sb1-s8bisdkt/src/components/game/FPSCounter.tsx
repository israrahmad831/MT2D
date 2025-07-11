import React, { useState, useEffect, useRef } from 'react';

const FPSCounter: React.FC = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const tick = () => {
      frameCount.current += 1;
      animationFrameId.current = requestAnimationFrame(tick);
    };

    const calculateFPS = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      const currentFPS = Math.round((frameCount.current * 1000) / deltaTime);
      
      setFps(currentFPS);
      frameCount.current = 0;
      lastTimeRef.current = currentTime;
    };

    // Start frame counting
    animationFrameId.current = requestAnimationFrame(tick);

    // Update FPS every second
    const intervalId = setInterval(calculateFPS, 1000);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-50 px-3 py-1 rounded">
      <span className="text-yellow-400 font-mono font-bold">
        {fps} FPS
      </span>
    </div>
  );
};

export default FPSCounter;