import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Camera, Settings, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface Sensor {
  id: number;
  name: string;
  type: string;
  status: string;
  classification: string;
}

interface FloatingCameraSelectorProps {
  sensors?: Sensor[];
  currentSensor: number;
  onSensorChange: (sensorId: number) => void;
  isExpanded?: boolean;
}

export function FloatingCameraSelector({
  sensors = [],
  currentSensor,
  onSensorChange,
  isExpanded = false
}: FloatingCameraSelectorProps) {
  // Provide fallback if sensors is undefined or empty
  const sensorList = sensors || [];
  
  const getCurrentSensor = () => {
    return sensorList.find(sensor => sensor.id === currentSensor) || sensorList[0] || {
      id: 0,
      name: 'NO SENSOR',
      type: 'OFFLINE',
      status: 'offline',
      classification: 'NONE'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-tactical-green';
      case 'warning': return 'text-tactical-amber';
      case 'degraded': return 'text-tactical-amber';
      case 'offline': return 'text-tactical-red';
      default: return 'text-lattice-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-3 h-3" />;
      case 'warning': return <AlertTriangle className="w-3 h-3" />;
      case 'degraded': return <AlertTriangle className="w-3 h-3" />;
      case 'offline': return <WifiOff className="w-3 h-3" />;
      default: return <Wifi className="w-3 h-3" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'PRIMARY': return 'bg-tactical-red text-white';
      case 'SECONDARY': return 'bg-tactical-amber text-black';
      case 'TERTIARY': return 'bg-tactical-blue text-white';
      case 'SPECIAL': return 'bg-tactical-purple text-white';
      default: return 'bg-lattice-secondary text-white';
    }
  };

  const currentSensorData = getCurrentSensor();

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="lattice-container w-64 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm text-primary">SENSOR</CardTitle>
              </div>
              <div className={`flex items-center gap-1 ${getStatusColor(currentSensorData.status)}`}>
                {getStatusIcon(currentSensorData.status)}
                <span className="text-xs font-mono">{currentSensorData.status.toUpperCase()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">ACTIVE:</span>
                <span className="font-mono text-xs text-foreground">{currentSensorData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">TYPE:</span>
                <span className="font-mono text-xs text-foreground">{currentSensorData.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">CLASS:</span>
                <Badge className={`text-xs font-mono px-1 ${getClassificationColor(currentSensorData.classification)}`}>
                  {currentSensorData.classification}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="lattice-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary">SENSOR ARRAY</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {sensorList.filter(s => s.status === 'operational').length}/{sensorList.length} ONLINE
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {currentSensorData.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sensorList.length === 0 ? (
          <div className="text-center py-8">
            <WifiOff className="w-8 h-8 mx-auto text-tactical-red mb-2" />
            <p className="text-sm text-muted-foreground">NO SENSORS AVAILABLE</p>
            <p className="text-xs text-muted-foreground">Check sensor system connections</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Current Sensor Info */}
            <div className="bg-lattice-surface p-3 rounded border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">ACTIVE SENSOR</span>
                <div className={`flex items-center gap-1 ${getStatusColor(currentSensorData.status)}`}>
                  {getStatusIcon(currentSensorData.status)}
                  <span className="text-xs font-mono">{currentSensorData.status.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">NAME:</span>
                  <span className="font-mono text-xs text-foreground">{currentSensorData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">TYPE:</span>
                  <span className="font-mono text-xs text-foreground">{currentSensorData.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">CLASSIFICATION:</span>
                  <Badge className={`text-xs font-mono px-1 ${getClassificationColor(currentSensorData.classification)}`}>
                    {currentSensorData.classification}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sensor Grid */}
            <div className="grid grid-cols-3 gap-2">
              {sensorList.map((sensor) => (
                <Button
                  key={sensor.id}
                  variant={sensor.id === currentSensor ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSensorChange(sensor.id)}
                  className="h-auto p-2 flex flex-col items-start text-left"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono text-xs truncate">{sensor.name}</span>
                    <div className={`${getStatusColor(sensor.status)}`}>
                      {getStatusIcon(sensor.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-muted-foreground">{sensor.type}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-mono px-1 ${getClassificationColor(sensor.classification)}`}
                    >
                      {sensor.classification.charAt(0)}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const nextSensorIndex = (sensorList.findIndex(s => s.id === currentSensor) + 1) % sensorList.length;
                  if (nextSensorIndex >= 0 && sensorList[nextSensorIndex]) {
                    onSensorChange(sensorList[nextSensorIndex].id);
                  }
                }}
                className="flex-1 h-8 text-xs font-mono"
                disabled={sensorList.length <= 1}
              >
                <Camera className="w-3 h-3 mr-1" />
                NEXT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Simulate sensor calibration
                  console.log(`Calibrating sensor: ${currentSensorData.name}`);
                }}
                className="flex-1 h-8 text-xs font-mono"
              >
                <Settings className="w-3 h-3 mr-1" />
                CALIBRATE
              </Button>
            </div>

            {/* Sensor Summary */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">PRIMARY</div>
                <div className="font-mono text-xs text-foreground">
                  {sensorList.filter(s => s.classification === 'PRIMARY').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">SECONDARY</div>
                <div className="font-mono text-xs text-foreground">
                  {sensorList.filter(s => s.classification === 'SECONDARY').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">TERTIARY</div>
                <div className="font-mono text-xs text-foreground">
                  {sensorList.filter(s => s.classification === 'TERTIARY').length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">SPECIAL</div>
                <div className="font-mono text-xs text-foreground">
                  {sensorList.filter(s => s.classification === 'SPECIAL').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}