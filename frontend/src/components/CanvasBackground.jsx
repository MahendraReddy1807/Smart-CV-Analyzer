import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeConfig } from '../config/theme';

/**
 * Animated Canvas Background Component
 * Creates floating particles with connecting lines for AI-themed background
 */
const CanvasBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const lastFrameTime = useRef(0);
  const fpsCounter = useRef(0);
  const frameCount = useRef(0);
  const { isDarkMode } = useTheme();

  // DEBUG MODE - Make canvas very visible for testing
  const DEBUG_MODE = false;

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Performance monitoring
  const shouldSkipFrame = useCallback((currentTime) => {
    const targetFPS = prefersReducedMotion ? 30 : 60;
    const targetFrameTime = 1000 / targetFPS;
    
    if (currentTime - lastFrameTime.current < targetFrameTime) {
      return true;
    }
    
    lastFrameTime.current = currentTime;
    return false;
  }, [prefersReducedMotion]);

  // Particle class definition
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * themeConfig.canvas.speed;
      this.vy = (Math.random() - 0.5) * themeConfig.canvas.speed;
      this.size = Math.random() * 3 + 1.5;
    }

    update(canvasWidth, canvasHeight) {
      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x <= 0 || this.x >= canvasWidth) {
        this.vx *= -1;
        this.x = Math.max(0, Math.min(canvasWidth, this.x));
      }
      if (this.y <= 0 || this.y >= canvasHeight) {
        this.vy *= -1;
        this.y = Math.max(0, Math.min(canvasHeight, this.y));
      }
    }

    draw(ctx, color, opacity) {
      ctx.save();
      ctx.globalAlpha = DEBUG_MODE ? 0.8 : opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize particles with performance considerations
  const initializeParticles = useCallback((canvasWidth, canvasHeight) => {
    const particles = [];
    // Reduce particle count for reduced motion or smaller screens
    const particleCount = prefersReducedMotion 
      ? Math.floor(themeConfig.canvas.particleCount * 0.5)
      : canvasWidth < 768 
        ? Math.floor(themeConfig.canvas.particleCount * 0.7)
        : themeConfig.canvas.particleCount;
        
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(
        Math.random() * canvasWidth,
        Math.random() * canvasHeight
      ));
    }
    particlesRef.current = particles;
  }, [prefersReducedMotion]);

  // Draw connecting lines between nearby particles
  const drawConnections = useCallback((ctx, particles, colors, opacity) => {
    ctx.save();
    ctx.globalAlpha = DEBUG_MODE ? 0.6 : opacity * 0.6; // Make connections more visible
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < themeConfig.canvas.connectionDistance) {
          const alpha = 1 - (distance / themeConfig.canvas.connectionDistance);
          ctx.globalAlpha = DEBUG_MODE ? 0.4 : opacity * alpha * 0.4;
          ctx.strokeStyle = colors[0]; // Use primary color for connections
          ctx.lineWidth = DEBUG_MODE ? 2 : 1.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }, []);

  // Animation loop with performance optimization
  const animate = useCallback((currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip frame if performance is poor or reduced motion is preferred
    if (shouldSkipFrame(currentTime)) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    // Stop animation if reduced motion is preferred and we've rendered a few frames
    if (prefersReducedMotion && frameCount.current > 10) {
      return;
    }

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get current theme colors
    const colors = isDarkMode ? themeConfig.canvas.colors.dark : themeConfig.canvas.colors.light;
    const particles = particlesRef.current;

    // Update and draw particles
    particles.forEach((particle, index) => {
      particle.update(width, height);
      const colorIndex = index % colors.length;
      particle.draw(ctx, colors[colorIndex], themeConfig.canvas.opacity);
    });

    // Draw connections (only if performance is good)
    if (frameCount.current % 2 === 0 || !prefersReducedMotion) {
      drawConnections(ctx, particles, colors, themeConfig.canvas.opacity);
    }

    frameCount.current++;
    animationRef.current = requestAnimationFrame(animate);
  }, [isDarkMode, drawConnections, shouldSkipFrame, prefersReducedMotion]);

  // Resize canvas to match container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Reinitialize particles when canvas resizes
    initializeParticles(canvas.width, canvas.height);
  }, [initializeParticles]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial setup
    resizeCanvas();
    
    // Start animation (only if motion is not reduced)
    if (!prefersReducedMotion) {
      animate();
    } else {
      // Render a single static frame for reduced motion
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      const colors = isDarkMode ? themeConfig.canvas.colors.dark : themeConfig.canvas.colors.light;
      const particles = particlesRef.current;

      particles.forEach((particle, index) => {
        const colorIndex = index % colors.length;
        particle.draw(ctx, colors[colorIndex], themeConfig.canvas.opacity * 0.5);
      });
    }

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [resizeCanvas, animate]);

  // Restart animation when theme changes
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
  }, [isDarkMode, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'transparent',
      }}
      aria-hidden="true"
    />
  );
};

export default CanvasBackground;