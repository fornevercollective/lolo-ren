import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Settings, RefreshCw, Zap, TrendingUp } from 'lucide-react';

interface ProcessingParams {
  depthScale?: number;
  smoothing?: number;
  threshold?: number;
  normalStrength?: number;
}

interface DepthControlsProps {
  params?: ProcessingParams;
  onParamsChange: (params: ProcessingParams) => void;
  isProcessing: boolean;
}

export function DepthControls({ 
  params = {}, 
  onParamsChange, 
  isProcessing 
}: DepthControlsProps) {
  // Provide safe default values
  const safeParams = {
    depthScale: params?.depthScale ?? 1.0,
    smoothing: params?.smoothing ?? 0.5,
    threshold: params?.threshold ?? 0.1,
    normalStrength: params?.normalStrength ?? 1.0
  };

  const handleParamChange = (key: keyof ProcessingParams, value: number[]) => {
    const newParams = {
      ...safeParams,
      [key]: value[0]
    };
    onParamsChange(newParams);
  };

  const resetToDefaults = () => {
    const defaultParams = {
      depthScale: 1.0,
      smoothing: 0.5,
      threshold: 0.1,
      normalStrength: 1.0
    };
    onParamsChange(defaultParams);
  };

  const optimizeParams = () => {
    const optimizedParams = {
      depthScale: 1.2,
      smoothing: 0.7,
      threshold: 0.08,
      normalStrength: 1.1
    };
    onParamsChange(optimizedParams);
  };

  return (
    <Card className="lattice-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary">DEPTH PROCESSING PARAMETERS</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              LIDAR-01
            </Badge>
            <Badge variant={isProcessing ? "default" : "secondary"} className="font-mono text-xs">
              {isProcessing ? "ACTIVE" : "STANDBY"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Depth Scale */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>DEPTH SCALE</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {safeParams.depthScale.toFixed(2)}
            </Badge>
          </div>
          <Slider
            value={[safeParams.depthScale]}
            onValueChange={(value) => handleParamChange('depthScale', value)}
            min={0.1}
            max={5.0}
            step={0.1}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>0.1</span>
            <span>2.5</span>
            <span>5.0</span>
          </div>
        </div>

        {/* Smoothing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>SMOOTHING FACTOR</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {safeParams.smoothing.toFixed(2)}
            </Badge>
          </div>
          <Slider
            value={[safeParams.smoothing]}
            onValueChange={(value) => handleParamChange('smoothing', value)}
            min={0.0}
            max={1.0}
            step={0.05}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>0.0</span>
            <span>0.5</span>
            <span>1.0</span>
          </div>
        </div>

        {/* Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>NOISE THRESHOLD</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {safeParams.threshold.toFixed(3)}
            </Badge>
          </div>
          <Slider
            value={[safeParams.threshold]}
            onValueChange={(value) => handleParamChange('threshold', value)}
            min={0.001}
            max={0.5}
            step={0.001}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>0.001</span>
            <span>0.250</span>
            <span>0.500</span>
          </div>
        </div>

        {/* Normal Strength */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>NORMAL STRENGTH</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {safeParams.normalStrength.toFixed(2)}
            </Badge>
          </div>
          <Slider
            value={[safeParams.normalStrength]}
            onValueChange={(value) => handleParamChange('normalStrength', value)}
            min={0.1}
            max={2.0}
            step={0.1}
            className="w-full"
            disabled={isProcessing}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>0.1</span>
            <span>1.0</span>
            <span>2.0</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            disabled={isProcessing}
            className="flex-1 h-9 font-mono text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            RESET
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={optimizeParams}
            disabled={isProcessing}
            className="flex-1 h-9 font-mono text-xs"
          >
            <TrendingUp className="w-3 h-3 mr-2" />
            OPTIMIZE
          </Button>
        </div>

        {/* Parameter Summary */}
        <div className="bg-lattice-surface p-3 rounded border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-tactical-green" />
            <span className="text-sm font-medium">PROCESSING SUMMARY</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SCALE:</span>
              <span className="font-mono text-foreground">{safeParams.depthScale.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMOOTH:</span>
              <span className="font-mono text-foreground">{(safeParams.smoothing * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">THRESH:</span>
              <span className="font-mono text-foreground">{safeParams.threshold.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NORMAL:</span>
              <span className="font-mono text-foreground">{safeParams.normalStrength.toFixed(2)}x</span>
            </div>
          </div>
          
          {/* Performance Indicator */}
          <div className="mt-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">EST. PERFORMANCE:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPerformanceColor(safeParams)}`}></div>
                <span className="font-mono text-foreground">{getPerformanceStatus(safeParams)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function getPerformanceColor(params: ProcessingParams): string {
  const complexity = calculateComplexity(params);
  if (complexity < 0.3) return 'bg-tactical-green';
  if (complexity < 0.7) return 'bg-tactical-amber';
  return 'bg-tactical-red';
}

function getPerformanceStatus(params: ProcessingParams): string {
  const complexity = calculateComplexity(params);
  if (complexity < 0.3) return 'OPTIMAL';
  if (complexity < 0.7) return 'MODERATE';
  return 'INTENSIVE';
}

function calculateComplexity(params: ProcessingParams): number {
  const depthScale = params.depthScale ?? 1.0;
  const smoothing = params.smoothing ?? 0.5;
  const threshold = params.threshold ?? 0.1;
  const normalStrength = params.normalStrength ?? 1.0;
  
  // Weighted complexity calculation
  return (
    (depthScale / 5.0) * 0.3 +
    smoothing * 0.4 +
    (1 - threshold / 0.5) * 0.2 +
    (normalStrength / 2.0) * 0.1
  );
}