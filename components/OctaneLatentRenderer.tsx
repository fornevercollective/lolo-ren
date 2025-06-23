import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Box, Zap, Brain, Sparkles, Settings, Play, Pause } from 'lucide-react';

interface OctaneLatentRendererProps {
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

export function OctaneLatentRenderer({ 
  depthData, 
  normalData, 
  isProcessing,
  params
}: OctaneLatentRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [latentParams, setLatentParams] = useState({
    latentDimensions: 512,
    encodingStrength: 0.8,
    decodingIterations: 50,
    octaneQuality: 0.9,
    materialComplexity: 0.7,
    lightingModel: 'pathtracing'
  });
  const [renderStatus, setRenderStatus] = useState<'idle' | 'encoding' | 'rendering' | 'complete'>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default dimensions
  const width = 640;
  const height = 480;

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      // Clear canvas
      ctx.fillStyle = '#0a0b0d';
      ctx.fillRect(0, 0, width, height);

      if (!depthData || !normalData) {
        // Draw placeholder with lattice grid
        ctx.strokeStyle = '#2563eb20';
        ctx.lineWidth = 1;
        
        // Draw grid
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

        // Draw center indicator
        ctx.fillStyle = '#2563eb';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('OCTANE LATENT RENDERER', width / 2, height / 2 - 20);
        ctx.fillText('AWAITING DEPTH & NORMAL DATA', width / 2, height / 2);
        ctx.fillText('FOR LATENT SPACE ENCODING', width / 2, height / 2 + 20);
        return;
      }

      // Validate data lengths to prevent errors
      const expectedLength = width * height;
      const actualDepthLength = depthData.length;
      const actualNormalLength = normalData.length;

      if (actualDepthLength === 0 || actualNormalLength === 0) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('INVALID DATA: EMPTY ARRAYS', width / 2, height / 2);
        return;
      }

      // Create advanced octane-style rendered visualization
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Process data with bounds checking
      const dataLength = Math.min(actualDepthLength, expectedLength);
      
      for (let i = 0; i < dataLength; i++) {
        const depth = depthData[i] || 0;
        const normalX = (i * 3 < actualNormalLength) ? normalData[i * 3] : 0;
        const normalY = (i * 3 + 1 < actualNormalLength) ? normalData[i * 3 + 1] : 0;
        const normalZ = (i * 3 + 2 < actualNormalLength) ? normalData[i * 3 + 2] : 0;

        const x = i % width;
        const y = Math.floor(i / width);
        const pixelIndex = (y * width + x) * 4;

        if (pixelIndex >= data.length - 3) continue;

        // Advanced latent space color mapping with octane-style materials
        const latentEncoding = Math.sin(depth * latentParams.encodingStrength * params.depthScale + normalX * 2) * 
                              Math.cos(normalY * 3 + normalZ * 1.5);
        
        // Octane-style material properties
        const metallic = Math.abs(normalZ) * latentParams.materialComplexity;
        const roughness = (1 - Math.abs(latentEncoding)) * 0.8;
        const subsurface = Math.max(0, latentEncoding) * 0.6;

        // Advanced color computation with latent features
        const baseColor = {
          r: Math.abs(Math.sin(latentEncoding * 4 + metallic)),
          g: Math.abs(Math.cos(latentEncoding * 3 + roughness * 2)),
          b: Math.abs(Math.sin(latentEncoding * 2 + subsurface * 3))
        };

        // Octane-style lighting simulation
        const lightDirection = { x: 0.5, y: 0.3, z: 0.8 };
        const lightIntensity = Math.max(0, 
          normalX * lightDirection.x + 
          normalY * lightDirection.y + 
          normalZ * lightDirection.z
        ) * params.normalStrength;

        // Material response with latent space modulation
        const diffuse = lightIntensity * (1 - metallic);
        const specular = Math.pow(lightIntensity, 32) * metallic * (1 - roughness);
        const ambient = 0.1 * latentParams.octaneQuality;

        // Final color with octane-style tone mapping
        const finalR = Math.min(255, (baseColor.r * diffuse + specular + ambient) * 255 * latentParams.octaneQuality);
        const finalG = Math.min(255, (baseColor.g * diffuse + specular * 0.9 + ambient) * 255 * latentParams.octaneQuality);
        const finalB = Math.min(255, (baseColor.b * diffuse + specular * 0.8 + ambient) * 255 * latentParams.octaneQuality);

        data[pixelIndex] = Math.max(0, Math.min(255, finalR));
        data[pixelIndex + 1] = Math.max(0, Math.min(255, finalG));
        data[pixelIndex + 2] = Math.max(0, Math.min(255, finalB));
        data[pixelIndex + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);

      // Add octane-style post-processing overlay
      if (isRendering) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Render progress indicator
      if (renderProgress > 0 && renderProgress < 100) {
        ctx.fillStyle = 'rgba(37, 99, 235, 0.8)';
        ctx.fillRect(0, height - 4, (width * renderProgress) / 100, 4);
      }

      // Clear any previous errors
      setError(null);

    } catch (err) {
      console.error('OctaneLatentRenderer render error:', err);
      setError(err instanceof Error ? err.message : 'Rendering error occurred');
    }
  }, [depthData, normalData, isProcessing, latentParams, isRendering, renderProgress, params]);

  const startOctaneRender = () => {
    if (!depthData || !normalData) return;
    
    setIsRendering(true);
    setRenderStatus('encoding');
    setRenderProgress(0);

    // Simulate latent encoding process
    const encodingInterval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 30) {
          clearInterval(encodingInterval);
          setRenderStatus('rendering');
          
          // Start octane rendering simulation
          const renderingInterval = setInterval(() => {
            setRenderProgress(prev => {
              if (prev >= 100) {
                clearInterval(renderingInterval);
                setRenderStatus('complete');
                setIsRendering(false);
                setTimeout(() => {
                  setRenderStatus('idle');
                  setRenderProgress(0);
                }, 2000);
                return 100;
              }
              return prev + Math.random() * 3;
            });
          }, 100);
          
          return 30;
        }
        return prev + Math.random() * 2;
      });
    }, 50);
  };

  const getStatusColor = () => {
    switch (renderStatus) {
      case 'encoding': return 'text-tactical-amber';
      case 'rendering': return 'text-tactical-blue';
      case 'complete': return 'text-tactical-green';
      default: return 'text-lattice-secondary';
    }
  };

  const getStatusText = () => {
    switch (renderStatus) {
      case 'encoding': return 'LATENT ENCODING';
      case 'rendering': return 'OCTANE RENDERING';
      case 'complete': return 'RENDER COMPLETE';
      default: return 'READY';
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Card className="lattice-container border-tactical-red">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-tactical-red">
              <Box className="w-4 h-4" />
              <span className="text-sm font-mono">RENDER ERROR: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Octane Render Controls */}
      <Card className="lattice-container">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-primary text-sm">
              <Box className="w-4 h-4" />
              OCTANE LATENT CONTROLS
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-mono text-xs ${getStatusColor()}`}>
                {getStatusText()}
              </Badge>
              <Button
                size="sm"
                onClick={startOctaneRender}
                disabled={!depthData || !normalData || isRendering}
                className="h-7 px-2 text-xs font-mono"
              >
                {isRendering ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {isRendering ? 'RENDERING' : 'RENDER'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    LATENT DIMENSIONS
                  </span>
                  <span className="font-mono">{latentParams.latentDimensions}</span>
                </label>
                <Slider
                  value={[latentParams.latentDimensions]}
                  onValueChange={([value]) => setLatentParams(prev => ({ ...prev, latentDimensions: value }))}
                  min={128}
                  max={1024}
                  step={64}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    ENCODING STRENGTH
                  </span>
                  <span className="font-mono">{latentParams.encodingStrength.toFixed(2)}</span>
                </label>
                <Slider
                  value={[latentParams.encodingStrength]}
                  onValueChange={([value]) => setLatentParams(prev => ({ ...prev, encodingStrength: value }))}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    DECODE ITERATIONS
                  </span>
                  <span className="font-mono">{latentParams.decodingIterations}</span>
                </label>
                <Slider
                  value={[latentParams.decodingIterations]}
                  onValueChange={([value]) => setLatentParams(prev => ({ ...prev, decodingIterations: value }))}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    OCTANE QUALITY
                  </span>
                  <span className="font-mono">{latentParams.octaneQuality.toFixed(2)}</span>
                </label>
                <Slider
                  value={[latentParams.octaneQuality]}
                  onValueChange={([value]) => setLatentParams(prev => ({ ...prev, octaneQuality: value }))}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="flex items-center justify-between text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Box className="w-3 h-3" />
                    MATERIAL COMPLEXITY
                  </span>
                  <span className="font-mono">{latentParams.materialComplexity.toFixed(2)}</span>
                </label>
                <Slider
                  value={[latentParams.materialComplexity]}
                  onValueChange={([value]) => setLatentParams(prev => ({ ...prev, materialComplexity: value }))}
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="pt-2">
                <label className="text-muted-foreground mb-2 block">
                  LIGHTING MODEL
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pathtracing', 'direct'].map((model) => (
                    <Button
                      key={model}
                      variant={latentParams.lightingModel === model ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLatentParams(prev => ({ ...prev, lightingModel: model }))}
                      className="h-7 text-xs font-mono"
                    >
                      {model.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Octane Render Viewport */}
      <Card className="lattice-container">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary text-sm">OCTANE LATENT RENDER</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              {renderProgress > 0 && renderProgress < 100 && (
                <span className="font-mono text-muted-foreground">
                  {renderProgress.toFixed(1)}%
                </span>
              )}
              <Badge variant="secondary" className="font-mono">
                {latentParams.latentDimensions}D LATENT
              </Badge>
              <Badge variant="secondary" className="font-mono">
                {latentParams.lightingModel.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                {width}×{height}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full border border-border rounded"
              style={{ aspectRatio: `${width}/${height}` }}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-mono">PROCESSING SENSOR DATA...</span>
                </div>
              </div>
            )}
            {isRendering && (
              <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded border border-border">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-tactical-blue rounded-full animate-pulse"></div>
                  <span className="font-mono text-tactical-blue">OCTANE RENDERING</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}