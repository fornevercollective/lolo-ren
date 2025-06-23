import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Clock, Search, Monitor, Mic, Camera, Brain, Filter, Play, Pause, FastForward, Rewind, ExternalLink } from 'lucide-react';

interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'screen' | 'audio' | 'ocr' | 'ai_analysis';
  source: string;
  content: string;
  confidence: number;
  tags: string[];
  metadata: {
    duration?: number;
    location?: string;
    application?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
}

interface TimelineViewerProps {
  onEventSelect?: (event: TimelineEvent) => void;
  onSearchQuery?: (query: string) => void;
}

export function TimelineViewer({ onEventSelect, onSearchQuery }: TimelineViewerProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock timeline data generation
  useEffect(() => {
    const mockEvents: TimelineEvent[] = [
      {
        id: 'evt-001',
        timestamp: new Date(Date.now() - 300000),
        type: 'screen',
        source: 'SCREEN-CAP-01',
        content: 'Visual analysis: Terminal session with SSH connection to production server',
        confidence: 0.94,
        tags: ['terminal', 'ssh', 'production', 'security'],
        metadata: {
          duration: 45,
          application: 'Terminal.app',
          sentiment: 'neutral'
        }
      },
      {
        id: 'evt-002',
        timestamp: new Date(Date.now() - 240000),
        type: 'audio',
        source: 'MIC-01',
        content: 'Transcription: "Initiating tactical data recovery protocol alpha seven"',
        confidence: 0.89,
        tags: ['voice', 'protocol', 'tactical', 'data-recovery'],
        metadata: {
          duration: 12,
          sentiment: 'neutral'
        }
      },
      {
        id: 'evt-003',
        timestamp: new Date(Date.now() - 180000),
        type: 'ocr',
        source: 'OCR-ENGINE',
        content: 'Text extraction: "CLASSIFIED - Mission briefing document 2024-12-16"',
        confidence: 0.97,
        tags: ['classified', 'document', 'briefing', 'extraction'],
        metadata: {
          application: 'PDF Viewer',
          sentiment: 'neutral'
        }
      },
      {
        id: 'evt-004',
        timestamp: new Date(Date.now() - 120000),
        type: 'ai_analysis',
        source: 'AI-CORE-01',
        content: 'Pattern analysis: Detected anomalous network traffic spike at 14:23 UTC',
        confidence: 0.91,
        tags: ['ai', 'network', 'anomaly', 'security'],
        metadata: {
          sentiment: 'negative'
        }
      },
      {
        id: 'evt-005',
        timestamp: new Date(Date.now() - 60000),
        type: 'screen',
        source: 'SCREEN-CAP-02',
        content: 'Visual analysis: Lattice SDK interface with depth sensor calibration',
        confidence: 0.88,
        tags: ['lattice', 'calibration', 'sensors', 'interface'],
        metadata: {
          duration: 30,
          application: 'Lattice SDK',
          sentiment: 'positive'
        }
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'screen': return <Monitor className="w-3 h-3" />;
      case 'audio': return <Mic className="w-3 h-3" />;
      case 'ocr': return <Camera className="w-3 h-3" />;
      case 'ai_analysis': return <Brain className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-tactical-green';
    if (confidence >= 0.7) return 'text-tactical-amber';
    return 'text-tactical-red';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-tactical-green';
      case 'negative': return 'text-tactical-red';
      default: return 'text-muted-foreground';
    }
  };

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event.id);
    onEventSelect?.(event);
  };

  const handleSearch = () => {
    onSearchQuery?.(searchQuery);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}S AGO`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}M AGO`;
    const hours = Math.floor(minutes / 60);
    return `${hours}H AGO`;
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPlaying ? "destructive" : "default"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 px-3 text-xs font-mono"
          >
            {isPlaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {isPlaying ? 'PAUSE' : 'LIVE'}
          </Button>
          
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
            <Rewind className="w-3 h-3" />
          </Button>
          
          <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
            <FastForward className="w-3 h-3" />
          </Button>

          <Badge variant="secondary" className="text-xs font-mono">
            {filteredEvents.length} EVENTS
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-input border border-border rounded px-2 py-1 text-xs font-mono"
            >
              <option value="all">ALL</option>
              <option value="screen">SCREEN</option>
              <option value="audio">AUDIO</option>
              <option value="ocr">OCR</option>
              <option value="ai_analysis">AI</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Input
              placeholder="SEARCH TIMELINE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-40 h-8 text-xs font-mono"
            />
            <Button size="sm" variant="outline" onClick={handleSearch} className="h-8 px-2">
              <Search className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Events */}
      <ScrollArea className="h-96 border border-border rounded">
        <div className="p-4 space-y-3">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className={`relative cursor-pointer transition-all ${
                selectedEvent === event.id 
                  ? 'bg-primary/10 border-primary' 
                  : 'bg-lattice-surface hover:bg-lattice-surface/80'
              } border border-border rounded p-3`}
              onClick={() => handleEventClick(event)}
            >
              {/* Timeline connector */}
              {index < filteredEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-6 bg-border"></div>
              )}

              <div className="flex items-start gap-3">
                {/* Event type icon */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  event.type === 'screen' ? 'bg-chart-1/20 text-chart-1' :
                  event.type === 'audio' ? 'bg-chart-2/20 text-chart-2' :
                  event.type === 'ocr' ? 'bg-chart-3/20 text-chart-3' :
                  'bg-chart-4/20 text-chart-4'
                }`}>
                  {getEventIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Event header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {event.source}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimeAgo(event.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono ${getConfidenceColor(event.confidence)}`}>
                        {(event.confidence * 100).toFixed(0)}%
                      </span>
                      {event.metadata.sentiment && (
                        <div className={`w-2 h-2 rounded-full ${
                          event.metadata.sentiment === 'positive' ? 'bg-tactical-green' :
                          event.metadata.sentiment === 'negative' ? 'bg-tactical-red' :
                          'bg-muted-foreground'
                        }`}></div>
                      )}
                    </div>
                  </div>

                  {/* Event content */}
                  <p className="text-sm text-foreground mb-2 line-clamp-2">
                    {event.content}
                  </p>

                  {/* Event tags */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {event.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-1 py-0 h-5"
                      >
                        {tag.toUpperCase()}
                      </Badge>
                    ))}
                  </div>

                  {/* Event metadata */}
                  {(event.metadata.duration || event.metadata.application) && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {event.metadata.duration && (
                        <span className="font-mono">{event.metadata.duration}s</span>
                      )}
                      {event.metadata.application && (
                        <span className="font-mono">{event.metadata.application}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No timeline events found</p>
              <p className="text-xs">Adjust your search or filter criteria</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}