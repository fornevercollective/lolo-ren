import React, { useEffect, useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Play, Pause, RotateCcw, Download, Upload, Loader, Sparkles } from 'lucide-react';

interface LumaSplatsViewerProps {
  depthData: Float32Array | null;
  normalData: Float32Array | null;
  isProcessing: boolean;
  width: number;
  height: number;
}

export function LumaSplatsViewer({ 
  depthData, 
  normalData, 
  isProcessing, 
  width, 
  height 
}: LumaSplatsViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [qualityLevel, setQualityLevel] = useState('medium');
  const [renderMode, setRenderMode] = useState('neural');
  const [environmentMap, setEnvironmentMap] = useState('studio');
  const [cameraControls, setCameraControls] = useState({
    distance: 5,
    azimuth: 0,
    elevation: 0,
    autoRotate: false
  });
  const [lumaStats, setLumaStats] = useState({
    vertices: 0,
    triangles: 0,
    textures: 0,
    renderTime: 0,
    quality: 'High'
  });

  // Mock LumaSplats data
  const generateLumaSplats = () => {
    if (!depthData || !normalData) return null;
    
    // Simulate loading neural radiance field data
    const vertices = [];
    const colors = [];
    const normals = [];
    
    for (let i = 0; i < depthData.length; i += 4) {
      const depth = depthData[i];
      const nx = normalData[i * 3] || 0;
      const ny = normalData[i * 3 + 1] || 0;
      const nz = normalData[i * 3 + 2] || 0;
      
      // Convert to 3D coordinates
      const x = ((i % width) / width - 0.5) * 2;
      const y = (Math.floor(i / width) / height - 0.5) * 2;
      const z = depth * 0.01;
      
      vertices.push(x, y, z);
      colors.push(
        0.5 + nx * 0.5,
        0.5 + ny * 0.5,
        0.5 + nz * 0.5
      );
      normals.push(nx, ny, nz);
    }
    
    return {
      vertices: new Float32Array(vertices),
      colors: new Float32Array(colors),
      normals: new Float32Array(normals)
    };
  };

  const renderLumaSplats = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const startTime = performance.now();
    
    // Clear with environment-based background
    const bgColors = {
      studio: '#1a1a1a',
      outdoor: '#87CEEB',
      indoor: '#2c2c2c',
      custom: '#000'
    };
    
    ctx.fillStyle = bgColors[environmentMap as keyof typeof bgColors] || '#000';
    ctx.fillRect(0, 0, width, height);
    
    if (!depthData || !normalData) {
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Loading LumaSplats data...', width / 2, height / 2);
      ctx.fillText('Neural rendering pipeline ready', width / 2, height / 2 + 20);
      return;
    }
    
    const splatsData = generateLumaSplats();
    if (!splatsData) return;
    
    // Render neural radiance field visualization
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 100;
    
    // Draw point cloud with neural rendering effects
    ctx.globalCompositeOperation = 'screen';
    
    for (let i = 0; i < splatsData.vertices.length; i += 9) {
      const x = splatsData.vertices[i];
      const y = splatsData.vertices[i + 1];
      const z = splatsData.vertices[i + 2];
      
      const r = Math.floor(splatsData.colors[i] * 255);
      const g = Math.floor(splatsData.colors[i + 1] * 255);
      const b = Math.floor(splatsData.colors[i + 2] * 255);
      
      // Apply camera transformations
      const rotX = x * Math.cos(cameraControls.azimuth) - z * Math.sin(cameraControls.azimuth);
      const rotZ = x * Math.sin(cameraControls.azimuth) + z * Math.cos(cameraControls.azimuth);
      const rotY = y * Math.cos(cameraControls.elevation) - rotZ * Math.sin(cameraControls.elevation);
      
      // Project to screen
      const perspective = cameraControls.distance / (cameraControls.distance + rotZ);
      const screenX = centerX + rotX * scale * perspective;
      const screenY = centerY + rotY * scale * perspective;
      
      if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
        const size = Math.max(1, 4 * perspective);
        const alpha = Math.min(1, perspective * 0.8);
        
        // Neural rendering glow effect
        const gradient = ctx.createRadialGradient(
          screenX, screenY, 0,
          screenX, screenY, size * 2
        );
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core point
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.globalCompositeOperation = 'source-over';
    
    const renderTime = performance.now() - startTime;
    setLumaStats({
      vertices: splatsData.vertices.length / 3,
      triangles: Math.floor(splatsData.vertices.length / 9),
      textures: 4,
      renderTime: Math.round(renderTime * 100) / 100,
      quality: qualityLevel === 'high' ? 'Ultra' : qualityLevel === 'medium' ? 'High' : 'Medium'
    });
  };

  const animate = () => {
    if (isRendering) {
      if (cameraControls.autoRotate) {
        setCameraControls(prev => ({
          ...prev,
          azimuth: prev.azimuth + 0.01
        }));
      }
      renderLumaSplats();
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
  }, [isRendering, cameraControls]);

  useEffect(() => {
    if (!isRendering) {
      renderLumaSplats();
    }
  }, [depthData, normalData, qualityLevel, renderMode, environmentMap]);

  const resetCamera = () => {
    setCameraControls({
      distance: 5,
      azimuth: 0,
      elevation: 0,
      autoRotate: false
    });
  };

  const loadLumaSplats = async () => {
    setIsLoading(true);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              LumaSplats Three.js Renderer
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {lumaStats.vertices.toLocaleString()} vertices
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {lumaStats.quality}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm">Quality Level</label>
              <Select value={qualityLevel} onValueChange={setQualityLevel}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fast)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Render Mode</label>
              <Select value={renderMode} onValueChange={setRenderMode}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neural">Neural Rendering</SelectItem>
                  <SelectItem value="splats">Gaussian Splats</SelectItem>
                  <SelectItem value="hybrid">Hybrid Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Environment</label>
              <Select value={environmentMap} onValueChange={setEnvironmentMap}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Camera Distance: {cameraControls.distance.toFixed(1)}</label>
              <Slider
                value={[cameraControls.distance]}
                onValueChange={(value) => setCameraControls(prev => ({ ...prev, distance: value[0] }))}
                min={1}
                max={10}
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
              disabled={isLoading}
            >
              {isRendering ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isRendering ? "Stop" : "Start"} Render
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetCamera}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset Camera
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCameraControls(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
            >
              Auto Rotate
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadLumaSplats}
              disabled={isLoading}
            >
              {isLoading ? <Loader className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              Load Scene
            </Button>
            
            <div className="ml-auto text-xs text-muted-foreground font-mono">
              Render: {lumaStats.renderTime}ms | {lumaStats.triangles.toLocaleString()} tris
            </div>
          </div>
        </div>
      </Card>

      {/* Viewer */}
      <Card className="p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-auto border rounded"
            style={{ maxHeight: '400px' }}
          />
          
          {(isProcessing || isLoading) && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
              <div className="text-white font-medium flex items-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                {isLoading ? 'Loading LumaSplats...' : 'Processing...'}
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant="secondary" className="text-xs">
              Neural Radiance Fields
            </Badge>
            <Badge variant="outline" className="text-xs">
              LumaSplats v3
            </Badge>
          </div>
          
          <div className="absolute bottom-2 left-2 text-xs text-white/70 font-mono">
            Cam: {cameraControls.azimuth.toFixed(2)}° / {cameraControls.elevation.toFixed(2)}°
          </div>
        </div>
      </Card>
    </div>
  );
}