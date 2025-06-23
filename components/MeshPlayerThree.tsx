import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Maximize2,
  Settings,
  Upload,
  Download,
  Layers,
  Zap,
  Box,
  Camera,
  Sun,
  Eye,
  Grid3X3,
  RefreshCw,
  Activity,
  Target,
  Volume2
} from 'lucide-react';
import { 
  getThreeInstance, 
  createStandardScene, 
  createStandardCamera, 
  createStandardRenderer, 
  addStandardLighting,
  createOrbitControls,
  disposeThreeObject,
  type ThreeModules 
} from './utils/three-manager';

interface MeshPlayerThreeProps {
  depthData?: Float32Array | null;
  normalData?: Float32Array | null;
  isProcessing: boolean;
  params: {
    depthScale: number;
    smoothing: number;
    threshold: number;
    normalStrength: number;
  };
}

interface MeshStats {
  vertices: number;
  faces: number;
  materials: number;
  textures: number;
  animations: number;
  fileSize: number;
  loadTime: number;
}

interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loop: boolean;
  speed: number;
}

export function MeshPlayerThree({ 
  depthData, 
  normalData, 
  isProcessing, 
  params 
}: MeshPlayerThreeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const meshRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const clockRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const threeModulesRef = useRef<ThreeModules | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeometry, setHasGeometry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mesh Statistics
  const [meshStats, setMeshStats] = useState<MeshStats>({
    vertices: 0,
    faces: 0,
    materials: 1,
    textures: 0,
    animations: 0,
    fileSize: 0,
    loadTime: 0
  });

  // Animation State
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    loop: true,
    speed: 1.0
  });

  // Display Controls
  const [displayControls, setDisplayControls] = useState({
    wireframe: false,
    showNormals: false,
    showGrid: true,
    showBounds: false,
    autoRotate: false,
    lighting: true,
    shadows: true,
    metalness: 0.1,
    roughness: 0.7,
    envMapIntensity: 1.0
  });

  // Camera Controls
  const [cameraControls, setCameraControls] = useState({
    distance: 10,
    azimuth: 0,
    elevation: 0,
    fov: 45,
    near: 0.1,
    far: 1000
  });

  // Initialize Three.js scene using centralized manager
  const initializeThreeJS = useCallback(async () => {
    if (!mountRef.current || isInitialized) return;

    try {
      setIsLoading(true);
      
      // Get the centralized Three.js instance
      const threeModules = await getThreeInstance();
      threeModulesRef.current = threeModules;
      const { THREE, OrbitControls } = threeModules;

      // Create scene using utility functions
      const scene = createStandardScene();
      sceneRef.current = scene;

      // Create camera
      const camera = createStandardCamera(
        cameraControls.fov,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        cameraControls.near,
        cameraControls.far
      );
      cameraRef.current = camera;

      // Create renderer
      const renderer = createStandardRenderer();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current = renderer;

      mountRef.current.appendChild(renderer.domElement);

      // Add orbit controls
      const controls = createOrbitControls(camera, renderer.domElement);
      controlsRef.current = controls;

      // Add standard lighting
      addStandardLighting(scene);

      // Add grid
      const gridHelper = new THREE.GridHelper(10, 10, 0x2563eb, 0x334155);
      gridHelper.visible = displayControls.showGrid;
      scene.add(gridHelper);

      // Create clock for animations
      clockRef.current = new THREE.Clock();

      setIsInitialized(true);
      setError(null);
      console.log('MeshPlayerThree: Three.js scene initialized using centralized manager');
      
    } catch (err) {
      console.error('Failed to initialize Three.js:', err);
      setError('Failed to initialize 3D engine');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, cameraControls.fov, cameraControls.near, cameraControls.far, displayControls.showGrid]);

  // Generate mesh from depth data
  const generateMeshFromDepth = useCallback(async () => {
    if (!depthData || !sceneRef.current || !isInitialized || !threeModulesRef.current) return;

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { THREE } = threeModulesRef.current;

      // Clear existing mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        disposeThreeObject(meshRef.current);
      }

      // Create geometry from depth data
      const width = 640;
      const height = 480;
      const geometry = new THREE.PlaneGeometry(10, 7.5, width - 1, height - 1);
      
      const vertices = geometry.attributes.position;
      for (let i = 0; i < vertices.count; i++) {
        const x = i % width;
        const y = Math.floor(i / width);
        const depthIndex = y * width + x;
        
        if (depthIndex < depthData.length) {
          const depth = depthData[depthIndex] * params.depthScale;
          vertices.setZ(i, depth);
        }
      }

      geometry.computeVertexNormals();

      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        wireframe: displayControls.wireframe,
        metalness: displayControls.metalness,
        roughness: displayControls.roughness,
        side: THREE.DoubleSide
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshRef.current = mesh;

      sceneRef.current.add(mesh);

      // Update stats
      const loadTime = performance.now() - startTime;
      setMeshStats({
        vertices: geometry.attributes.position.count,
        faces: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3,
        materials: 1,
        textures: 0,
        animations: 0,
        fileSize: depthData.byteLength,
        loadTime: Math.round(loadTime)
      });

      setHasGeometry(true);
      console.log('MeshPlayerThree: Mesh generated from depth data');
      
    } catch (err) {
      console.error('Failed to generate mesh:', err);
      setError('Failed to generate mesh from depth data');
    } finally {
      setIsLoading(false);
    }
  }, [depthData, params.depthScale, displayControls.wireframe, displayControls.metalness, displayControls.roughness, isInitialized]);

  // Animation loop
  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    // Update controls
    if (controlsRef.current) {
      controlsRef.current.update();
    }

    if (clockRef.current && animationState.isPlaying) {
      const delta = clockRef.current.getDelta();
      setAnimationState(prev => ({
        ...prev,
        currentTime: prev.currentTime + delta * prev.speed
      }));
    }

    if (displayControls.autoRotate && meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animationState.isPlaying, animationState.speed, displayControls.autoRotate]);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeThreeJS();
    
    const resizeObserver = new ResizeObserver(handleResize);
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (meshRef.current) {
        disposeThreeObject(meshRef.current);
      }
      if (rendererRef.current && mountRef.current && rendererRef.current.domElement) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [initializeThreeJS, handleResize]);

  // Start animation loop when initialized
  useEffect(() => {
    if (isInitialized) {
      animate();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized, animate]);

  // Generate mesh when depth data changes
  useEffect(() => {
    if (depthData && isInitialized) {
      generateMeshFromDepth();
    }
  }, [depthData, generateMeshFromDepth, isInitialized]);

  // Update material properties
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.wireframe = displayControls.wireframe;
      meshRef.current.material.metalness = displayControls.metalness;
      meshRef.current.material.roughness = displayControls.roughness;
      meshRef.current.material.needsUpdate = true;
    }
  }, [displayControls.wireframe, displayControls.metalness, displayControls.roughness]);

  // Animation controls
  const handlePlayPause = () => {
    setAnimationState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleStop = () => {
    setAnimationState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: 0 
    }));
  };

  const handleReset = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(5, 5, 5);
      cameraRef.current.lookAt(0, 0, 0);
    }
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <Card className="lattice-container border-tactical-red">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-tactical-red">
              <Box className="w-4 h-4" />
              <span className="text-sm font-mono">3D ERROR: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Viewer */}
      <Card className="lattice-container">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-primary" />
              <CardTitle className="text-primary">3D MESH PLAYER</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                THREE.JS
              </Badge>
              <Badge variant="outline" className={`font-mono text-xs ${hasGeometry ? 'text-tactical-green' : 'text-lattice-secondary'}`}>
                {hasGeometry ? 'MESH LOADED' : 'NO GEOMETRY'}
              </Badge>
              <Badge variant="outline" className={`font-mono text-xs ${isProcessing ? 'text-tactical-amber' : 'text-lattice-secondary'}`}>
                {isProcessing ? 'PROCESSING' : 'STANDBY'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* 3D Viewport */}
            <div 
              ref={mountRef}
              className="w-full h-[400px] bg-background border border-border rounded overflow-hidden relative"
            >
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 text-primary">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-mono">GENERATING MESH...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="text-center text-tactical-red">
                    <div className="text-sm font-mono">{error}</div>
                    <Button
                      size="sm"
                      onClick={() => setError(null)}
                      className="mt-2 h-7 px-2 text-xs font-mono"
                    >
                      RETRY
                    </Button>
                  </div>
                </div>
              )}
              
              {!hasGeometry && !isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div className="text-sm font-mono">NO MESH DATA</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Depth data required for mesh generation
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay Controls */}
            <div className="absolute top-2 left-2 flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                className="h-8 w-8 p-0"
              >
                <Target className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDisplayControls(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                className={`h-8 w-8 p-0 ${displayControls.autoRotate ? 'bg-primary text-primary-foreground' : ''}`}
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>

            {/* Performance Stats */}
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm border border-border rounded p-2">
              <div className="text-xs font-mono space-y-1">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">VERTICES:</span>
                  <span className="text-foreground">{meshStats.vertices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">FACES:</span>
                  <span className="text-foreground">{meshStats.faces.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">LOAD:</span>
                  <span className="text-foreground">{meshStats.loadTime}ms</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Playback Controls */}
        <Card className="lattice-container">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">PLAYBACK CONTROLS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Animation Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="h-8 px-3 text-xs font-mono flex-1"
              >
                {animationState.isPlaying ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {animationState.isPlaying ? 'PAUSE' : 'PLAY'}
              </Button>
              <Button
                size="sm"
                onClick={handleStop}
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <Square className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                onClick={handleReset}
                variant="outline"
                className="h-8 w-8 p-0"
              >
                <SkipBack className="w-3 h-3" />
              </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">TIME</span>
                <span className="font-mono text-foreground">
                  {animationState.currentTime.toFixed(2)}s
                </span>
              </div>
              <Progress value={(animationState.currentTime / Math.max(animationState.duration, 1)) * 100} className="h-2" />
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">SPEED</span>
                <span className="font-mono text-foreground">{animationState.speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[animationState.speed]}
                onValueChange={(value) => setAnimationState(prev => ({ ...prev, speed: value[0] }))}
                min={0.1}
                max={3.0}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Loop Control */}
            <div className="flex items-center justify-between">
              <Label>LOOP ANIMATION</Label>
              <Switch
                checked={animationState.loop}
                onCheckedChange={(checked) => setAnimationState(prev => ({ ...prev, loop: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Controls */}
        <Card className="lattice-container">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">DISPLAY CONTROLS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Material Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>WIREFRAME</Label>
                <Switch
                  checked={displayControls.wireframe}
                  onCheckedChange={(checked) => setDisplayControls(prev => ({ ...prev, wireframe: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>AUTO ROTATE</Label>
                <Switch
                  checked={displayControls.autoRotate}
                  onCheckedChange={(checked) => setDisplayControls(prev => ({ ...prev, autoRotate: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>SHOW GRID</Label>
                <Switch
                  checked={displayControls.showGrid}
                  onCheckedChange={(checked) => setDisplayControls(prev => ({ ...prev, showGrid: checked }))}
                />
              </div>
            </div>

            {/* Material Properties */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">METALNESS</span>
                  <span className="font-mono text-foreground">{displayControls.metalness.toFixed(2)}</span>
                </div>
                <Slider
                  value={[displayControls.metalness]}
                  onValueChange={(value) => setDisplayControls(prev => ({ ...prev, metalness: value[0] }))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">ROUGHNESS</span>
                  <span className="font-mono text-foreground">{displayControls.roughness.toFixed(2)}</span>
                </div>
                <Slider
                  value={[displayControls.roughness]}
                  onValueChange={(value) => setDisplayControls(prev => ({ ...prev, roughness: value[0] }))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mesh Statistics */}
        <Card className="lattice-container">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm">MESH STATISTICS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">VERTICES:</span>
                <span className="font-mono text-foreground">{meshStats.vertices.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">FACES:</span>
                <span className="font-mono text-foreground">{meshStats.faces.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MATERIALS:</span>
                <span className="font-mono text-foreground">{meshStats.materials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TEXTURES:</span>
                <span className="font-mono text-foreground">{meshStats.textures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ANIMATIONS:</span>
                <span className="font-mono text-foreground">{meshStats.animations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SIZE:</span>
                <span className="font-mono text-foreground">{(meshStats.fileSize / 1024).toFixed(1)}KB</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">LOAD TIME:</span>
                <span className="font-mono text-foreground">{meshStats.loadTime}ms</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => generateMeshFromDepth()}
                disabled={!depthData || isLoading}
                className="h-7 px-2 text-xs font-mono flex-1"
                variant="outline"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                REGENERATE
              </Button>
              <Button
                size="sm"
                className="h-7 px-2 text-xs font-mono flex-1"
                variant="outline"
              >
                <Download className="w-3 h-3 mr-1" />
                EXPORT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}