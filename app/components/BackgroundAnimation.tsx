// app/components/BackgroundAnimation.tsx
'use client';

import React, { useRef, useEffect } from 'react';

/**
 * This component renders a canvas element and draws a classic "starfield"
 * animation on it. It's designed to be used as a dynamic background.
 */
const BackgroundAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; z: number }[] = [];
    const numStars = 500; // Adjust for more/fewer stars
    let animationFrameId: number;

    // Initializes or resets the canvas and star positions
    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width,
          y: (Math.random() - 0.5) * canvas.height,
          z: Math.random() * canvas.width,
        });
      }
    };

    // The main animation loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      
      // Center the origin point for a "warp drive" effect
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      stars.forEach(star => {
        star.z -= 1.5; // Adjust for faster/slower star speed

        // If a star goes behind the viewer, reset its position far away
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * canvas.width * 1.5;
          star.y = (Math.random() - 0.5) * canvas.height * 1.5;
          star.z = canvas.width;
        }

        // Project the 3D position to a 2D screen position
        const k = 128 / star.z;
        const px = star.x * k;
        const py = star.y * k;
        
        // Calculate star size based on its distance
        const size = (1 - star.z / canvas.width) * 2.5;

        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(draw);
    };

    // Redraw canvas on window resize to keep it responsive
    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      setup();
      draw();
    };

    // Initial setup and start of the animation
    setup();
    draw();

    window.addEventListener('resize', handleResize);

    // Cleanup function to stop animation and remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return <canvas id="background-animation-canvas" ref={canvasRef} />;
};

export default BackgroundAnimation;
