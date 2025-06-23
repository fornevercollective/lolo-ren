import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, Activity, Clock } from 'lucide-react';

interface ThumbnailTimelineProps {
  title: string;
  totalFrames?: number;
  currentFrame: number;
  isLive?: boolean;
  isProcessing?: boolean;
  onFrameSelect: (frame: number) => void;
  data?: any;
  module?: string;
}

export function ThumbnailTimeline({
  title,
  totalFrames = 20,
  currentFrame,
  isLive = false,
  isProcessing = false,
  onFrameSelect,
  data,
  module = 'depth'
}: ThumbnailTimelineProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout>();

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isDragging) {
      playIntervalRef.current = setInterval(() => {
        onFrameSelect((currentFrame + 1) % totalFrames);
      }, 200); // 5 FPS playback
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, isDragging, currentFrame, totalFrames, onFrameSelect]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrub(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleScrub(e);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScrub = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const frame = Math.floor(percentage * totalFrames);
    onFrameSelect(frame);
  };

  const generateThumbnailData = (frameIndex: number) => {
    // Generate mock thumbnail data based on frame and module type
    switch (module) {
      case 'depth':
        return {
          color: `hsl(${200 + frameIndex * 8}, 70%, ${30 + frameIndex * 2}%)`,
          intensity: 0.3 + (frameIndex / totalFrames) * 0.7,
          pattern: 'depth'
        };
      case 'normals':
        return {
          color: `hsl(${120 + frameIndex * 5}, 60%, ${40 + frameIndex * 1.5}%)`,
          intensity: 0.4 + (frameIndex / totalFrames) * 0.6,
          pattern: 'normals'
        };
      case 'pointcloud':
        return {
          color: `hsl(${300 + frameIndex * 12}, 50%, ${35 + frameIndex * 2.5}%)`,
          intensity: 0.2 + (frameIndex / totalFrames) * 0.8,
          pattern: 'cloud'
        };
      default:
        return {
          color: `hsl(${frameIndex * 18}, 60%, ${30 + frameIndex * 2}%)`,
          intensity: 0.3 + (frameIndex / totalFrames) * 0.7,
          pattern: 'default'
        };
    }
  };

  const formatTimestamp = (frame: number) => {
    const seconds = Math.floor(frame * 0.2); // 5 FPS = 0.2s per frame
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getFrameStatus = (frameIndex: number) => {
    if (isLive && frameIndex > currentFrame) return 'future';
    if (frameIndex === currentFrame) return 'current';
    if (frameIndex < currentFrame) return 'processed';
    return 'pending';
  };

  const getFrameStyle = (frameIndex: number) => {
    const status = getFrameStatus(frameIndex);
    const thumbnailData = generateThumbnailData(frameIndex);
    
    switch (status) {
      case 'current':
        return {
          backgroundColor: thumbnailData.color,
          opacity: 1,
          border: '2px solid #10b981',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
        };
      case 'processed':
        return {
          backgroundColor: thumbnailData.color,
          opacity: 0.8,
          border: '1px solid #64748b'
        };
      case 'future':
        return {
          backgroundColor: '#1e293b',
          opacity: 0.4,
          border: '1px solid #334155'
        };
      default:
        return {
          backgroundColor: '#334155',
          opacity: 0.6,
          border: '1px solid #475569'
        };
    }
  };

  return (
    <div className="bg-lattice-surface p-3 rounded border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary font-mono">{title} TIMELINE</span>
          <Badge variant="outline" className="font-mono text-xs">
            {isLive ? 'LIVE' : 'COMPUTE'}
          </Badge>
          {isProcessing && (
            <Badge variant="secondary" className="font-mono text-xs">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              PROCESSING
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-muted-foreground">
            {formatTimestamp(currentFrame)} / {formatTimestamp(totalFrames - 1)}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onFrameSelect(0)}
              className="h-6 w-6 p-0"
              disabled={currentFrame === 0}
            >
              <SkipBack className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-6 w-6 p-0"
              disabled={isDragging}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onFrameSelect(totalFrames - 1)}
              className="h-6 w-6 p-0"
              disabled={currentFrame === totalFrames - 1}
            >
              <SkipForward className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div
        ref={timelineRef}
        className="relative h-16 bg-card rounded border border-border cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Thumbnail Grid */}
        <div className="flex h-full">
          {Array.from({ length: totalFrames }, (_, index) => {
            const frameStyle = getFrameStyle(index);
            const thumbnailData = generateThumbnailData(index);
            
            return (
              <div
                key={index}
                className="flex-1 h-full relative border-r border-border last:border-r-0 transition-all duration-150 hover:opacity-100"
                style={frameStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onFrameSelect(index);
                }}
              >
                {/* Thumbnail Content */}
                <div className="absolute inset-1 rounded-sm overflow-hidden">
                  {/* Mock visualization based on module type */}
                  {thumbnailData.pattern === 'depth' && (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-blue-600/50 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-400/30"
                        style={{ height: `${thumbnailData.intensity * 100}%` }}
                      />
                    </div>
                  )}
                  
                  {thumbnailData.pattern === 'normals' && (
                    <div className="w-full h-full bg-gradient-to-tr from-green-900/50 to-green-500/50 relative">
                      <div className="absolute inset-0 opacity-60">
                        <div className="w-full h-full bg-gradient-radial from-green-400/40 to-transparent" />
                      </div>
                    </div>
                  )}
                  
                  {thumbnailData.pattern === 'cloud' && (
                    <div className="w-full h-full bg-gradient-to-tl from-purple-900/50 to-purple-600/50 relative">
                      <div className="absolute inset-0 opacity-50">
                        <div className="grid grid-cols-3 grid-rows-3 h-full w-full gap-px">
                          {Array.from({ length: 9 }, (_, i) => (
                            <div 
                              key={i} 
                              className="bg-purple-400/20" 
                              style={{ opacity: Math.random() * thumbnailData.intensity }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {thumbnailData.pattern === 'default' && (
                    <div className="w-full h-full bg-gradient-to-r from-gray-800/50 to-gray-600/50 relative">
                      <div 
                        className="absolute inset-x-0 bottom-0 bg-gray-400/30"
                        style={{ height: `${thumbnailData.intensity * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Frame Number */}
                <div className="absolute top-0.5 left-0.5 text-xs font-mono text-white/70 bg-black/50 px-1 rounded">
                  {index.toString().padStart(2, '0')}
                </div>

                {/* Processing Indicator */}
                {isProcessing && index === currentFrame && (
                  <div className="absolute top-0.5 right-0.5">
                    <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-card border-t border-border">
          <div 
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
          />
        </div>

        {/* Current Frame Indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-tactical-green shadow-lg transition-all duration-150"
          style={{ left: `${(currentFrame / (totalFrames - 1)) * 100}%` }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-3">
          <span>FRAME: {currentFrame.toString().padStart(2, '0')}</span>
          <span>MODULE: {module.toUpperCase()}</span>
          <span>STATUS: {isProcessing ? 'PROCESSING' : isLive ? 'LIVE' : 'READY'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>FRAMES: {totalFrames}</span>
          <span>FPS: 5.0</span>
          <span>DURATION: {formatTimestamp(totalFrames - 1)}</span>
        </div>
      </div>
    </div>
  );
}