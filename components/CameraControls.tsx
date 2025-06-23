import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Camera, Wifi, WifiOff } from 'lucide-react';

interface Camera {
  id: number;
  name: string;
  type: string;
}

interface CameraControlsProps {
  cameras: Camera[];
  currentCamera: number;
  onCameraChange: (cameraId: number) => void;
}

export function CameraControls({ cameras, currentCamera, onCameraChange }: CameraControlsProps) {
  const [cameraStatus, setCameraStatus] = React.useState<Record<number, 'online' | 'offline'>>({
    0: 'online',
    1: 'online',
    2: 'offline',
    3: 'online'
  });

  const getCameraIcon = (type: string) => {
    return <Camera className="w-4 h-4" />;
  };

  const getStatusIcon = (status: 'online' | 'offline') => {
    return status === 'online' ? 
      <Wifi className="w-4 h-4 text-green-500" /> : 
      <WifiOff className="w-4 h-4 text-red-500" />;
  };

  const toggleCameraStatus = (cameraId: number) => {
    setCameraStatus(prev => ({
      ...prev,
      [cameraId]: prev[cameraId] === 'online' ? 'offline' : 'online'
    }));
  };

  return (
    <div className="space-y-3">
      {cameras.map((camera) => (
        <Card 
          key={camera.id} 
          className={`p-3 cursor-pointer transition-colors ${
            currentCamera === camera.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onCameraChange(camera.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getCameraIcon(camera.type)}
              <div>
                <p className="font-medium">{camera.name}</p>
                <p className="text-sm text-muted-foreground">{camera.type}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={cameraStatus[camera.id] === 'online' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {cameraStatus[camera.id]}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCameraStatus(camera.id);
                }}
              >
                {getStatusIcon(cameraStatus[camera.id])}
              </Button>
            </div>
          </div>
          
          {currentCamera === camera.id && (
            <div className="mt-2 pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Resolution: 1920×1080</div>
                <div>FPS: 30</div>
                <div>Codec: H.264</div>
                <div>Latency: 42ms</div>
              </div>
            </div>
          )}
        </Card>
      ))}
      
      {/* Multi-camera view option */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-2 gap-1">
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
              <div className="w-2 h-2 bg-primary rounded-sm"></div>
            </div>
            <div>
              <p className="font-medium">Multi-Camera View</p>
              <p className="text-sm text-muted-foreground">Show all cameras</p>
            </div>
          </div>
          
          <Button
            variant={currentCamera === -1 ? "default" : "outline"}
            size="sm"
            onClick={() => onCameraChange(-1)}
          >
            Enable
          </Button>
        </div>
      </Card>
    </div>
  );
}