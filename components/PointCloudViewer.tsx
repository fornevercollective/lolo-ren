import React, { useRef, useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { RotateCw, ZoomIn, ZoomOut, Download, Maximize } from 'lucide-react';

interface PointCloudViewerProps {
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

export function PointCloudViewer({ 
  depthData, 
  normalData, 
  isProcessing, 
  params
}: PointCloudViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>();
  
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [pointSize, setPointSize] = useState(2.0);
  const [colorMode, setColorMode] = useState<'depth' | 'normals'>('depth');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const canvasWidth = 640;
  const canvasHeight = 480;

  // Vertex shader source
  const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    
    uniform mat4 u_mvpMatrix;
    uniform float u_pointSize;
    
    varying vec3 v_color;
    
    void main() {
      gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
      gl_PointSize = u_pointSize;
      v_color = a_color;
    }
  `;

  // Fragment shader source
  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    
    void main() {
      vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
      if (dot(circCoord, circCoord) > 1.0) {
        discard;
      }
      gl_FragColor = vec4(v_color, 1.0);
    }
  `;

  // Initialize WebGL
  const initWebGL = () => {
    if (!canvasRef.current) return false;

    const gl = canvasRef.current.getContext('webgl');
    if (!gl) return false;

    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return false;

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return false;

    programRef.current = program;
    gl.useProgram(program);

    // Enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    return true;
  };

  // Create shader
  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Create program
  const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  // Create matrix operations
  const createMVPMatrix = (): Float32Array => {
    const matrix = new Float32Array(16);
    
    // Identity matrix
    matrix[0] = matrix[5] = matrix[10] = matrix[15] = 1.0;

    // Apply zoom
    matrix[0] = matrix[5] = matrix[10] = zoom;

    // Apply rotation
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);

    // Rotation around X axis
    const rotX = new Float32Array([
      1, 0, 0, 0,
      0, cosX, -sinX, 0,
      0, sinX, cosX, 0,
      0, 0, 0, 1
    ]);

    // Rotation around Y axis
    const rotY = new Float32Array([
      cosY, 0, sinY, 0,
      0, 1, 0, 0,
      -sinY, 0, cosY, 0,
      0, 0, 0, 1
    ]);

    // Multiply matrices
    const result = new Float32Array(16);
    multiplyMatrices(rotY, rotX, result);
    multiplyMatrices(result, matrix, matrix);

    return matrix;
  };

  // Matrix multiplication
  const multiplyMatrices = (a: Float32Array, b: Float32Array, result: Float32Array) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i * 4 + j] = 0;
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        }
      }
    }
  };

  // Generate point cloud data
  const generatePointCloud = () => {
    if (!depthData || !glRef.current || !programRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;

    const points: number[] = [];
    const colors: number[] = [];

    const dataWidth = 320;
    const dataHeight = 240;

    for (let y = 0; y < dataHeight; y += 2) { // Subsample for performance
      for (let x = 0; x < dataWidth; x += 2) {
        const i = y * dataWidth + x;
        const depth = depthData[i];

        if (depth === 0) continue;

        // Convert to 3D world coordinates with depth scale
        const worldX = (x - dataWidth / 2) / dataWidth * 2;
        const worldY = -(y - dataHeight / 2) / dataHeight * 2;
        const worldZ = depth * params.depthScale * 2 - 1;

        points.push(worldX, worldY, worldZ);

        // Color based on mode
        if (colorMode === 'depth') {
          const normalizedDepth = depth;
          const r = normalizedDepth;
          const g = 1 - normalizedDepth;
          const b = 0.5;
          colors.push(r, g, b);
        } else if (normalData) {
          const nx = (normalData[i * 3] + 1) * 0.5 * params.normalStrength;
          const ny = (normalData[i * 3 + 1] + 1) * 0.5 * params.normalStrength;
          const nz = (normalData[i * 3 + 2] + 1) * 0.5 * params.normalStrength;
          colors.push(nx, ny, nz);
        } else {
          colors.push(1, 1, 1);
        }
      }
    }

    if (points.length === 0) return;

    // Create buffers
    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    // Position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // Color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    // Set uniforms
    const mvpMatrix = createMVPMatrix();
    const mvpLocation = gl.getUniformLocation(program, 'u_mvpMatrix');
    gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);

    const pointSizeLocation = gl.getUniformLocation(program, 'u_pointSize');
    gl.uniform1f(pointSizeLocation, pointSize);

    // Render
    gl.viewport(0, 0, canvasWidth, canvasHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length / 3);
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsMouseDown(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    setRotation(prev => ({
      x: prev.x + deltaY * 0.01,
      y: prev.y + deltaX * 0.01
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Export point cloud
  const exportPointCloud = () => {
    if (!depthData) return;

    const points: { x: number; y: number; z: number; r: number; g: number; b: number }[] = [];
    const dataWidth = 320;
    const dataHeight = 240;

    for (let y = 0; y < dataHeight; y++) {
      for (let x = 0; x < dataWidth; x++) {
        const i = y * dataWidth + x;
        const depth = depthData[i];

        if (depth === 0) continue;

        const worldX = (x - dataWidth / 2) / dataWidth * 2;
        const worldY = -(y - dataHeight / 2) / dataHeight * 2;
        const worldZ = depth * params.depthScale * 2 - 1;

        let r = 1, g = 1, b = 1;
        if (colorMode === 'depth') {
          r = depth;
          g = 1 - depth;
          b = 0.5;
        } else if (normalData) {
          r = (normalData[i * 3] + 1) * 0.5;
          g = (normalData[i * 3 + 1] + 1) * 0.5;
          b = (normalData[i * 3 + 2] + 1) * 0.5;
        }

        points.push({ x: worldX, y: worldY, z: worldZ, r, g, b });
      }
    }

    // Generate PLY format
    const plyHeader = `ply
format ascii 1.0
element vertex ${points.length}
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
`;

    const plyData = points.map(p => 
      `${p.x.toFixed(6)} ${p.y.toFixed(6)} ${p.z.toFixed(6)} ${Math.round(p.r * 255)} ${Math.round(p.g * 255)} ${Math.round(p.b * 255)}`
    ).join('\n');

    const blob = new Blob([plyHeader + plyData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `point_cloud_${Date.now()}.ply`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (initWebGL()) {
      generatePointCloud();
    }
  }, []);

  useEffect(() => {
    generatePointCloud();
  }, [depthData, normalData, rotation, zoom, pointSize, colorMode, params]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={isProcessing ? "default" : "secondary"}>
            {isProcessing ? "Live" : "Paused"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setColorMode(colorMode === 'depth' ? 'normals' : 'depth')}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            {colorMode === 'depth' ? 'Depth Colors' : 'Normal Colors'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 3.0))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPointCloud}
            disabled={!depthData}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PLY
          </Button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="w-full h-auto border rounded-lg bg-black cursor-grab active:cursor-grabbing"
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {!depthData && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <p className="text-white font-mono text-sm">NO POINT CLOUD DATA</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-3 lattice-container">
          <h4 className="text-sm text-primary mb-2">POINT SIZE</h4>
          <Slider
            value={[pointSize]}
            onValueChange={(value) => setPointSize(value[0])}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            CURRENT: {pointSize}px
          </div>
        </Card>

        <Card className="p-3 lattice-container">
          <h4 className="text-sm text-primary mb-2">ZOOM LEVEL</h4>
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            min={0.1}
            max={3.0}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1 font-mono">
            CURRENT: {zoom.toFixed(1)}x
          </div>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="p-3 lattice-container">
        <h4 className="text-sm text-primary mb-2">POINT CLOUD CONTROLS</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
          <div>• CLICK AND DRAG TO ROTATE</div>
          <div>• USE ZOOM BUTTONS TO SCALE</div>
          <div>• TOGGLE COLOR MODE FOR DIFFERENT VIEWS</div>
          <div>• EXPORT AS PLY FILE FOR 3D SOFTWARE</div>
        </div>
      </Card>
    </div>
  );
}