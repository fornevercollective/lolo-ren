import React, { useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RotateCw, Download } from 'lucide-react';

interface SurfaceNormalVisualizerProps {
  normalData: Float32Array | null;
  depthData: Float32Array | null;
  isProcessing: boolean;
  width: number;
  height: number;
}

export function SurfaceNormalVisualizer({ 
  normalData, 
  depthData, 
  isProcessing, 
  width, 
  height 
}: SurfaceNormalVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vectorCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showVectors, setShowVectors] = React.useState(false);
  const [vectorScale, setVectorScale] = React.useState(10);

  const canvasWidth = 320;
  const canvasHeight = 240;

  // Render surface normals as RGB colors
  const renderNormalMap = () => {
    if (!canvasRef.current || !normalData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < normalData.length / 3; i++) {
      const nx = normalData[i * 3];
      const ny = normalData[i * 3 + 1];
      const nz = normalData[i * 3 + 2];

      // Convert normal vector to RGB color
      // X component -> Red channel
      // Y component -> Green channel  
      // Z component -> Blue channel
      const r = Math.round((nx + 1) * 127.5);
      const g = Math.round((ny + 1) * 127.5);
      const b = Math.round((nz + 1) * 127.5);

      const pixelIndex = i * 4;
      data[pixelIndex] = r;
      data[pixelIndex + 1] = g;
      data[pixelIndex + 2] = b;
      data[pixelIndex + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Render normal vectors as arrows
  const renderNormalVectors = () => {
    if (!vectorCanvasRef.current || !normalData || !depthData) return;

    const canvas = vectorCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const step = 16; // Draw every 16th pixel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;

    for (let y = step; y < canvasHeight - step; y += step) {
      for (let x = step; x < canvasWidth - step; x += step) {
        const i = y * canvasWidth + x;
        
        if (depthData[i] === 0) continue; // Skip invalid depth

        const nx = normalData[i * 3];
        const ny = normalData[i * 3 + 1];
        const nz = normalData[i * 3 + 2];

        // Calculate vector end point
        const scale = vectorScale;
        const endX = x + nx * scale;
        const endY = y - ny * scale; // Flip Y for screen coordinates

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrow head
        const angle = Math.atan2(endY - y, endX - x);
        const headLength = 3;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle - Math.PI / 6),
          endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headLength * Math.cos(angle + Math.PI / 6),
          endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    }
  };

  // Export normal map
  const exportNormalMap = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `normal_map_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  useEffect(() => {
    renderNormalMap();
    if (showVectors) {
      renderNormalVectors();
    }
  }, [normalData, showVectors, vectorScale]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={isProcessing ? "default" : "secondary"}>
            {isProcessing ? "Live" : "Paused"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVectors(!showVectors)}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {showVectors ? 'Hide' : 'Show'} Vectors
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportNormalMap}
          disabled={!normalData}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full h-auto border rounded-lg bg-black"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {showVectors && (
          <canvas
            ref={vectorCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 w-full h-auto pointer-events-none"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        )}
        
        {!normalData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <p className="text-white">No normal data available</p>
          </div>
        )}
      </div>

      {/* Vector controls */}
      {showVectors && (
        <Card className="p-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vector Scale</label>
            <input
              type="range"
              min="5"
              max="30"
              value={vectorScale}
              onChange={(e) => setVectorScale(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              Current scale: {vectorScale}px
            </div>
          </div>
        </Card>
      )}

      {/* Color legend */}
      <Card className="p-3">
        <h4 className="font-medium mb-2">Normal Map Legend</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>X-axis (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Y-axis (Green)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Z-axis (Blue)</span>
          </div>
        </div>
      </Card>

      {/* Normal statistics */}
      {normalData && (
        <Card className="p-3">
          <h4 className="font-medium mb-2">Surface Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Surface Area</p>
              <p className="text-muted-foreground">
                {(normalData.length / 3).toLocaleString()} pixels
              </p>
            </div>
            <div>
              <p className="font-medium">Avg Normal Length</p>
              <p className="text-muted-foreground">
                {(() => {
                  let totalLength = 0;
                  for (let i = 0; i < normalData.length; i += 3) {
                    const length = Math.sqrt(
                      normalData[i] ** 2 + 
                      normalData[i + 1] ** 2 + 
                      normalData[i + 2] ** 2
                    );
                    totalLength += length;
                  }
                  return (totalLength / (normalData.length / 3)).toFixed(3);
                })()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}