import React, { useRef, useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Camera, Eye, Thermometer, Zap, Activity, Signal, Wifi, Radar, Navigation, Waves, Sun, RadioIcon, Crosshair, Scan, Moon, Target } from 'lucide-react';

interface DepthCameraProps {
  isActive: boolean;
  cameraId: number;
  onDepthUpdate: (depthData: Float32Array) => void;
  onNormalUpdate: (normalData: Float32Array) => void;
  processingParams: {
    depthScale: number;
    smoothing: number;
    threshold: number;
    normalStrength: number;
  };
}

type FeedType = 'rgb' | 'depth' | 'thermal' | 'ir' | 'fusion' | 'lidar' | 'radar' | 'sonar' | 'uv' | 'xray' | 'multispectral' | 'hyperspectral' | 'sar' | 'flir' | 'nightvision';

interface FeedConfig {
  id: FeedType;
  name: string;
  icon: React.ReactNode;
  color: string;
  status: 'online' | 'offline' | 'degraded';
  fps: number;
  quality: 'HIGH' | 'MEDIUM' | 'LOW';
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  spectrum?: string;
  range?: string;
}

export function DepthCamera({ 
  isActive, 
  cameraId, 
  onDepthUpdate, 
  onNormalUpdate, 
  processingParams 
}: DepthCameraProps) {
  const canvasRefs = useRef<Record<FeedType, HTMLCanvasElement | null>>({
    rgb: null,
    depth: null,
    thermal: null,
    ir: null,
    fusion: null,
    lidar: null,
    radar: null,
    sonar: null,
    uv: null,
    xray: null,
    multispectral: null,
    hyperspectral: null,
    sar: null,
    flir: null,
    nightvision: null
  });
  const animationRef = useRef<number>();
  const [frameCount, setFrameCount] = useState(0);
  const [activeFeed, setActiveFeed] = useState<FeedType>('rgb');
  const [currentTabGroup, setCurrentTabGroup] = useState(0);
  const lastTimeRef = useRef(performance.now());

  const width = 320;
  const height = 240;

  // Extended feed configurations with tactical specifications
  const feedConfigs: FeedConfig[] = [
    {
      id: 'rgb',
      name: 'RGB',
      icon: <Camera className="w-3 h-3" />,
      color: 'text-chart-1',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'UNCLASSIFIED',
      spectrum: '400-700nm',
      range: '0-50m'
    },
    {
      id: 'depth',
      name: 'DEPTH',
      icon: <Eye className="w-3 h-3" />,
      color: 'text-chart-2',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'RESTRICTED',
      range: '0.1-100m'
    },
    {
      id: 'thermal',
      name: 'THERMAL',
      icon: <Thermometer className="w-3 h-3" />,
      color: 'text-chart-3',
      status: cameraId === 2 ? 'degraded' : 'online',
      fps: cameraId === 2 ? 15 : 30,
      quality: cameraId === 2 ? 'MEDIUM' : 'HIGH',
      classification: 'CONFIDENTIAL',
      spectrum: '7.5-14μm',
      range: '0-2km'
    },
    {
      id: 'ir',
      name: 'IR',
      icon: <Zap className="w-3 h-3" />,
      color: 'text-chart-4',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'RESTRICTED',
      spectrum: '0.7-1.4μm',
      range: '0-500m'
    },
    {
      id: 'fusion',
      name: 'FUSION',
      icon: <Activity className="w-3 h-3" />,
      color: 'text-chart-5',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'SECRET',
      range: '0-1km'
    },
    {
      id: 'lidar',
      name: 'LIDAR',
      icon: <Scan className="w-3 h-3" />,
      color: 'text-tactical-green',
      status: 'online',
      fps: 20,
      quality: 'HIGH',
      classification: 'CONFIDENTIAL',
      spectrum: '905nm',
      range: '0-200m'
    },
    {
      id: 'radar',
      name: 'RADAR',
      icon: <Radar className="w-3 h-3" />,
      color: 'text-tactical-amber',
      status: 'online',
      fps: 10,
      quality: 'MEDIUM',
      classification: 'SECRET',
      spectrum: '24-77GHz',
      range: '0-5km'
    },
    {
      id: 'sonar',
      name: 'SONAR',
      icon: <Waves className="w-3 h-3" />,
      color: 'text-tactical-blue',
      status: 'online',
      fps: 5,
      quality: 'MEDIUM',
      classification: 'RESTRICTED',
      spectrum: '40-200kHz',
      range: '0-1km'
    },
    {
      id: 'uv',
      name: 'UV',
      icon: <Sun className="w-3 h-3" />,
      color: 'text-tactical-purple',
      status: cameraId === 6 ? 'degraded' : 'online',
      fps: 15,
      quality: cameraId === 6 ? 'LOW' : 'MEDIUM',
      classification: 'RESTRICTED',
      spectrum: '200-400nm',
      range: '0-100m'
    },
    {
      id: 'xray',
      name: 'X-RAY',
      icon: <RadioIcon className="w-3 h-3" />,
      color: 'text-destructive',
      status: cameraId === 9 ? 'offline' : 'online',
      fps: 1,
      quality: 'HIGH',
      classification: 'TOP SECRET',
      spectrum: '0.01-10nm',
      range: '0-5m'
    },
    {
      id: 'multispectral',
      name: 'MULTI',
      icon: <Target className="w-3 h-3" />,
      color: 'text-primary',
      status: 'online',
      fps: 10,
      quality: 'HIGH',
      classification: 'CONFIDENTIAL',
      spectrum: '400-1000nm',
      range: '0-10km'
    },
    {
      id: 'hyperspectral',
      name: 'HYPER',
      icon: <Crosshair className="w-3 h-3" />,
      color: 'text-warning',
      status: 'online',
      fps: 5,
      quality: 'HIGH',
      classification: 'SECRET',
      spectrum: '400-2500nm',
      range: '0-50km'
    },
    {
      id: 'sar',
      name: 'SAR',
      icon: <Navigation className="w-3 h-3" />,
      color: 'text-success',
      status: 'online',
      fps: 1,
      quality: 'HIGH',
      classification: 'TOP SECRET',
      spectrum: '1-100GHz',
      range: '0-100km'
    },
    {
      id: 'flir',
      name: 'FLIR',
      icon: <Eye className="w-3 h-3" />,
      color: 'text-chart-3',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'SECRET',
      spectrum: '3-5μm',
      range: '0-5km'
    },
    {
      id: 'nightvision',
      name: 'NV',
      icon: <Moon className="w-3 h-3" />,
      color: 'text-tactical-green',
      status: 'online',
      fps: 30,
      quality: 'HIGH',
      classification: 'CONFIDENTIAL',
      spectrum: '0.7-0.9μm',
      range: '0-1km'
    }
  ];

  // Group feeds into sets of 5 for tab pagination
  const feedGroups = [];
  for (let i = 0; i < feedConfigs.length; i += 5) {
    feedGroups.push(feedConfigs.slice(i, i + 5));
  }

  const getCurrentFeedConfig = () => feedConfigs.find(f => f.id === activeFeed) || feedConfigs[0];

  // Generate different feed types with unique visual patterns
  const generateFeedData = (ctx: CanvasRenderingContext2D, time: number, feedType: FeedType) => {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Create animated scene with objects at different depths
        const centerX = width / 2 + Math.sin(time * 0.001) * 50;
        const centerY = height / 2 + Math.cos(time * 0.0008) * 30;
        
        const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const wavePattern = Math.sin(distToCenter * 0.1 + time * 0.002) * 0.5 + 0.5;
        
        // Simulate different objects with varying depths
        let depth = 0.5;
        if (distToCenter < 60) {
          depth = 0.8 + wavePattern * 0.2; // Close object
        } else if (distToCenter < 120) {
          depth = 0.4 + wavePattern * 0.1; // Medium distance
        } else {
          depth = 0.1 + wavePattern * 0.05; // Far background
        }

        let r = 0, g = 0, b = 0;

        switch (feedType) {
          case 'rgb':
            // Standard RGB camera feed
            r = depth * 255 * 0.8;
            g = depth * 255 * 0.9;
            b = depth * 255;
            break;
          
          case 'depth':
            // Depth visualization - grayscale with depth mapping
            const depthIntensity = depth * 255;
            r = depthIntensity;
            g = depthIntensity;
            b = depthIntensity;
            break;
          
          case 'thermal':
          case 'flir':
            // Thermal imaging - heat map colors
            const temp = depth;
            if (temp > 0.7) {
              r = 255;
              g = (1 - temp) * 255;
              b = 0;
            } else if (temp > 0.3) {
              r = 255;
              g = 255;
              b = 0;
            } else {
              r = 0;
              g = temp * 255 * 3;
              b = 255;
            }
            break;
          
          case 'ir':
          case 'nightvision':
            // Infrared - greenish monochrome
            const ir = depth * 255;
            r = ir * 0.2;
            g = ir;
            b = ir * 0.3;
            break;
          
          case 'fusion':
            // Sensor fusion - combination of RGB and thermal
            const base = depth * 255;
            const thermal = Math.sin(time * 0.003 + distToCenter * 0.02) * 0.5 + 0.5;
            r = base * 0.7 + thermal * 128;
            g = base * 0.8;
            b = base * 0.9 + thermal * 64;
            break;

          case 'lidar':
            // LIDAR - precise point cloud visualization
            const lidarIntensity = Math.floor(depth * 10) / 10 * 255;
            r = lidarIntensity * 0.3;
            g = lidarIntensity;
            b = lidarIntensity * 0.7;
            break;

          case 'radar':
            // RADAR - motion detection with Doppler effect
            const motion = Math.sin(time * 0.01 + x * 0.1) * 0.5 + 0.5;
            r = motion * 255;
            g = depth * 128;
            b = 0;
            break;

          case 'sonar':
            // SONAR - acoustic imaging with wave patterns
            const acoustic = Math.sin(distToCenter * 0.2 + time * 0.005) * 0.5 + 0.5;
            r = 0;
            g = acoustic * 255;
            b = depth * 255;
            break;

          case 'uv':
            // UV imaging - purple/blue spectrum
            const uv = depth * 255;
            r = uv * 0.8;
            g = uv * 0.3;
            b = uv;
            break;

          case 'xray':
            // X-Ray - penetrating imaging, inverted grayscale
            const xray = (1 - depth) * 255;
            r = xray;
            g = xray;
            b = xray;
            break;

          case 'multispectral':
            // Multispectral - false color composite
            const band1 = depth;
            const band2 = Math.sin(time * 0.002 + x * 0.05) * 0.5 + 0.5;
            const band3 = Math.cos(time * 0.003 + y * 0.05) * 0.5 + 0.5;
            r = band1 * 255;
            g = band2 * 255;
            b = band3 * 255;
            break;

          case 'hyperspectral':
            // Hyperspectral - spectral signature analysis
            const spectral = (Math.sin(time * 0.001 + distToCenter * 0.1) + 1) / 2;
            r = spectral * depth * 255;
            g = (1 - spectral) * depth * 255;
            b = depth * 128;
            break;

          case 'sar':
            // SAR - synthetic aperture radar
            const sar = Math.floor(depth * 8) / 8;
            const sarIntensity = sar * 255;
            r = sarIntensity;
            g = sarIntensity * 0.8;
            b = sarIntensity * 0.6;
            break;
        }

        data[index] = Math.min(255, r);
        data[index + 1] = Math.min(255, g);
        data[index + 2] = Math.min(255, b);
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return imageData;
  };

  // Generate depth data from the camera feed
  const generateDepthData = (imageData: ImageData): Float32Array => {
    const depthData = new Float32Array(width * height);
    const data = imageData.data;

    for (let i = 0; i < width * height; i++) {
      const pixelIndex = i * 4;
      const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / (3 * 255);
      
      // Apply processing parameters
      let depth = brightness * processingParams.depthScale;
      
      // Apply smoothing
      if (processingParams.smoothing > 0) {
        const x = i % width;
        const y = Math.floor(i / width);
        let smoothedDepth = depth;
        let count = 1;
        
        // Simple box filter
        const radius = Math.floor(processingParams.smoothing * 3);
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const ni = ny * width + nx;
              const nPixelIndex = ni * 4;
              const nBrightness = (data[nPixelIndex] + data[nPixelIndex + 1] + data[nPixelIndex + 2]) / (3 * 255);
              smoothedDepth += nBrightness * processingParams.depthScale;
              count++;
            }
          }
        }
        depth = smoothedDepth / count;
      }
      
      // Apply threshold
      if (depth < processingParams.threshold) {
        depth = 0;
      }
      
      depthData[i] = depth;
    }

    return depthData;
  };

  // Generate surface normals from depth data
  const generateNormals = (depthData: Float32Array): Float32Array => {
    const normals = new Float32Array(width * height * 3);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        
        // Calculate gradients
        const dzdx = (depthData[i + 1] - depthData[i - 1]) * 0.5;
        const dzdy = (depthData[i + width] - depthData[i - width]) * 0.5;
        
        // Calculate normal vector
        const nx = -dzdx * processingParams.normalStrength;
        const ny = -dzdy * processingParams.normalStrength;
        const nz = 1.0;
        
        // Normalize
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals[i * 3] = nx / length;
        normals[i * 3 + 1] = ny / length;
        normals[i * 3 + 2] = nz / length;
      }
    }

    return normals;
  };

  const animate = (currentTime: number) => {
    if (!isActive) return;

    // Animate all feeds
    feedConfigs.forEach(feed => {
      const canvas = canvasRefs.current[feed.id];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Generate feed data
      const imageData = generateFeedData(ctx, currentTime, feed.id);
      
      // Only process depth data for the active feed to avoid performance issues
      if (feed.id === activeFeed) {
        const depthData = generateDepthData(imageData);
        onDepthUpdate(depthData);
        
        const normalData = generateNormals(depthData);
        onNormalUpdate(normalData);
      }
    });

    // Update frame count
    setFrameCount(prev => prev + 1);
    if (currentTime - lastTimeRef.current >= 1000) {
      setFrameCount(0);
      lastTimeRef.current = currentTime;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isActive) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, processingParams, activeFeed]);

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-2 h-2 rounded-full bg-tactical-green"></div>;
      case 'degraded': return <div className="w-2 h-2 rounded-full bg-tactical-amber animate-pulse"></div>;
      case 'offline': return <div className="w-2 h-2 rounded-full bg-tactical-red"></div>;
      default: return <div className="w-2 h-2 rounded-full bg-lattice-secondary"></div>;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'HIGH': return 'text-tactical-green';
      case 'MEDIUM': return 'text-tactical-amber';
      case 'LOW': return 'text-tactical-red';
      default: return 'text-lattice-secondary';
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'UNCLASSIFIED': return 'text-tactical-green';
      case 'RESTRICTED': return 'text-tactical-amber';
      case 'CONFIDENTIAL': return 'text-chart-1';
      case 'SECRET': return 'text-tactical-red';
      case 'TOP SECRET': return 'text-destructive';
      default: return 'text-lattice-secondary';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Sensor Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            SENSOR {cameraId}
          </Badge>
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span className="text-xs text-muted-foreground">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            {getCurrentFeedConfig().fps} FPS
          </Badge>
          <Badge variant="outline" className={`font-mono text-xs ${getQualityColor(getCurrentFeedConfig().quality)}`}>
            {getCurrentFeedConfig().quality}
          </Badge>
          <Badge variant="outline" className={`font-mono text-xs ${getClassificationColor(getCurrentFeedConfig().classification)}`}>
            {getCurrentFeedConfig().classification}
          </Badge>
        </div>
      </div>

      {/* Feed Group Navigation */}
      <div className="flex items-center justify-between bg-lattice-surface p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">FEED GROUP:</span>
          <div className="flex gap-1">
            {feedGroups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTabGroup(index)}
                className={`px-2 py-1 text-xs font-mono rounded ${
                  currentTabGroup === index 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-mono">
          {feedGroups[currentTabGroup]?.length || 0} FEEDS
        </div>
      </div>

      {/* Video Feed Tabs for Current Group */}
      <Tabs value={activeFeed} onValueChange={(value) => setActiveFeed(value as FeedType)} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-lattice-surface h-10">
          {feedGroups[currentTabGroup]?.map((feed) => (
            <TabsTrigger 
              key={feed.id} 
              value={feed.id} 
              className="flex items-center gap-1 font-mono text-xs px-2"
            >
              <div className={`${feed.color}`}>
                {feed.icon}
              </div>
              <span>{feed.name}</span>
              {getStatusIndicator(feed.status)}
            </TabsTrigger>
          )) || []}
        </TabsList>

        {/* Feed Content */}
        {feedConfigs.map((feed) => (
          <TabsContent key={feed.id} value={feed.id} className="mt-3">
            <div className="relative">
              <canvas
                ref={(el) => {
                  canvasRefs.current[feed.id] = el;
                }}
                width={width}
                height={height}
                className="w-full h-auto border rounded-lg bg-black"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center">
                    <Signal className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-white font-mono text-sm">FEED INACTIVE</p>
                  </div>
                </div>
              )}

              {/* Feed Status Overlay */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-white font-mono">
                  {getStatusIndicator(feed.status)}
                  <span>{feed.status.toUpperCase()}</span>
                </div>
                <div className="bg-black/70 px-2 py-1 rounded text-xs text-white font-mono">
                  {feed.fps}fps
                </div>
                <div className={`bg-black/70 px-2 py-1 rounded text-xs font-mono ${getClassificationColor(feed.classification)}`}>
                  {feed.classification}
                </div>
              </div>

              {/* Feed Type Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-white font-mono ${feed.color}`}>
                  {feed.icon}
                  <span>{feed.name}</span>
                </div>
              </div>
            </div>

            {/* Feed Details */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>RESOLUTION:</span>
                <span className="font-mono text-foreground">{width} × {height}</span>
              </div>
              <div className="flex justify-between">
                <span>ENCODING:</span>
                <span className="font-mono text-foreground">H.264</span>
              </div>
              <div className="flex justify-between">
                <span>LATENCY:</span>
                <span className="font-mono text-foreground">{Math.floor(Math.random() * 20 + 30)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>BANDWIDTH:</span>
                <span className="font-mono text-foreground">{(Math.random() * 5 + 15).toFixed(1)}Mbps</span>
              </div>
              {feed.spectrum && (
                <div className="flex justify-between">
                  <span>SPECTRUM:</span>
                  <span className="font-mono text-foreground">{feed.spectrum}</span>
                </div>
              )}
              {feed.range && (
                <div className="flex justify-between">
                  <span>RANGE:</span>
                  <span className="font-mono text-foreground">{feed.range}</span>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}