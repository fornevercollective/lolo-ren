import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface WorkflowProgressBarProps {
  title: string;
  progress: number; // 0-100
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  stages?: string[];
  currentStage?: number;
}

export function WorkflowProgressBar({
  title,
  progress,
  isRunning,
  onStart,
  onPause,
  onReset,
  stages = [],
  currentStage = 0
}: WorkflowProgressBarProps) {
  const getBoxStatus = (index: number) => {
    const boxProgress = (progress / 100) * 10;
    if (index < boxProgress - 1) return 'complete';
    if (index < boxProgress) return 'active';
    return 'pending';
  };

  const getBoxClass = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-tactical-green border-tactical-green';
      case 'active':
        return 'bg-tactical-amber border-tactical-amber animate-pulse';
      case 'pending':
        return 'bg-lattice-surface border-border';
      default:
        return 'bg-lattice-surface border-border';
    }
  };

  const getCurrentStageName = () => {
    if (stages.length > 0 && currentStage < stages.length) {
      return stages[currentStage];
    }
    return 'WORKFLOW';
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-lattice-surface/50 rounded border border-border">
      {/* Workflow Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {title} WORKFLOW
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={isRunning ? onPause : onStart}
            className="h-6 w-6 p-0"
            disabled={progress >= 100}
          >
            {isRunning ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="h-6 w-6 p-0"
            disabled={isRunning}
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }, (_, i) => {
            const status = getBoxStatus(i);
            return (
              <div
                key={i}
                className={`w-3 h-3 border rounded-sm transition-all duration-300 ${getBoxClass(status)}`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {status === 'complete' && (
                    <div className="w-1 h-1 bg-background rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Percentage */}
        <div className="flex items-center gap-2 ml-2">
          <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
            {Math.round(progress)}%
          </Badge>
          
          {stages.length > 0 && (
            <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
              {getCurrentStageName()}
            </Badge>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          progress >= 100 ? 'bg-tactical-green' : 
          isRunning ? 'bg-tactical-amber animate-pulse' : 
          'bg-lattice-secondary'
        }`}></div>
        <span className="text-xs font-mono text-muted-foreground">
          {progress >= 100 ? 'COMPLETE' : isRunning ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
}