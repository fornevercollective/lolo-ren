import React, { useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface DepthVisualizerProps {
  depthData: Float32Array | null;
  isProcessing: boolean;
  width: number;
  height: number;
}

export function DepthVisualizer({ depthData, isProcessing, width, height }: DepthVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorBarRef = useRef<HTMLCanvasElement>(null);

  // Color mapping for depth visualization
  const depthToColor = (depth: number): [number, number, number] => {
    // Normalize depth to 0-1 range
    const normalizedDepth = Math.max(0, Math.min(1, depth));
    
    // Use a jet colormap for depth visualization
    let r, g, b;
    
    if (normalizedDepth < 0.25) {
      // Blue to Cyan
      r = 0;
      g = normalizedDepth * 4 * 255;
      b = 255;
    } else if (normalizedDepth < 0.5) {
      // Cyan to Green
      r = 0;
      g = 255;
      b = (0.5 - normalizedDepth) * 4 * 255;
    } else if (normalizedDepth < 0.75) {
      // Green to Yellow
      r = (normalizedDepth - 0.5) * 4 * 255;
      g = 255;
      b = 0;
    } else {
      // Yellow to Red
      r = 255;
      g = (1 - normalizedDepth) * 4 * 255;
      b = 0;
    }
    
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  // Helper function to calculate statistics safely
  const calculateDepthStats = (data: Float32Array) => {
    let minDepth = Infinity;
    let maxDepth = -Infinity;
    let sum = 0;
    let validCount = 0;

    for (let i = 0; i < data.length; i++) {
      const value = data[i];
      if (value > 0) {
        minDepth = Math.min(minDepth, value);
        maxDepth = Math.max(maxDepth, value);
        sum += value;
        validCount++;
      }
    }

    return {
      min: validCount > 0 ? minDepth : 0,
      max: validCount > 0 ? maxDepth : 0,
      mean: validCount > 0 ? sum / validCount : 0,
      validCount
    };
  };

  // Render depth map
  const renderDepthMap = () => {
    if (!canvasRef.current || !depthData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Calculate min and max depth for normalization
    const stats = calculateDepthStats(depthData);
    const { min: minDepth, max: maxDepth } = stats;

    // Render depth data
    for (let i = 0; i < depthData.length; i++) {
      const depth = depthData[i];
      const normalizedDepth = depth === 0 ? 0 : (depth - minDepth) / (maxDepth - minDepth);
      
      const [r, g, b] = depthToColor(normalizedDepth);
      
      const pixelIndex = i * 4;
      data[pixelIndex] = r;     // R
      data[pixelIndex + 1] = g; // G
      data[pixelIndex + 2] = b; // B
      data[pixelIndex + 3] = depth === 0 ? 0 : 255; // A
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Render color bar legend
  const renderColorBar = () => {
    if (!colorBarRef.current) return;

    const canvas = colorBarRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barWidth = canvas.width;
    const barHeight = canvas.height;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, barWidth, 0);
    gradient.addColorStop(0, 'rgb(0, 0, 255)');     // Blue (near)
    gradient.addColorStop(0.25, 'rgb(0, 255, 255)'); // Cyan
    gradient.addColorStop(0.5, 'rgb(0, 255, 0)');    // Green
    gradient.addColorStop(0.75, 'rgb(255, 255, 0)');  // Yellow
    gradient.addColorStop(1, 'rgb(255, 0, 0)');      // Red (far)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, barWidth, barHeight);

    // Add labels
    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText('Near', 5, 15);
    ctx.fillText('Far', barWidth - 25, 15);
  };

  useEffect(() => {
    renderDepthMap();
  }, [depthData]);

  useEffect(() => {
    renderColorBar();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge variant={isProcessing ? "default" : "secondary"}>
          {isProcessing ? "Live" : "Paused"}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {width} × {height}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="w-full h-auto border rounded-lg bg-black"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {!depthData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <p className="text-white">No depth data available</p>
          </div>
        )}
      </div>

      {/* Color bar legend */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Depth Scale</p>
        <canvas
          ref={colorBarRef}
          width={300}
          height={20}
          className="w-full h-5 border rounded"
        />
      </div>

      {/* Depth statistics */}
      {depthData && (() => {
        const stats = calculateDepthStats(depthData);
        return (
          <Card className="p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Min Depth</p>
                <p className="text-muted-foreground">
                  {stats.min.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="font-medium">Max Depth</p>
                <p className="text-muted-foreground">
                  {stats.max.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="font-medium">Mean Depth</p>
                <p className="text-muted-foreground">
                  {stats.mean.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="font-medium">Valid Pixels</p>
                <p className="text-muted-foreground">
                  {stats.validCount}
                </p>
              </div>
            </div>
          </Card>
        );
      })()}
    </div>
  );
}