import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  Settings, 
  Cpu, 
  Camera, 
  Monitor, 
  RefreshCw, 
  Zap, 
  TrendingUp,
  Activity,
  ChevronRight,
  ChevronDown,
  Target,
  Layers,
  Box,
  Brain,
  Radar
} from 'lucide-react';

interface Sensor {
  id: number;
  name: string;
  type: string;
  status: string;
  classification: string;
}

interface ProcessingParams {
  depthScale?: number;
  smoothing?: number;
  threshold?: number;
  normalStrength?: number;
}

interface ProcessingControlsProps {
  isProcessing: boolean;
  onToggleProcessing: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
  currentSensor: number;
  onSensorChange: (sensorId: number) => void;
  sensorSystems?: Sensor[];
  params?: ProcessingParams;
  onParamsChange?: (params: ProcessingParams) => void;
}

export function ProcessingControls({
  isProcessing,
  onToggleProcessing,
  activeModule,
  onModuleChange,
  currentSensor,
  onSensorChange,
  sensorSystems = [],
  params = {},
  onParamsChange
}: ProcessingControlsProps) {
  // Safe parameter defaults
  const safeParams = {
    depthScale: params?.depthScale ?? 1.0,
    smoothing: params?.smoothing ?? 0.5,
    threshold: params?.threshold ?? 0.1,
    normalStrength: params?.normalStrength ?? 1.0
  };

  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [autoOptimize, setAutoOptimize] = React.useState(false);

  const getCurrentSensor = () => {
    return sensorSystems.find(sensor => sensor.id === currentSensor) || {
      id: 0,
      name: 'NO SENSOR',
      type: 'OFFLINE',
      status: 'offline',
      classification: 'NONE'
    };
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'depth': return <Radar className="w-4 h-4" />;
      case 'normals': return <Target className="w-4 h-4" />;
      case 'pointcloud': return <Layers className="w-4 h-4" />;
      case 'gaussian': return <Target className="w-4 h-4" />;
      case 'luma': return <Brain className="w-4 h-4" />;
      case 'octane': return <Box className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getModuleDisplayName = (module: string) => {
    switch (module) {
      case 'depth': return 'DEPTH PROCESSING';
      case 'normals': return 'SURFACE NORMALS';
      case 'pointcloud': return 'POINT CLOUD';
      case 'gaussian': return 'GAUSSIAN SPLATS';
      case 'luma': return 'NEURAL RENDERING';
      case 'octane': return 'OCTANE LATENT';
      default: return 'UNKNOWN MODULE';
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-tactical-green';
      case 'warning': return 'text-tactical-amber';
      case 'degraded': return 'text-tactical-amber';
      case 'offline': return 'text-tactical-red';
      default: return 'text-lattice-secondary';
    }
  };

  const getProcessingQuality = () => {
    const complexity = (
      (safeParams.depthScale / 5.0) * 0.3 +
      safeParams.smoothing * 0.4 +
      (1 - safeParams.threshold / 0.5) * 0.2 +
      (safeParams.normalStrength / 2.0) * 0.1
    );
    
    if (complexity < 0.3) return { label: 'OPTIMAL', color: 'text-tactical-green', value: 95 };
    if (complexity < 0.7) return { label: 'MODERATE', color: 'text-tactical-amber', value: 75 };
    return { label: 'INTENSIVE', color: 'text-tactical-red', value: 45 };
  };

  const quality = getProcessingQuality();
  const currentSensorData = getCurrentSensor();

  const handleParamChange = (key: keyof ProcessingParams, value: number[]) => {
    if (onParamsChange) {
      const newParams = {
        ...safeParams,
        [key]: value[0]
      };
      onParamsChange(newParams);
    }
  };

  const handleOptimizeParams = () => {
    if (onParamsChange) {
      const optimizedParams = {
        depthScale: 1.2,
        smoothing: 0.7,
        threshold: 0.08,
        normalStrength: 1.1
      };
      onParamsChange(optimizedParams);
    }
  };

  const handleResetParams = () => {
    if (onParamsChange) {
      const defaultParams = {
        depthScale: 1.0,
        smoothing: 0.5,
        threshold: 0.1,
        normalStrength: 1.0
      };
      onParamsChange(defaultParams);
    }
  };

  return (
    <Card className="lattice-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary">PROCESSING CONTROL CENTER</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {currentSensorData.name}
            </Badge>
            <Badge variant={isProcessing ? "default" : "secondary"} className="font-mono text-xs">
              {isProcessing ? "ACTIVE" : "STANDBY"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Control Panel */}
        <div className="space-y-4">
          {/* Processing Toggle */}
          <div className="bg-lattice-surface p-4 rounded border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="font-medium">PROCESSING ENGINE</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-tactical-green animate-pulse' : 'bg-lattice-secondary'}`}></div>
            </div>
            
            <Button
              onClick={onToggleProcessing}
              variant={isProcessing ? "destructive" : "default"}
              className="w-full h-12 font-mono"
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  HALT PROCESSING
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  INITIATE PROCESSING
                </>
              )}
            </Button>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-muted-foreground">STATUS</div>
                <div className={`font-mono ${isProcessing ? 'text-tactical-green' : 'text-lattice-secondary'}`}>
                  {isProcessing ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">QUALITY</div>
                <div className={`font-mono ${quality.color}`}>
                  {quality.label}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">EFFICIENCY</div>
                <div className="font-mono text-foreground">{quality.value}%</div>
              </div>
            </div>
          </div>

          {/* Active Module Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>ACTIVE PROCESSING MODULE</Label>
              <Badge variant="outline" className="font-mono text-xs">
                {getModuleDisplayName(activeModule)}
              </Badge>
            </div>
            
            <Tabs value={activeModule} onValueChange={onModuleChange}>
              <TabsList className="grid w-full grid-cols-3 bg-lattice-surface">
                <TabsTrigger value="depth" className="font-mono text-xs">
                  <Radar className="w-3 h-3 mr-1" />
                  DEPTH
                </TabsTrigger>
                <TabsTrigger value="gaussian" className="font-mono text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  GAUSSIAN
                </TabsTrigger>
                <TabsTrigger value="octane" className="font-mono text-xs">
                  <Box className="w-3 h-3 mr-1" />
                  OCTANE
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant={activeModule === 'normals' ? 'default' : 'outline'}
                  onClick={() => onModuleChange('normals')}
                  size="sm"
                  className="h-8 text-xs font-mono"
                >
                  <Target className="w-3 h-3 mr-1" />
                  NORMALS
                </Button>
                <Button
                  variant={activeModule === 'pointcloud' ? 'default' : 'outline'}
                  onClick={() => onModuleChange('pointcloud')}
                  size="sm"
                  className="h-8 text-xs font-mono"
                >
                  <Layers className="w-3 h-3 mr-1" />
                  CLOUD
                </Button>
              </div>
            </Tabs>
          </div>

          {/* Sensor Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>PRIMARY SENSOR</Label>
              <Badge variant="outline" className={`font-mono text-xs ${getSensorStatusColor(currentSensorData.status)}`}>
                {currentSensorData.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="bg-lattice-surface p-3 rounded border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-chart-1" />
                  <span className="font-medium text-sm">{currentSensorData.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {currentSensorData.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const nextSensorIndex = (sensorSystems.findIndex(s => s.id === currentSensor) + 1) % sensorSystems.length;
                    if (nextSensorIndex >= 0 && sensorSystems[nextSensorIndex]) {
                      onSensorChange(sensorSystems[nextSensorIndex].id);
                    }
                  }}
                  className="flex-1 h-8 text-xs font-mono"
                  disabled={sensorSystems.length <= 1}
                >
                  <Camera className="w-3 h-3 mr-1" />
                  NEXT
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs font-mono"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  CONFIG
                </Button>
              </div>
            </div>
          </div>

          {/* Advanced Parameters */}
          {onParamsChange && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>PROCESSING PARAMETERS</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="h-6 px-2 text-xs"
                >
                  {showAdvanced ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {showAdvanced ? 'HIDE' : 'SHOW'}
                </Button>
              </div>

              {showAdvanced && (
                <div className="bg-lattice-surface p-3 rounded border border-border space-y-4">
                  {/* Depth Scale */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">DEPTH SCALE</span>
                      <span className="font-mono text-foreground">{safeParams.depthScale.toFixed(2)}</span>
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
                  </div>

                  {/* Smoothing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">SMOOTHING</span>
                      <span className="font-mono text-foreground">{safeParams.smoothing.toFixed(2)}</span>
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
                  </div>

                  {/* Threshold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">THRESHOLD</span>
                      <span className="font-mono text-foreground">{safeParams.threshold.toFixed(3)}</span>
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
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetParams}
                      disabled={isProcessing}
                      className="flex-1 h-8 text-xs font-mono"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      RESET
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleOptimizeParams}
                      disabled={isProcessing}
                      className="flex-1 h-8 text-xs font-mono"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      OPTIMIZE
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto-Optimization */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-tactical-amber" />
              <Label>AUTO-OPTIMIZATION</Label>
            </div>
            <Switch
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
              disabled={isProcessing}
            />
          </div>

          {/* Performance Metrics */}
          <div className="bg-lattice-surface p-3 rounded border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-chart-1" />
              <span className="font-medium text-sm">PERFORMANCE METRICS</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">PROCESSING EFFICIENCY</span>
                <span className={`font-mono ${quality.color}`}>{quality.value}%</span>
              </div>
              <Progress value={quality.value} className="h-2" />
              
              <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FPS:</span>
                  <span className="font-mono text-foreground">{isProcessing ? '30' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LATENCY:</span>
                  <span className="font-mono text-foreground">{isProcessing ? '16ms' : '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GPU USAGE:</span>
                  <span className="font-mono text-foreground">{isProcessing ? '67%' : '0%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MEMORY:</span>
                  <span className="font-mono text-foreground">2.1GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}