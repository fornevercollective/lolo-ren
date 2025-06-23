import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Play, Pause, RotateCcw, Maximize2, Settings, Sparkles } from 'lucide-react';

interface GaussianSplatsViewerProps {
  depthData?: Float32Array | null;
  normalData?: Float32Array | null;
  isProcessing: boolean;
  params: {
    depthScale: number;
    smoothing: number;
    threshold: number;
    normalStrength: number;
  };
}

export function GaussianSplatsViewer({ 
  depthData, 
  normalData, 
  isProcessing, 
  params
}: GaussianSplatsViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRendering, setIsRendering] = useState(false);
  const [splatCount, setSplatCount] = useState(50000);
  const [splatScale, setSplatScale] = useState(1.0);
  const [opacity, setOpacity] = useState(0.8);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [renderStats, setRenderStats] = useState({
    fps: 0,
    splats: 0,
    renderTime: 0
  });

  // Canvas dimensions
  const width = 640;
  const height = 480;

  // Mock Gaussian splat data generation
  const generateGaussianSplats = () => {
    if (!depthData || !normalData) return [];
    
    const splats = [];
    const step = Math.max(1, Math.floor(depthData.length / splatCount));
    
    for (let i = 0; i < depthData.length; i += step) {
      const depth = depthData[i] * params.depthScale;
      const nx = (normalData[i * 3] || 0) * params.normalStrength;
      const ny = (normalData[i * 3 + 1] || 0) * params.normalStrength;
      const nz = (normalData[i * 3 + 2] || 0) * params.normalStrength;
      
      // Convert to 3D position
      const x = (i % width) / width - 0.5;
      const y = Math.floor(i / width) / height - 0.5;
      const z = depth * 0.001;
      
      splats.push({
        position: [x, y, z],
        normal: [nx, ny, nz],
        scale: splatScale * (0.8 + Math.random() * 0.4) * params.smoothing,
        opacity: opacity * (0.7 + Math.random() * 0.3),
        color: [
          Math.min(255, Math.max(0, 128 + nx * 127)),
          Math.min(255, Math.max(0, 128 + ny * 127)),
          Math.min(255, Math.max(0, 128 + nz * 127))
        ]
      });
    }
    
    return splats;
  };

  const renderGaussianSplats = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const startTime = performance.now();
    
    // Clear canvas with tactical background
    ctx.fillStyle = '#0a0b0d';
    ctx.fillRect(0, 0, width, height);
    
    if (!depthData || !normalData) {
      // Draw grid placeholder
      ctx.strokeStyle = '#2563eb20';
      ctx.lineWidth = 1;
      
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#2563eb';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('GAUSSIAN SPLATS RENDERER', width / 2, height / 2 - 20);
      ctx.fillText('AWAITING DEPTH & NORMAL DATA', width / 2, height / 2);
      ctx.fillText('FOR SPLAT GENERATION', width / 2, height / 2 + 20);
      return;
    }
    
    const splats = generateGaussianSplats();
    
    // Sort splats by depth (back to front)
    splats.sort((a, b) => b.position[2] - a.position[2]);
    
    // Render each splat as a gradient circle
    splats.forEach((splat, index) => {
      const [x, y, z] = splat.position;
      const [r, g, b] = splat.color;
      
      // Apply rotation
      const rotX = x * Math.cos(rotation.y) - z * Math.sin(rotation.y);
      const rotZ = x * Math.sin(rotation.y) + z * Math.cos(rotation.y);
      const rotY = y * Math.cos(rotation.x) - rotZ * Math.sin(rotation.x);
      const finalZ = y * Math.sin(rotation.x) + rotZ * Math.cos(rotation.x);
      
      // Project to screen space
      const screenX = (rotX + 0.5) * width;
      const screenY = (rotY + 0.5) * height;
      const size = splat.scale * (1 + finalZ) * 8;
      
      if (screenX >= -size && screenX <= width + size && 
          screenY >= -size && screenY <= height + size) {
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, size
        );
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${splat.opacity})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${splat.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    const renderTime = performance.now() - startTime;
    setRenderStats({
      fps: Math.round(1000 / renderTime),
      splats: splats.length,
      renderTime: Math.round(renderTime * 100) / 100
    });
  };

  const animate = () => {
    if (isRendering) {
      setRotation(prev => ({
        x: prev.x + 0.005,
        y: prev.y + 0.01,
        z: prev.z + 0.003
      }));
      renderGaussianSplats();
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isRendering) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRendering, splatCount, splatScale, opacity]);

  useEffect(() => {
    if (!isRendering) {
      renderGaussianSplats();
    }
  }, [depthData, normalData, splatCount, splatScale, opacity, rotation.x, rotation.y, rotation.z, params]);

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 lattice-container">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              GAUSSIAN SPLATS RENDERER
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {renderStats.splats.toLocaleString()} SPLATS
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {renderStats.fps} FPS
              </Badge>
              <Badge variant="outline" className={`font-mono text-xs ${isProcessing ? 'text-tactical-amber' : 'text-lattice-secondary'}`}>
                {isProcessing ? 'PROCESSING' : 'STANDBY'}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-mono">SPLAT COUNT: {splatCount.toLocaleString()}</label>
              <Slider
                value={[splatCount]}
                onValueChange={(value) => setSplatCount(value[0])}
                min={1000}
                max={100000}
                step={1000}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-mono">SPLAT SCALE: {splatScale.toFixed(1)}</label>
              <Slider
                value={[splatScale]}
                onValueChange={(value) => setSplatScale(value[0])}
                min={0.1}
                max={3.0}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-mono">OPACITY: {Math.round(opacity * 100)}%</label>
              <Slider
                value={[opacity]}
                onValueChange={(value) => setOpacity(value[0])}
                min={0.1}
                max={1.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isRendering ? "destructive" : "default"}
              size="sm"
              onClick={() => setIsRendering(!isRendering)}
              className="font-mono"
            >
              {isRendering ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isRendering ? "STOP" : "START"} ANIMATION
            </Button>
            
            <Button variant="outline" size="sm" onClick={resetView} className="font-mono">
              <RotateCcw className="w-4 h-4 mr-1" />
              RESET VIEW
            </Button>
            
            <div className="ml-auto text-xs text-muted-foreground font-mono">
              RENDER: {renderStats.renderTime}ms
            </div>
          </div>
        </div>
      </Card>

      {/* Viewer */}
      <Card className="p-4 lattice-container">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto border border-border rounded bg-background"
            style={{ maxHeight: '400px' }}
          />
          
          {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded">
              <div className="text-primary font-mono">PROCESSING SENSOR DATA...</div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="text-xs font-mono">
              3D GAUSSIAN SPLATTING
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}