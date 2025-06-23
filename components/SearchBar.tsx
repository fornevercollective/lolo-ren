import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Search, Link, Github, Globe, Download, Loader, ExternalLink } from 'lucide-react';

interface SearchResult {
  id: string;
  url: string;
  type: 'image' | 'video' | 'nerf' | 'github' | 'dataset';
  title: string;
  description: string;
  thumbnail?: string;
  status: 'pending' | 'loading' | 'ready' | 'error';
}

interface SearchBarProps {
  onUrlImport: (url: string, type: string) => void;
  onSearchResult: (results: SearchResult[]) => void;
}

export function SearchBar({ onUrlImport, onSearchResult }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentUrls, setRecentUrls] = useState<string[]>([
    'https://github.com/nerfstudio-project/nerfstudio',
    'https://huggingface.co/datasets/depth-anything',
    'https://storage.googleapis.com/nerf-data/example.ply'
  ]);

  const detectUrlType = (url: string): 'image' | 'video' | 'nerf' | 'github' | 'dataset' => {
    if (url.includes('github.com')) return 'github';
    if (url.includes('huggingface.co') || url.includes('dataset')) return 'dataset';
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
    if (url.match(/\.(mp4|mov|avi|webm)$/i)) return 'video';
    if (url.match(/\.(ply|obj|json|nerf)$/i)) return 'nerf';
    return 'dataset';
  };

  const mockSearchResults: SearchResult[] = [
    {
      id: '1',
      url: 'https://github.com/nerfstudio-project/nerfstudio',
      type: 'github',
      title: 'NeRF Studio',
      description: 'A collaboration friendly studio for NeRFs',
      status: 'ready'
    },
    {
      id: '2',
      url: 'https://huggingface.co/datasets/depth-anything/depth-estimation',
      type: 'dataset',
      title: 'Depth Anything Dataset',
      description: 'Large-scale depth estimation dataset',
      status: 'ready'
    },
    {
      id: '3',
      url: 'https://storage.googleapis.com/nerf-data/lego.ply',
      type: 'nerf',
      title: 'Lego NeRF Scene',
      description: 'Classic LEGO NeRF dataset point cloud',
      status: 'ready'
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Check if it's a direct URL
    if (searchQuery.startsWith('http')) {
      const urlType = detectUrlType(searchQuery);
      onUrlImport(searchQuery, urlType);
      
      // Add to recent URLs
      setRecentUrls(prev => [searchQuery, ...prev.filter(url => url !== searchQuery)].slice(0, 5));
    } else {
      // Simulate search
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredResults = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      onSearchResult(filteredResults);
    }
    
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const importResult = (result: SearchResult) => {
    onUrlImport(result.url, result.type);
    setRecentUrls(prev => [result.url, ...prev.filter(url => url !== result.url)].slice(0, 5));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'dataset': return <Globe className="w-4 h-4" />;
      case 'nerf': return <Download className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'github': return 'bg-black text-white';
      case 'dataset': return 'bg-blue-500 text-white';
      case 'nerf': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Import from External Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter URL or search for datasets, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <Loader className="w-4 h-4 animate-spin" /> : 'Import'}
          </Button>
        </div>

        {/* Quick Import Examples */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Supported sources:</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Github className="w-3 h-3 mr-1" />
              GitHub Repos
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              HuggingFace
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Link className="w-3 h-3 mr-1" />
              Direct URLs
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Cloud Storage
            </Badge>
          </div>
        </div>

        {/* Recent URLs */}
        {recentUrls.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent URLs</p>
              <div className="space-y-1">
                {recentUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-mono">{url}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {detectUrlType(url)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUrlImport(url, detectUrlType(url))}
                      className="h-6 px-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Search Results</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <div key={result.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {result.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {result.url}
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => importResult(result)}
                    >
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}