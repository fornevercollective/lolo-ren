import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { 
  Brain, 
  Image, 
  Video, 
  Code, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Download, 
  Upload,
  RefreshCw,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Palette,
  Wand2,
  Sparkles
} from 'lucide-react';

interface StabilityAIPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  depthData?: Float32Array | null;
  normalData?: Float32Array | null;
  onImageGenerated?: (imageData: string) => void;
  onVideoGenerated?: (videoData: string) => void;
}

const STABILITY_MODELS = {
  'stable-diffusion-3': {
    name: 'Stable Diffusion 3',
    type: 'image',
    category: 'generation',
    description: 'Latest text-to-image generation model',
    capabilities: ['text-to-image', 'img-to-img', 'inpainting'],
    maxResolution: '2048x2048',
    processingTime: '3-8s'
  },
  'stable-video-diffusion': {
    name: 'Stable Video Diffusion',
    type: 'video',
    category: 'generation',
    description: 'Video generation from images and text',
    capabilities: ['img-to-video', 'text-to-video'],
    maxResolution: '1024x576',
    processingTime: '30-120s'
  },
  'stable-code': {
    name: 'Stable Code',
    type: 'code',
    category: 'generation',
    description: 'Code generation and completion',
    capabilities: ['code-generation', 'code-completion', 'code-review'],
    maxTokens: '16k',
    processingTime: '1-3s'
  },
  'stable-lm': {
    name: 'Stable LM',
    type: 'language',
    category: 'analysis',
    description: 'Large language model for text analysis',
    capabilities: ['text-analysis', 'summarization', 'qa'],
    maxTokens: '4k',
    processingTime: '1-2s'
  },
  'stable-audio': {
    name: 'Stable Audio',
    type: 'audio',
    category: 'generation',
    description: 'Audio generation from text prompts',
    capabilities: ['text-to-audio', 'audio-editing'],
    maxDuration: '47s',
    processingTime: '10-30s'
  },
  'sdxl-turbo': {
    name: 'SDXL Turbo',
    type: 'image',
    category: 'realtime',
    description: 'Real-time image generation',
    capabilities: ['text-to-image', 'real-time'],
    maxResolution: '1024x1024',
    processingTime: '0.5-1s'
  }
};

export function StabilityAIPanel({
  isCollapsed = false,
  onToggleCollapse,
  depthData,
  normalData,
  onImageGenerated,
  onVideoGenerated
}: StabilityAIPanelProps) {
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [cfgScale, setCfgScale] = useState([7]);
  const [steps, setSteps] = useState([50]);
  const [seed, setSeed] = useState('');
  const [useDepthConditioning, setUseDepthConditioning] = useState(false);
  const [batchSize, setBatchSize] = useState(1);
  const [resolution, setResolution] = useState('1024x1024');
  
  const [generationStats, setGenerationStats] = useState({
    totalGenerations: 47,
    successfulGenerations: 45,
    failedGenerations: 2,
    averageTime: 4.2,
    lastGeneration: new Date(Date.now() - 120000),
    modelsUsed: 6,
    computeUsage: 78.5, // percentage
    queueLength: 0
  });

  const [modelStatus, setModelStatus] = useState({
    'stable-diffusion-3': 'operational',
    'stable-video-diffusion': 'operational', 
    'stable-code': 'operational',
    'stable-lm': 'operational',
    'stable-audio': 'degraded',
    'sdxl-turbo': 'operational'
  });

  const [apiKeyStatus, setApiKeyStatus] = useState('connected'); // connected, disconnected, invalid

  // Auto-update stats
  useEffect(() => {
    const interval = setInterval(() => {
      setGenerationStats(prev => ({
        ...prev,
        computeUsage: Math.max(10, Math.min(95, prev.computeUsage + (Math.random() - 0.5) * 5)),
        queueLength: Math.max(0, prev.queueLength + Math.floor(Math.random() * 3) - 1)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const model = STABILITY_MODELS[selectedModel as keyof typeof STABILITY_MODELS];
    const estimatedTime = parseFloat(model.processingTime.split('-')[1].replace('s', '')) * 1000;
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 95);
      });
    }, estimatedTime / 20);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, estimatedTime));
      
      setProgress(100);
      
      // Update stats
      setGenerationStats(prev => ({
        ...prev,
        totalGenerations: prev.totalGenerations + 1,
        successfulGenerations: prev.successfulGenerations + 1,
        lastGeneration: new Date(),
        averageTime: (prev.averageTime * 0.9 + estimatedTime / 1000 * 0.1)
      }));

      // Mock generated content
      if (model.type === 'image') {
        const mockImageData = `data:image/png;base64,generated-image-${Date.now()}`;
        onImageGenerated?.(mockImageData);
      } else if (model.type === 'video') {
        const mockVideoData = `data:video/mp4;base64,generated-video-${Date.now()}`;
        onVideoGenerated?.(mockVideoData);
      }

      clearInterval(progressInterval);
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationStats(prev => ({
        ...prev,
        totalGenerations: prev.totalGenerations + 1,
        failedGenerations: prev.failedGenerations + 1
      }));
      
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-tactical-green';
      case 'degraded': return 'text-tactical-amber';
      case 'offline': return 'text-tactical-red';
      default: return 'text-lattice-secondary';
    }
  };

  const getApiStatusIndicator = () => {
    switch (apiKeyStatus) {
      case 'connected': return <CheckCircle className="w-3 h-3 text-tactical-green" />;
      case 'invalid': return <AlertTriangle className="w-3 h-3 text-tactical-amber" />;
      case 'disconnected': return <AlertTriangle className="w-3 h-3 text-tactical-red" />;
      default: return <Clock className="w-3 h-3 text-lattice-secondary" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}S AGO`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}M AGO`;
    const hours = Math.floor(minutes / 60);
    return `${hours}H AGO`;
  };

  const selectedModelData = STABILITY_MODELS[selectedModel as keyof typeof STABILITY_MODELS];

  return (
    <Card className="lattice-container h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-primary">STABILITY AI PROCESSING</CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {selectedModelData.name}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {/* API Status */}
            <div className="flex items-center gap-1 text-xs">
              {getApiStatusIndicator()}
              <span className="text-muted-foreground">API</span>
            </div>
            
            {/* Model Status */}
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${modelStatus[selectedModel as keyof typeof modelStatus] === 'operational' ? 'bg-tactical-green' : modelStatus[selectedModel as keyof typeof modelStatus] === 'degraded' ? 'bg-tactical-amber' : 'bg-tactical-red'}`}></div>
              <span className="text-muted-foreground">MODEL</span>
            </div>

            {/* Processing Status */}
            <div className="flex items-center gap-1 text-xs">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-tactical-amber animate-pulse' : 'bg-lattice-secondary'}`}></div>
              <span className="text-muted-foreground">PROC</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
          <div className="bg-lattice-surface p-2 rounded border border-border">
            <div className="text-muted-foreground">GENERATIONS</div>
            <div className="font-mono text-foreground">{generationStats.successfulGenerations}/{generationStats.totalGenerations}</div>
          </div>
          <div className="bg-lattice-surface p-2 rounded border border-border">
            <div className="text-muted-foreground">AVG TIME</div>
            <div className="font-mono text-foreground">{generationStats.averageTime.toFixed(1)}s</div>
          </div>
          <div className="bg-lattice-surface p-2 rounded border border-border">
            <div className="text-muted-foreground">COMPUTE</div>
            <div className="font-mono text-foreground">{generationStats.computeUsage.toFixed(1)}%</div>
          </div>
          <div className="bg-lattice-surface p-2 rounded border border-border">
            <div className="text-muted-foreground">QUEUE</div>
            <div className="font-mono text-foreground">{generationStats.queueLength}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="generation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-lattice-surface">
            <TabsTrigger value="generation" className="font-mono text-xs">GENERATION</TabsTrigger>
            <TabsTrigger value="models" className="font-mono text-xs">MODELS</TabsTrigger>
            <TabsTrigger value="analysis" className="font-mono text-xs">ANALYSIS</TabsTrigger>
          </TabsList>

          <TabsContent value="generation" className="space-y-4">
            {/* Model Selection */}
            <div className="space-y-2">
              <Label>MODEL SELECTION</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STABILITY_MODELS).map(([key, model]) => (
                    <SelectItem key={key} value={key} className="font-mono">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getModelStatusColor(modelStatus[key as keyof typeof modelStatus]).replace('text-', 'bg-')}`}></div>
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs">{model.type}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Info */}
            <div className="bg-lattice-surface p-3 rounded border border-border">
              <div className="flex items-center gap-2 mb-2">
                {selectedModelData.type === 'image' && <Image className="w-4 h-4 text-chart-1" />}
                {selectedModelData.type === 'video' && <Video className="w-4 h-4 text-chart-2" />}
                {selectedModelData.type === 'code' && <Code className="w-4 h-4 text-chart-3" />}
                {selectedModelData.type === 'language' && <Brain className="w-4 h-4 text-chart-4" />}
                {selectedModelData.type === 'audio' && <Wand2 className="w-4 h-4 text-chart-5" />}
                <span className="font-medium text-sm">{selectedModelData.name}</span>
                <Badge variant="secondary" className="text-xs font-mono">
                  {selectedModelData.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{selectedModelData.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-mono ml-2 text-foreground">{selectedModelData.processingTime}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max Resolution:</span>
                  <span className="font-mono ml-2 text-foreground">{selectedModelData.maxResolution || selectedModelData.maxTokens || selectedModelData.maxDuration}</span>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label>PROMPT</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your generation prompt..."
                className="font-mono resize-none"
                rows={3}
              />
            </div>

            {/* Negative Prompt (for image models) */}
            {selectedModelData.type === 'image' && (
              <div className="space-y-2">
                <Label>NEGATIVE PROMPT</Label>
                <Textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to avoid in generation..."
                  className="font-mono resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Generation Parameters */}
            <div className="grid grid-cols-2 gap-4">
              {/* CFG Scale */}
              {(selectedModelData.type === 'image' || selectedModelData.type === 'video') && (
                <div className="space-y-2">
                  <Label>CFG SCALE: {cfgScale[0]}</Label>
                  <Slider
                    value={cfgScale}
                    onValueChange={setCfgScale}
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Steps */}
              {selectedModelData.type === 'image' && (
                <div className="space-y-2">
                  <Label>STEPS: {steps[0]}</Label>
                  <Slider
                    value={steps}
                    onValueChange={setSteps}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Seed */}
              <div className="space-y-2">
                <Label>SEED</Label>
                <Input
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random"
                  className="font-mono"
                />
              </div>

              {/* Resolution */}
              {(selectedModelData.type === 'image' || selectedModelData.type === 'video') && (
                <div className="space-y-2">
                  <Label>RESOLUTION</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512x512">512×512</SelectItem>
                      <SelectItem value="768x768">768×768</SelectItem>
                      <SelectItem value="1024x1024">1024×1024</SelectItem>
                      <SelectItem value="1024x768">1024×768</SelectItem>
                      <SelectItem value="768x1024">768×1024</SelectItem>
                      <SelectItem value="1536x1024">1536×1024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              {/* Depth Conditioning */}
              {depthData && selectedModelData.capabilities.includes('img-to-img') && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-chart-1" />
                    <Label>USE DEPTH CONDITIONING</Label>
                  </div>
                  <Switch
                    checked={useDepthConditioning}
                    onCheckedChange={setUseDepthConditioning}
                  />
                </div>
              )}

              {/* Batch Size */}
              <div className="flex items-center justify-between">
                <Label>BATCH SIZE: {batchSize}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                    className="h-7 w-7 p-0"
                  >
                    -
                  </Button>
                  <span className="font-mono text-sm w-8 text-center">{batchSize}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBatchSize(Math.min(4, batchSize + 1))}
                    className="h-7 w-7 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GENERATING...</span>
                  <span className="font-mono text-foreground">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isProcessing || !prompt.trim() || apiKeyStatus !== 'connected'}
              className="w-full h-12 font-mono"
              variant="default"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  GENERATING...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  GENERATE
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            {/* Model Status Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>MODEL STATUS</Label>
                <Badge variant="outline" className="text-xs font-mono">
                  {Object.values(modelStatus).filter(status => status === 'operational').length}/6 OPERATIONAL
                </Badge>
              </div>
              
              <div className="space-y-2">
                {Object.entries(STABILITY_MODELS).map(([key, model]) => (
                  <div key={key} className="bg-lattice-surface p-3 rounded border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {model.type === 'image' && <Image className="w-4 h-4 text-chart-1" />}
                        {model.type === 'video' && <Video className="w-4 h-4 text-chart-2" />}
                        {model.type === 'code' && <Code className="w-4 h-4 text-chart-3" />}
                        {model.type === 'language' && <Brain className="w-4 h-4 text-chart-4" />}
                        {model.type === 'audio' && <Wand2 className="w-4 h-4 text-chart-5" />}
                        <span className="font-medium text-sm">{model.name}</span>
                        <Badge variant="outline" className="text-xs">{model.category}</Badge>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs font-mono ${getModelStatusColor(modelStatus[key as keyof typeof modelStatus])}`}
                      >
                        {modelStatus[key as keyof typeof modelStatus].toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{model.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {/* Generation Analytics */}
            <div className="space-y-3">
              <Label>GENERATION ANALYTICS</Label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-lattice-surface p-3 rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">TOTAL GENERATIONS</div>
                  <div className="font-mono text-foreground">{generationStats.totalGenerations}</div>
                </div>
                <div className="bg-lattice-surface p-3 rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">SUCCESS RATE</div>
                  <div className="font-mono text-foreground">{((generationStats.successfulGenerations / generationStats.totalGenerations) * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-lattice-surface p-3 rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">AVG PROCESSING TIME</div>
                  <div className="font-mono text-foreground">{generationStats.averageTime.toFixed(1)}s</div>
                </div>
                <div className="bg-lattice-surface p-3 rounded border border-border">
                  <div className="text-xs text-muted-foreground mb-1">LAST GENERATION</div>
                  <div className="font-mono text-foreground">{formatTimeAgo(generationStats.lastGeneration)}</div>
                </div>
              </div>

              {/* Compute Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">COMPUTE USAGE</span>
                  <span className="font-mono text-foreground">{generationStats.computeUsage.toFixed(1)}%</span>
                </div>
                <Progress value={generationStats.computeUsage} className="h-2" />
              </div>

              {/* Model Usage Distribution */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">MODEL USAGE DISTRIBUTION</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Stable Diffusion 3</span>
                    <span className="font-mono">34%</span>
                  </div>
                  <Progress value={34} className="h-1" />
                  <div className="flex items-center justify-between text-xs">
                    <span>SDXL Turbo</span>
                    <span className="font-mono">28%</span>
                  </div>
                  <Progress value={28} className="h-1" />
                  <div className="flex items-center justify-between text-xs">
                    <span>Stable Video</span>
                    <span className="font-mono">18%</span>
                  </div>
                  <Progress value={18} className="h-1" />
                  <div className="flex items-center justify-between text-xs">
                    <span>Other Models</span>
                    <span className="font-mono">20%</span>
                  </div>
                  <Progress value={20} className="h-1" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}