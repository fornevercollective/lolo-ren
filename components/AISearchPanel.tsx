import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Brain, Search, Sparkles, Zap, MessageSquare, TrendingUp, Shield, AlertTriangle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface AISearchResult {
  id: string;
  query: string;
  type: 'semantic' | 'temporal' | 'pattern' | 'anomaly';
  results: {
    summary: string;
    confidence: number;
    insights: string[];
    relatedEvents: Array<{
      id: string;
      timestamp: Date;
      relevance: number;
      snippet: string;
    }>;
    recommendations: string[];
  };
  timestamp: Date;
}

interface AISearchPanelProps {
  isPopout?: boolean;
  onTogglePopout?: () => void;
}

export function AISearchPanel({ isPopout = false, onTogglePopout }: AISearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<AISearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock AI search functionality
  const performAISearch = async (query: string) => {
    setIsSearching(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResult: AISearchResult = {
      id: `search-${Date.now()}`,
      query,
      type: 'semantic',
      results: {
        summary: `Found ${Math.floor(Math.random() * 20) + 5} relevant events matching "${query}". Analysis indicates potential security implications requiring tactical assessment.`,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        insights: [
          'Detected unusual pattern in terminal access events',
          'Correlation found between audio transcripts and screen captures',
          'Elevated security classification keywords identified',
          'Temporal clustering suggests coordinated activity'
        ],
        relatedEvents: [
          {
            id: 'evt-001',
            timestamp: new Date(Date.now() - 300000),
            relevance: 0.94,
            snippet: 'SSH connection to production server with elevated privileges'
          },
          {
            id: 'evt-003',
            timestamp: new Date(Date.now() - 180000),
            relevance: 0.89,
            snippet: 'CLASSIFIED document access during briefing window'
          },
          {
            id: 'evt-004',
            timestamp: new Date(Date.now() - 120000),
            relevance: 0.87,
            snippet: 'Network anomaly detection triggered security protocols'
          }
        ],
        recommendations: [
          'Review access logs for temporal correlation',
          'Escalate security assessment to THREATCON BRAVO',
          'Cross-reference with active mission parameters',
          'Implement enhanced monitoring protocols'
        ]
      },
      timestamp: new Date()
    };

    setSearchHistory(prev => [mockResult, ...prev.slice(0, 4)]); // Keep last 5 searches
    setSelectedResult(mockResult.id);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      performAISearch(searchQuery.trim());
    }
  };

  const quickSearches = [
    'security anomalies last 24h',
    'classified document access',
    'unusual network patterns',
    'voice command analysis',
    'suspicious terminal activity'
  ];

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'semantic': return <Brain className="w-3 h-3" />;
      case 'temporal': return <TrendingUp className="w-3 h-3" />;
      case 'pattern': return <Sparkles className="w-3 h-3" />;
      case 'anomaly': return <AlertTriangle className="w-3 h-3" />;
      default: return <Search className="w-3 h-3" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-tactical-green';
    if (confidence >= 0.8) return 'text-tactical-amber';
    return 'text-tactical-red';
  };

  const selectedSearch = searchHistory.find(s => s.id === selectedResult);

  return (
    <div className={`space-y-4 ${isPopout ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      {isPopout && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h2 className="text-primary font-mono">AI TACTICAL SEARCH</h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onTogglePopout}
            className="h-8 px-3 text-xs font-mono"
          >
            MINIMIZE
          </Button>
        </div>
      )}

      {/* Search Interface */}
      <Card className="lattice-container">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary text-sm">
            <Brain className="w-4 h-4" />
            AI INTELLIGENCE QUERY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Describe your tactical intelligence requirements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
              className="min-h-[60px] text-xs font-mono resize-none"
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="h-auto px-3 text-xs font-mono"
            >
              {isSearching ? (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                  ANALYZING
                </div>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  EXECUTE
                </>
              )}
            </Button>
          </div>

          {/* Quick Search Buttons */}
          <div className="flex flex-wrap gap-1">
            {quickSearches.map((quick) => (
              <Button
                key={quick}
                size="sm"
                variant="outline"
                onClick={() => setSearchQuery(quick)}
                className="h-6 px-2 text-xs font-mono"
              >
                {quick}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchHistory.length > 0 && (
        <Card className="lattice-container">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary text-sm">
              <MessageSquare className="w-4 h-4" />
              INTELLIGENCE ANALYSIS
              <Badge variant="secondary" className="text-xs font-mono">
                {searchHistory.length} QUERIES
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className={`${isPopout ? 'h-96' : 'h-64'}`}>
              <div className="space-y-3">
                {searchHistory.map((search) => (
                  <div
                    key={search.id}
                    className={`cursor-pointer transition-all border rounded p-3 ${
                      selectedResult === search.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-lattice-surface border-border hover:bg-lattice-surface/80'
                    }`}
                    onClick={() => setSelectedResult(search.id)}
                  >
                    {/* Search header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSearchTypeIcon(search.type)}
                        <Badge variant="outline" className="text-xs font-mono">
                          {search.type.toUpperCase()}
                        </Badge>
                        <span className={`text-xs font-mono ${getConfidenceColor(search.results.confidence)}`}>
                          {(search.results.confidence * 100).toFixed(0)}% CONF
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {search.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Query */}
                    <p className="text-sm font-mono mb-2 text-foreground">
                      {search.query}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {search.results.summary}
                    </p>

                    {/* Expanded details for selected search */}
                    {selectedResult === search.id && (
                      <div className="space-y-3 border-t border-border pt-3">
                        {/* Key Insights */}
                        <div>
                          <h4 className="text-xs font-mono text-primary mb-2 uppercase">
                            Key Intelligence
                          </h4>
                          <div className="space-y-1">
                            {search.results.insights.map((insight, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-tactical-green mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-foreground">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Related Events */}
                        <div>
                          <h4 className="text-xs font-mono text-primary mb-2 uppercase">
                            Related Events
                          </h4>
                          <div className="space-y-2">
                            {search.results.relatedEvents.map((event) => (
                              <div key={event.id} className="bg-lattice-surface/50 rounded p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {event.id}
                                  </Badge>
                                  <span className="text-xs text-tactical-green font-mono">
                                    {(event.relevance * 100).toFixed(0)}% REL
                                  </span>
                                </div>
                                <p className="text-xs text-foreground">{event.snippet}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="text-xs font-mono text-primary mb-2 uppercase">
                            Tactical Recommendations
                          </h4>
                          <div className="space-y-1">
                            {search.results.recommendations.map((rec, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <Shield className="w-3 h-3 text-tactical-amber mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-foreground">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            <Copy className="w-3 h-3 mr-1" />
                            COPY
                          </Button>
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            EXPORT
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {!isPopout && searchHistory.length > 0 && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onTogglePopout}
            className="h-7 px-3 text-xs font-mono"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            EXPAND ANALYSIS
          </Button>
        </div>
      )}
    </div>
  );
}