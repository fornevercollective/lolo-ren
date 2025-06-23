import React, { useState, useEffect, useRef } from 'react';
import { DepthCamera } from './components/DepthCamera';
import { DepthVisualizer } from './components/DepthVisualizer';
import { SurfaceNormalVisualizer } from './components/SurfaceNormalVisualizer';
import { PointCloudViewer } from './components/PointCloudViewer';
import { GaussianSplatsViewer } from './components/GaussianSplatsViewer';
import { LumaSplatsViewer } from './components/LumaSplatsViewer';
import { OctaneLatentRenderer } from './components/OctaneLatentRenderer';
import { MeshPlayerThree } from './components/MeshPlayerThree';
import { FloatingCameraSelector } from './components/FloatingCameraSelector';
import { ProcessingControls } from './components/ProcessingControls';
import { DepthControls } from './components/DepthControls';
import { ExportPanel } from './components/ExportPanel';
import { FileUploader } from './components/FileUploader';
import { SearchBar } from './components/SearchBar';
import { GitHubSync } from './components/GitHubSync';
import { TimelineViewer } from './components/TimelineViewer';
import { AISearchPanel } from './components/AISearchPanel';
import { WorkflowProgressBar } from './components/WorkflowProgressBar';
import { ThumbnailTimeline } from './components/ThumbnailTimeline';
import { StabilityAIPanel } from './components/StabilityAIPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';

// Lark 2-Letter Icon Codes
const ICONS = {
  // Core Application
  ed: 'ed', // Editor/Processing
  tm: 'tm', // Terminal/System
  ai: 'ai', // AI/Neural
  fl: 'fl', // Files/Assets
  sr: 'sr', // Search
  st: 'st', // Settings
  
  // Controls
  pl: '▶', // Play
  ps: '⏸', // Pause
  sp: '⏹', // Stop
  nx: '⏭', // Next
  bk: '⏮', // Back
  rt: '↻', // Rotate/Refresh
  
  // UI Elements
  up: '▲', // Up/Expand
  dn: '▼', // Down/Collapse
  lf: '◀', // Left
  rg: '▶', // Right
  cl: '✕', // Close
  mn: '☰', // Menu
  
  // Status
  ok: '●', // Operational/Success (green)
  wr: '●', // Warning (amber) 
  er: '●', // Error (red)
  of: '○', // Offline/Inactive
  
  // Data Types
  dp: 'dp', // Depth
  nr: 'nr', // Normal/Neural
  pc: 'pc', // Point Cloud
  ms: 'ms', // Mesh
  gs: 'gs', // Gaussian Splats
  ag: 'ag', // AI Generated (changed from 'ai')
  
  // Actions
  sv: 'sv', // Save
  ld: 'ld', // Load
  ex: 'ex', // Export
  im: 'im', // Import
  sy: 'sy', // Sync
  dl: 'dl', // Download
  
  // System
  cp: 'cp', // Compute/CPU
  ti: 'ti', // Time (changed from 'tm')
  db: 'db', // Database
  nw: 'nw', // Network
  sg: 'sg'  // Storage (changed from 'st')
} as const;

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSensor, setCurrentSensor] = useState(0);
  const [depthData, setDepthData] = useState<Float32Array | null>(null);
  const [normalData, setNormalData] = useState<Float32Array | null>(null);
  const [processingParams, setProcessingParams] = useState({
    depthScale: 1.0,
    smoothing: 0.5,
    threshold: 0.1,
    normalStrength: 1.0
  });
  const [importedAssets, setImportedAssets] = useState<any[]>([]);
  const [activeModule, setActiveModule] = useState('depth');
  const [missionStatus, setMissionStatus] = useState<'standby' | 'operational' | 'warning' | 'critical'>('standby');
  const [assetManagementCollapsed, setAssetManagementCollapsed] = useState(false);
  const [exportManagementCollapsed, setExportManagementCollapsed] = useState(false);
  const [sensorControlsCollapsed, setSensorControlsCollapsed] = useState(false);
  const [processingParamsCollapsed, setProcessingParamsCollapsed] = useState(false);
  const [operationsConsoleCollapsed, setOperationsConsoleCollapsed] = useState(false);
  const [timelineAnalysisCollapsed, setTimelineAnalysisCollapsed] = useState(false);
  const [autonomousDeploymentCollapsed, setAutonomousDeploymentCollapsed] = useState(false);
  const [stabilityAICollapsed, setStabilityAICollapsed] = useState(false);
  const [aiSearchPopout, setAiSearchPopout] = useState(false);

  // Timeline visibility state
  const [timelinesVisible, setTimelinesVisible] = useState(true);
  const [individualTimelineVisibility, setIndividualTimelineVisibility] = useState({
    assetManagement: true,
    sensorControl: true,
    operationsConsole: true,
    timelineAnalysis: true,
    exportManagement: true,
    autonomousDeployment: true,
    stabilityAI: true
  });

  // Timeline state for each section
  const [timelineFrames, setTimelineFrames] = useState({
    assetManagement: 0,
    sensorControl: 0,
    operationsConsole: 0,
    timelineAnalysis: 0,
    exportManagement: 0,
    autonomousDeployment: 0,
    stabilityAI: 0
  });

  // Stability AI state
  const [stabilityAIStats, setStabilityAIStats] = useState({
    totalGenerations: 47,
    successfulGenerations: 45,
    failedGenerations: 2,
    lastGeneration: new Date(Date.now() - 120000),
    activeModels: 6,
    computeUsage: 78.5,
    queueLength: 0,
    apiStatus: 'connected' as 'connected' | 'disconnected' | 'invalid'
  });

  // Generated content state
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);

  // Autonomous Deployment System State
  const [deploymentSectors, setDeploymentSectors] = useState([
    {
      id: 'ALPHA-01',
      name: 'sector alpha',
      status: 'operational' as 'operational' | 'deploying' | 'calibrating' | 'error' | 'standby',
      instances: 3,
      activeInstances: 3,
      coverage: 87.5,
      lastUpdate: new Date(),
      coordinates: { lat: 34.0522, lng: -118.2437 },
      aiAgents: 2,
      stagepoints: { completed: 8, total: 10, current: 'validation' },
      calibrationStatus: 'autonomous',
      floatingParams: { 
        basepoint: { x: 0, y: 0, z: 0 },
        drift: { x: 0.02, y: -0.01, z: 0.005 },
        confidence: 0.94
      }
    },
    {
      id: 'BRAVO-02',
      name: 'sector bravo', 
      status: 'deploying' as 'operational' | 'deploying' | 'calibrating' | 'error' | 'standby',
      instances: 2,
      activeInstances: 1,
      coverage: 34.2,
      lastUpdate: new Date(),
      coordinates: { lat: 34.0522, lng: -118.3437 },
      aiAgents: 1,
      stagepoints: { completed: 3, total: 10, current: 'sensor_init' },
      calibrationStatus: 'manual_required',
      floatingParams: { 
        basepoint: { x: 0, y: 0, z: 0 },
        drift: { x: 0.15, y: 0.08, z: -0.03 },
        confidence: 0.67
      }
    },
    {
      id: 'CHARLIE-03',
      name: 'sector charlie',
      status: 'calibrating' as 'operational' | 'deploying' | 'calibrating' | 'error' | 'standby',
      instances: 4,
      activeInstances: 4,
      coverage: 92.1,
      lastUpdate: new Date(),
      coordinates: { lat: 34.1522, lng: -118.2437 },
      aiAgents: 3,
      stagepoints: { completed: 9, total: 10, current: 'fine_tune' },
      calibrationStatus: 'autonomous',
      floatingParams: { 
        basepoint: { x: 0, y: 0, z: 0 },
        drift: { x: -0.01, y: 0.03, z: 0.002 },
        confidence: 0.98
      }
    },
    {
      id: 'DELTA-04',
      name: 'sector delta',
      status: 'standby' as 'operational' | 'deploying' | 'calibrating' | 'error' | 'standby',
      instances: 0,
      activeInstances: 0,
      coverage: 0,
      lastUpdate: new Date(),
      coordinates: { lat: 34.0222, lng: -118.1437 },
      aiAgents: 0,
      stagepoints: { completed: 0, total: 10, current: 'pending' },
      calibrationStatus: 'pending',
      floatingParams: { 
        basepoint: { x: 0, y: 0, z: 0 },
        drift: { x: 0, y: 0, z: 0 },
        confidence: 0
      }
    }
  ]);

  const [aiAgentStats, setAiAgentStats] = useState({
    totalAgents: 6,
    activeAgents: 6,
    autonomousDecisions: 247,
    lastDecision: new Date(Date.now() - 45000),
    coordinationEvents: 89,
    lastCoordination: new Date(Date.now() - 120000),
    errorCorrections: 12,
    averageResponseTime: 0.34, // seconds
    distributedTasks: 156,
    taskCompletionRate: 0.94
  });

  const [calibrationStats, setCalibrationStats] = useState({
    totalCalibrations: 23,
    autonomousCalibrations: 21,
    manualInterventions: 2,
    lastCalibration: new Date(Date.now() - 300000),
    averageCalibrationTime: 4.2, // minutes
    calibrationAccuracy: 0.967,
    driftCorrections: 45,
    baselineAdjustments: 12,
    parameterOptimizations: 78
  });

  const [stagePointTypes] = useState([
    'initialization', 'sensor_init', 'network_est', 'baseline_cal',
    'agent_deploy', 'validation', 'cross_check', 'optimization', 
    'fine_tune', 'operational'
  ]);

  // Workflow Progress State
  const [workflowProgress, setWorkflowProgress] = useState({
    assetManagement: { progress: 0, isRunning: false, currentStage: 0 },
    sensorControl: { progress: 0, isRunning: false, currentStage: 0 },
    operationsConsole: { progress: 0, isRunning: false, currentStage: 0 },
    timelineAnalysis: { progress: 0, isRunning: false, currentStage: 0 },
    exportManagement: { progress: 0, isRunning: false, currentStage: 0 },
    autonomousDeployment: { progress: 0, isRunning: false, currentStage: 0 },
    stabilityAI: { progress: 0, isRunning: false, currentStage: 0 }
  });

  // Workflow Stages
  const workflowStages = {
    assetManagement: ['ingest', 'validate', 'index', 'sync'],
    sensorControl: ['calibrate', 'acquire', 'process', 'validate'],
    operationsConsole: ['initialize', 'render', 'compute', 'optimize'],
    timelineAnalysis: ['extract', 'analyze', 'correlate', 'generate'],
    exportManagement: ['compile', 'compress', 'encrypt', 'distribute'],
    autonomousDeployment: ['instance', 'calibrate', 'deploy', 'validate'],
    stabilityAI: ['prompt', 'process', 'generate', 'enhance']
  };

  // Asset Management Status State
  const [assetStats, setAssetStats] = useState({
    ingestion: {
      totalFiles: 0,
      processing: 0,
      completed: 0,
      lastUpload: null as Date | null,
      transferRate: 0
    },
    external: {
      activeConnections: 0,
      lastSearch: null as Date | null,
      searchResults: 0,
      apiQueries: 0
    },
    synchronization: {
      repoConnected: false,
      lastSync: null as Date | null,
      syncStatus: 'idle' as 'idle' | 'syncing' | 'error' | 'complete',
      pendingChanges: 0,
      branchName: 'main'
    }
  });

  // Export Management Status State
  const [exportStats, setExportStats] = useState({
    archive: {
      totalExports: 0,
      processing: 0,
      completed: 0,
      lastExport: null as Date | null,
      exportRate: 0,
      totalSize: 0,
      compressionRatio: 85
    },
    storage: {
      localStorage: 2.4, // GB
      cloudStorage: 15.7, // GB
      totalCapacity: 500, // GB
      lastBackup: null as Date | null,
      storageStatus: 'optimal' as 'optimal' | 'warning' | 'critical'
    },
    distribution: {
      activeTransfers: 0,
      lastDistribution: null as Date | null,
      distributionTargets: ['secure-01', 'backup-02', 'analysis-03'],
      encryptionLevel: 'aes-256',
      distributionStatus: 'idle' as 'idle' | 'distributing' | 'error' | 'complete'
    }
  });

  // Timeline Analysis Status State
  const [timelineStats, setTimelineStats] = useState({
    extraction: {
      totalEvents: 0,
      processing: 0,
      completed: 0,
      lastCapture: null as Date | null,
      captureRate: 0,
      activeStreams: 3
    },
    analysis: {
      aiQueries: 0,
      lastAnalysis: null as Date | null,
      analysisStatus: 'idle' as 'idle' | 'analyzing' | 'error' | 'complete',
      confidenceScore: 0.92,
      anomaliesDetected: 2
    },
    intelligence: {
      totalInsights: 0,
      lastInsight: null as Date | null,
      threatLevel: 'nominal' as 'nominal' | 'elevated' | 'high' | 'critical',
      patternMatches: 0,
      classificationLevel: 'confidential'
    }
  });

  const sensorSystems = [
    { id: 0, name: 'lidar-01', type: 'rgb-d', status: 'operational', classification: 'primary' },
    { id: 1, name: 'stereo-l', type: 'stereo', status: 'operational', classification: 'secondary' },
    { id: 2, name: 'stereo-r', type: 'stereo', status: 'warning', classification: 'secondary' },
    { id: 3, name: 'thermal-01', type: 'thermal', status: 'operational', classification: 'tertiary' },
    { id: 4, name: 'radar-01', type: 'sar', status: 'operational', classification: 'primary' },
    { id: 5, name: 'flir-01', type: 'flir', status: 'operational', classification: 'secondary' },
    { id: 6, name: 'uv-spec', type: 'uv', status: 'degraded', classification: 'tertiary' },
    { id: 7, name: 'multi-01', type: 'multispectral', status: 'operational', classification: 'secondary' },
    { id: 8, name: 'nv-01', type: 'night vision', status: 'operational', classification: 'primary' },
    { id: 9, name: 'x-ray-01', type: 'x-ray', status: 'offline', classification: 'special' },
    { id: 10, name: 'sonar-01', type: 'acoustic', status: 'operational', classification: 'tertiary' },
    { id: 11, name: 'hyper-01', type: 'hyperspectral', status: 'operational', classification: 'secondary' }
  ];

  // Timeline frame handlers
  const handleTimelineFrameSelect = (section: string, frame: number) => {
    setTimelineFrames(prev => ({
      ...prev,
      [section]: frame
    }));
  };

  // Timeline visibility handlers
  const toggleGlobalTimelines = () => {
    setTimelinesVisible(!timelinesVisible);
  };

  const toggleIndividualTimeline = (section: string) => {
    setIndividualTimelineVisibility(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const toggleAllIndividualTimelines = (visible: boolean) => {
    setIndividualTimelineVisibility({
      assetManagement: visible,
      sensorControl: visible,
      operationsConsole: visible,
      timelineAnalysis: visible,
      exportManagement: visible,
      autonomousDeployment: visible,
      stabilityAI: visible
    });
  };

  // Check if timeline should be visible for a section
  const isTimelineVisible = (section: string) => {
    return timelinesVisible && individualTimelineVisibility[section as keyof typeof individualTimelineVisibility];
  };

  // Get count of visible timelines
  const getVisibleTimelineCount = () => {
    if (!timelinesVisible) return 0;
    return Object.values(individualTimelineVisibility).filter(Boolean).length;
  };

  // Stability AI handlers
  const handleImageGenerated = (imageData: string) => {
    setGeneratedImages(prev => [imageData, ...prev.slice(0, 9)]); // Keep last 10
    setStabilityAIStats(prev => ({
      ...prev,
      totalGenerations: prev.totalGenerations + 1,
      successfulGenerations: prev.successfulGenerations + 1,
      lastGeneration: new Date()
    }));
  };

  const handleVideoGenerated = (videoData: string) => {
    setGeneratedVideos(prev => [videoData, ...prev.slice(0, 4)]); // Keep last 5
    setStabilityAIStats(prev => ({
      ...prev,
      totalGenerations: prev.totalGenerations + 1,
      successfulGenerations: prev.successfulGenerations + 1,
      lastGeneration: new Date()
    }));
  };

  // Autonomous Deployment Handlers
  const handleSectorDeploy = (sectorId: string) => {
    console.log(`initiating deployment for sector: ${sectorId}`);
    setDeploymentSectors(prev => prev.map(sector => 
      sector.id === sectorId 
        ? { ...sector, status: 'deploying', stagepoints: { ...sector.stagepoints, current: 'initialization' } }
        : sector
    ));
    
    // Start deployment workflow
    setWorkflowProgress(prev => ({
      ...prev,
      autonomousDeployment: { progress: 5, isRunning: true, currentStage: 0 }
    }));
  };

  const handleSectorCalibrate = (sectorId: string) => {
    console.log(`initiating calibration for sector: ${sectorId}`);
    setDeploymentSectors(prev => prev.map(sector => 
      sector.id === sectorId 
        ? { ...sector, status: 'calibrating', calibrationStatus: 'autonomous' }
        : sector
    ));
    
    setCalibrationStats(prev => ({
      ...prev,
      totalCalibrations: prev.totalCalibrations + 1,
      autonomousCalibrations: prev.autonomousCalibrations + 1,
      lastCalibration: new Date()
    }));
  };

  const handleAIAgentDeploy = (sectorId: string) => {
    console.log(`deploying ai agent to sector: ${sectorId}`);
    setDeploymentSectors(prev => prev.map(sector => 
      sector.id === sectorId 
        ? { ...sector, aiAgents: sector.aiAgents + 1 }
        : sector
    ));
    
    setAiAgentStats(prev => ({
      ...prev,
      totalAgents: prev.totalAgents + 1,
      activeAgents: prev.activeAgents + 1,
      distributedTasks: prev.distributedTasks + 1,
      lastDecision: new Date()
    }));
  };

  const handleBasePointAdjust = (sectorId: string) => {
    console.log(`adjusting basepoint for sector: ${sectorId}`);
    setDeploymentSectors(prev => prev.map(sector => 
      sector.id === sectorId 
        ? { 
            ...sector, 
            floatingParams: {
              ...sector.floatingParams,
              basepoint: {
                x: sector.floatingParams.basepoint.x + (Math.random() - 0.5) * 0.1,
                y: sector.floatingParams.basepoint.y + (Math.random() - 0.5) * 0.1,
                z: sector.floatingParams.basepoint.z + (Math.random() - 0.5) * 0.1
              },
              confidence: Math.min(0.99, sector.floatingParams.confidence + 0.02)
            }
          }
        : sector
    ));
    
    setCalibrationStats(prev => ({
      ...prev,
      baselineAdjustments: prev.baselineAdjustments + 1,
      parameterOptimizations: prev.parameterOptimizations + 1
    }));
  };

  const handleGlobalAutonomousMode = () => {
    console.log('enabling global autonomous mode');
    setDeploymentSectors(prev => prev.map(sector => ({
      ...sector,
      calibrationStatus: 'autonomous'
    })));
    
    setMissionStatus('operational');
  };

  // Auto-advance timeline frames when processing
  useEffect(() => {
    const interval = setInterval(() => {
      if (isProcessing) {
        setTimelineFrames(prev => ({
          assetManagement: workflowProgress.assetManagement.isRunning ? (prev.assetManagement + 1) % 20 : prev.assetManagement,
          sensorControl: workflowProgress.sensorControl.isRunning ? (prev.sensorControl + 1) % 20 : prev.sensorControl,
          operationsConsole: workflowProgress.operationsConsole.isRunning ? (prev.operationsConsole + 1) % 20 : prev.operationsConsole,
          timelineAnalysis: workflowProgress.timelineAnalysis.isRunning ? (prev.timelineAnalysis + 1) % 20 : prev.timelineAnalysis,
          exportManagement: workflowProgress.exportManagement.isRunning ? (prev.exportManagement + 1) % 20 : prev.exportManagement,
          autonomousDeployment: workflowProgress.autonomousDeployment.isRunning ? (prev.autonomousDeployment + 1) % 20 : prev.autonomousDeployment,
          stabilityAI: workflowProgress.stabilityAI.isRunning ? (prev.stabilityAI + 1) % 20 : prev.stabilityAI
        }));
      }
    }, 400); // Update every 400ms for smooth progression

    return () => clearInterval(interval);
  }, [isProcessing, workflowProgress]);

  // Autonomous system updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update AI agent decisions
      setAiAgentStats(prev => ({
        ...prev,
        autonomousDecisions: prev.autonomousDecisions + Math.floor(Math.random() * 3),
        coordinationEvents: prev.coordinationEvents + Math.floor(Math.random() * 2),
        lastDecision: Math.random() > 0.7 ? new Date() : prev.lastDecision,
        lastCoordination: Math.random() > 0.8 ? new Date() : prev.lastCoordination
      }));

      // Update Stability AI stats
      setStabilityAIStats(prev => ({
        ...prev,
        computeUsage: Math.max(10, Math.min(95, prev.computeUsage + (Math.random() - 0.5) * 5)),
        queueLength: Math.max(0, prev.queueLength + Math.floor(Math.random() * 3) - 1)
      }));

      // Update sector coverage and drift
      setDeploymentSectors(prev => prev.map(sector => {
        if (sector.status === 'operational' || sector.status === 'deploying') {
          const coverageChange = (Math.random() - 0.5) * 2;
          const newCoverage = Math.max(0, Math.min(100, sector.coverage + coverageChange));
          
          return {
            ...sector,
            coverage: newCoverage,
            lastUpdate: new Date(),
            floatingParams: {
              ...sector.floatingParams,
              drift: {
                x: sector.floatingParams.drift.x + (Math.random() - 0.5) * 0.01,
                y: sector.floatingParams.drift.y + (Math.random() - 0.5) * 0.01,
                z: sector.floatingParams.drift.z + (Math.random() - 0.5) * 0.005
              },
              confidence: Math.max(0.1, Math.min(1.0, sector.floatingParams.confidence + (Math.random() - 0.5) * 0.05))
            }
          };
        }
        return sector;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Workflow Progress Handlers
  const startWorkflow = (section: string) => {
    setWorkflowProgress(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], isRunning: true }
    }));
  };

  const pauseWorkflow = (section: string) => {
    setWorkflowProgress(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], isRunning: false }
    }));
  };

  const resetWorkflow = (section: string) => {
    setWorkflowProgress(prev => ({
      ...prev,
      [section]: { progress: 0, isRunning: false, currentStage: 0 }
    }));
    setTimelineFrames(prev => ({
      ...prev,
      [section]: 0
    }));
  };

  // Auto-progress workflow when running
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflowProgress(prev => {
        const newProgress = { ...prev };
        
        Object.keys(newProgress).forEach(section => {
          const workflow = newProgress[section as keyof typeof newProgress];
          if (workflow.isRunning && workflow.progress < 100) {
            const increment = Math.random() * 3 + 0.5; // Random progress between 0.5-3.5%
            const newProgressValue = Math.min(workflow.progress + increment, 100);
            const stageLength = 25; // Each stage is 25% of total progress
            const newStage = Math.floor(newProgressValue / stageLength);
            
            newProgress[section as keyof typeof newProgress] = {
              ...workflow,
              progress: newProgressValue,
              currentStage: Math.min(newStage, 3),
              isRunning: newProgressValue < 100 // Stop when complete
            };
          }
        });
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleDepthUpdate = (newDepthData: Float32Array) => {
    setDepthData(newDepthData);
    setMissionStatus('operational');
  };

  const handleNormalUpdate = (newNormalData: Float32Array) => {
    setNormalData(newNormalData);
  };

  const toggleProcessing = () => {
    setIsProcessing(!isProcessing);
    setMissionStatus(isProcessing ? 'standby' : 'operational');
  };

  const handleAssetUpload = (files: any[]) => {
    setImportedAssets(prev => [...prev, ...files]);
    setAssetStats(prev => ({
      ...prev,
      ingestion: {
        ...prev.ingestion,
        totalFiles: prev.ingestion.totalFiles + files.length,
        processing: prev.ingestion.processing + files.length,
        lastUpload: new Date(),
        transferRate: Math.random() * 50 + 10 // Mock transfer rate in MB/s
      }
    }));
    console.log('assets uploaded:', files);
  };

  const handleAssetProcess = (file: any) => {
    console.log('processing asset:', file);
    
    // Update processing stats
    setAssetStats(prev => ({
      ...prev,
      ingestion: {
        ...prev.ingestion,
        processing: Math.max(0, prev.ingestion.processing - 1),
        completed: prev.ingestion.completed + 1
      }
    }));
    
    // Mock processing - generate sample data based on file type
    if (file.type === 'image' || file.type === 'video') {
      // Generate sample depth data
      const sampleDepth = new Float32Array(640 * 480);
      for (let i = 0; i < sampleDepth.length; i++) {
        sampleDepth[i] = Math.random() * 10;
      }
      setDepthData(sampleDepth);
      
      // Generate sample normal data
      const sampleNormals = new Float32Array(640 * 480 * 3);
      for (let i = 0; i < sampleNormals.length; i += 3) {
        sampleNormals[i] = Math.random() * 2 - 1;
        sampleNormals[i + 1] = Math.random() * 2 - 1;
        sampleNormals[i + 2] = Math.random() * 2 - 1;
      }
      setNormalData(sampleNormals);
      
      setIsProcessing(true);
      setMissionStatus('operational');
      setTimeout(() => {
        setIsProcessing(false);
        setMissionStatus('standby');
      }, 3000);
    }
  };

  const handleUrlImport = (url: string, type: string) => {
    console.log('importing external asset:', url, type);
    setAssetStats(prev => ({
      ...prev,
      external: {
        ...prev.external,
        activeConnections: prev.external.activeConnections + 1,
        apiQueries: prev.external.apiQueries + 1
      }
    }));
  };

  const handleSearchResult = (results: any[]) => {
    console.log('search results:', results);
    setAssetStats(prev => ({
      ...prev,
      external: {
        ...prev.external,
        lastSearch: new Date(),
        searchResults: results.length,
        activeConnections: Math.max(0, prev.external.activeConnections - 1)
      }
    }));
  };

  const handleLatticeSync = (repo: any, data: any) => {
    console.log('syncing to repository:', repo, data);
    setAssetStats(prev => ({
      ...prev,
      synchronization: {
        ...prev.synchronization,
        repoConnected: true,
        lastSync: new Date(),
        syncStatus: 'syncing',
        pendingChanges: Math.max(0, prev.synchronization.pendingChanges - 1)
      }
    }));

    // Simulate sync completion
    setTimeout(() => {
      setAssetStats(prev => ({
        ...prev,
        synchronization: {
          ...prev.synchronization,
          syncStatus: 'complete'
        }
      }));
    }, 2000);
  };

  // Export handlers
  const handleQuickExport = (type: 'depth' | 'normal' | 'complete' | 'archive') => {
    console.log(`quick export initiated: ${type}`);
    setExportStats(prev => ({
      ...prev,
      archive: {
        ...prev.archive,
        processing: prev.archive.processing + 1,
        totalExports: prev.archive.totalExports + 1,
        lastExport: new Date(),
        exportRate: Math.random() * 25 + 5,
        totalSize: prev.archive.totalSize + Math.random() * 500 + 100
      }
    }));

    // Simulate export completion
    setTimeout(() => {
      setExportStats(prev => ({
        ...prev,
        archive: {
          ...prev.archive,
          processing: Math.max(0, prev.archive.processing - 1),
          completed: prev.archive.completed + 1
        }
      }));
    }, 3000);
  };

  const handleDistribution = (target: string) => {
    console.log(`distribution initiated to: ${target}`);
    setExportStats(prev => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        activeTransfers: prev.distribution.activeTransfers + 1,
        lastDistribution: new Date(),
        distributionStatus: 'distributing'
      }
    }));

    // Simulate distribution completion
    setTimeout(() => {
      setExportStats(prev => ({
        ...prev,
        distribution: {
          ...prev.distribution,
          activeTransfers: Math.max(0, prev.distribution.activeTransfers - 1),
          distributionStatus: 'complete'
        }
      }));
    }, 5000);
  };

  // Timeline handlers
  const handleTimelineEventSelect = (event: any) => {
    console.log('timeline event selected:', event);
    setTimelineStats(prev => ({
      ...prev,
      extraction: {
        ...prev.extraction,
        completed: prev.extraction.completed + 1,
        lastCapture: new Date()
      }
    }));
  };

  const handleAISearchQuery = (query: string) => {
    console.log('ai search query:', query);
    setTimelineStats(prev => ({
      ...prev,
      analysis: {
        ...prev.analysis,
        aiQueries: prev.analysis.aiQueries + 1,
        lastAnalysis: new Date(),
        analysisStatus: 'analyzing'
      }
    }));

    // Simulate AI analysis completion
    setTimeout(() => {
      setTimelineStats(prev => ({
        ...prev,
        analysis: {
          ...prev.analysis,
          analysisStatus: 'complete',
          anomaliesDetected: prev.analysis.anomaliesDetected + Math.floor(Math.random() * 3)
        },
        intelligence: {
          ...prev.intelligence,
          totalInsights: prev.intelligence.totalInsights + 1,
          lastInsight: new Date(),
          patternMatches: prev.intelligence.patternMatches + Math.floor(Math.random() * 5)
        }
      }));
    }, 3000);
  };

  const getCurrentTime = () => {
    return new Date().toISOString().replace('T', ' ').split('.')[0];
  };

  const getMissionStatusColor = () => {
    switch (missionStatus) {
      case 'operational': return 'text-terminal-green';
      case 'warning': return 'text-terminal-amber';
      case 'critical': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'syncing': 
      case 'distributing':
      case 'analyzing':
      case 'deploying':
      case 'calibrating': return <span className="status-dot warning"></span>;
      case 'complete':
      case 'operational': return <span className="status-dot active"></span>;
      case 'error': return <span className="status-dot error"></span>;
      default: return <span className="status-dot inactive"></span>;
    }
  };

  const getSectorStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-terminal-green';
      case 'deploying': return 'text-terminal-blue';
      case 'calibrating': return 'text-terminal-amber';
      case 'error': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  const getCalibrationStatusColor = (status: string) => {
    switch (status) {
      case 'autonomous': return 'text-terminal-green';
      case 'manual_required': return 'text-terminal-amber';
      case 'pending': return 'text-muted-foreground';
      case 'error': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  const getStorageUsagePercent = () => {
    return ((exportStats.storage.localStorage + exportStats.storage.cloudStorage) / exportStats.storage.totalCapacity) * 100;
  };

  const getStorageStatusColor = () => {
    const usage = getStorageUsagePercent();
    if (usage > 85) return 'text-terminal-red';
    if (usage > 70) return 'text-terminal-amber';
    return 'text-terminal-green';
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-terminal-red';
      case 'high': return 'text-terminal-amber';
      case 'elevated': return 'text-terminal-amber';
      default: return 'text-terminal-green';
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-terminal-green';
      case 'warning': return 'text-terminal-amber';
      case 'degraded': return 'text-terminal-amber';
      case 'offline': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  const getCurrentSensor = () => {
    return sensorSystems.find(sensor => sensor.id === currentSensor) || sensorSystems[0];
  };

  const getActiveModuleDisplayName = () => {
    switch (activeModule) {
      case 'depth': return 'depth';
      case 'normals': return 'normals';
      case 'pointcloud': return 'cloud';
      case 'gaussian': return 'gaussian';
      case 'luma': return 'neural';
      case 'octane': return 'octane';
      case 'mesh': return 'mesh';
      default: return 'depth';
    }
  };

  const getTotalActiveSectors = () => {
    return deploymentSectors.filter(sector => sector.status === 'operational').length;
  };

  const getTotalCoverage = () => {
    const totalCoverage = deploymentSectors.reduce((sum, sector) => sum + sector.coverage, 0);
    return totalCoverage / deploymentSectors.length;
  };

  const getTotalInstances = () => {
    return deploymentSectors.reduce((sum, sector) => sum + sector.instances, 0);
  };

  const getActiveInstances = () => {
    return deploymentSectors.reduce((sum, sector) => sum + sector.activeInstances, 0);
  };

  // Initialize timeline stats
  useEffect(() => {
    setTimelineStats(prev => ({
      ...prev,
      extraction: {
        ...prev.extraction,
        totalEvents: 47,
        completed: 42,
        processing: 2,
        lastCapture: new Date(Date.now() - 30000),
        captureRate: 12.5
      },
      intelligence: {
        ...prev.intelligence,
        totalInsights: 15,
        lastInsight: new Date(Date.now() - 120000),
        patternMatches: 8
      }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background font-mono subtle-scrollbar">
      {/* AI Search Popout */}
      {aiSearchPopout && (
        <AISearchPanel
          isPopout={true}
          onTogglePopout={() => setAiSearchPopout(false)}
        />
      )}

      <div className="max-w-full mx-auto p-4 space-y-4">
        {/* Terminal Header */}
        <div className="terminal-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="terminal-code">tm</span>
              <div>
                <h1 className="text-primary mb-1 animate-underline">render-neural</h1>
                <p className="text-muted-foreground text-xs">
                  spatial intelligence &amp; neural field processing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-muted-foreground">
                <div>system time</div>
                <div className="font-mono">{getCurrentTime()}</div>
              </div>
              <div className={`terminal-code ${getMissionStatusColor()}`}>
                {missionStatus}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="terminal-code">dp</span>
                <span className="text-sm">depth processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="terminal-code">nr</span>
                <span className="text-sm">neural rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="terminal-code">pc</span>
                <span className="text-sm">3d reconstruction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="terminal-code">ms</span>
                <span className="text-sm">mesh processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="terminal-code">ai</span>
                <span className="text-sm">stability ai</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Timeline Controls */}
              <div className="flex items-center gap-2 border-r border-border pr-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="terminal-code">tm</span>
                  <span>timelines</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getVisibleTimelineCount()}/7
                </Badge>
                <Button
                  size="sm"
                  variant={timelinesVisible ? "default" : "outline"}
                  onClick={toggleGlobalTimelines}
                  className="terminal-button h-7 px-2 text-xs"
                >
                  <span className="terminal-code mr-1">{timelinesVisible ? 'on' : 'of'}</span>
                  {timelinesVisible ? "show" : "hide"}
                </Button>
                {timelinesVisible && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAllIndividualTimelines(true)}
                      className="terminal-button h-6 px-1 text-xs"
                    >
                      all
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleAllIndividualTimelines(false)}
                      className="terminal-button h-6 px-1 text-xs"
                    >
                      off
                    </Button>
                  </div>
                )}
              </div>

              {/* Autonomous Status */}
              <div className="flex items-center gap-2 border-r border-border pr-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="terminal-code">au</span>
                  <span>sectors</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getTotalActiveSectors()}/{deploymentSectors.length}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getTotalCoverage().toFixed(1)}%
                </Badge>
              </div>

              {/* Stability AI Status */}
              <div className="flex items-center gap-2 border-r border-border pr-3">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="terminal-code">ai</span>
                  <span>stability</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {stabilityAIStats.successfulGenerations}/{stabilityAIStats.totalGenerations}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {stabilityAIStats.computeUsage.toFixed(0)}%
                </Badge>
              </div>

              {importedAssets.length > 0 && (
                <Badge variant="outline" className="font-mono terminal-code">
                  {importedAssets.length} assets
                </Badge>
              )}
              <Button 
                onClick={toggleProcessing}
                variant={isProcessing ? "destructive" : "default"}
                className="terminal-button"
              >
                <span className="terminal-code mr-2">{isProcessing ? ICONS.ps : ICONS.pl}</span>
                {isProcessing ? "halt" : "execute"}
              </Button>
            </div>
          </div>
        </div>

        {/* Asset Management Section */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">fl</span>
                <h2 className="text-primary animate-underline">asset management systems</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {assetStats.ingestion.totalFiles + assetStats.external.searchResults} total assets
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('assetManagement')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.assetManagement ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="status-dot active"></span>
                    <span className="text-muted-foreground">ingestion</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${assetStats.external.activeConnections > 0 ? 'warning' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">external</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIndicator(assetStats.synchronization.syncStatus)}
                    <span className="text-muted-foreground">sync</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAssetManagementCollapsed(!assetManagementCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{assetManagementCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <WorkflowProgressBar
                title="asset"
                progress={workflowProgress.assetManagement.progress}
                isRunning={workflowProgress.assetManagement.isRunning}
                onStart={() => startWorkflow('assetManagement')}
                onPause={() => pauseWorkflow('assetManagement')}
                onReset={() => resetWorkflow('assetManagement')}
                stages={workflowStages.assetManagement}
                currentStage={workflowProgress.assetManagement.currentStage}
              />
            </div>

            {isTimelineVisible('assetManagement') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="asset processing"
                  currentFrame={timelineFrames.assetManagement}
                  isLive={workflowProgress.assetManagement.isRunning}
                  isProcessing={workflowProgress.assetManagement.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('assetManagement', frame)}
                  module="ingestion"
                />
              </div>
            )}
          </div>

          {!assetManagementCollapsed && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <FileUploader
                  onFileUpload={handleAssetUpload}
                  onFileProcess={handleAssetProcess}
                />
                <SearchBar
                  onUrlImport={handleUrlImport}
                  onSearchResult={handleSearchResult}
                />
                <GitHubSync
                  depthData={depthData}
                  normalData={normalData}
                  onSync={handleLatticeSync}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sensor Control Systems Section */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">sr</span>
                <h2 className="text-primary animate-underline">sensor control systems</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {sensorSystems.filter(s => s.status === 'operational').length}/{sensorSystems.length} operational
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getCurrentSensor().name}
                </Badge>
                <Badge variant="outline" className={`font-mono text-xs terminal-code ${getSensorStatusColor(getCurrentSensor().status)}`}>
                  {getCurrentSensor().status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timeline Toggle */}
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('sensorControl')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.sensorControl ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setCurrentSensor((prev) => (prev + 1) % sensorSystems.length)}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">nx</span>
                    next
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => startWorkflow('sensorControl')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">st</span>
                    calibrate
                  </Button>
                </div>

                {/* Quick Status Indicators */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${getCurrentSensor().status === 'operational' ? 'active' : getCurrentSensor().status === 'warning' ? 'warning' : 'error'}`}></span>
                    <span className="text-muted-foreground">sensor</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${workflowProgress.sensorControl.isRunning ? 'warning' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">processing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${depthData ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">data</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSensorControlsCollapsed(!sensorControlsCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{sensorControlsCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            {/* Workflow Progress Bar */}
            <div className="mt-4">
              <WorkflowProgressBar
                title="sensor"
                progress={workflowProgress.sensorControl.progress}
                isRunning={workflowProgress.sensorControl.isRunning}
                onStart={() => startWorkflow('sensorControl')}
                onPause={() => pauseWorkflow('sensorControl')}
                onReset={() => resetWorkflow('sensorControl')}
                stages={workflowStages.sensorControl}
                currentStage={workflowProgress.sensorControl.currentStage}
              />
            </div>

            {/* Thumbnail Timeline */}
            {isTimelineVisible('sensorControl') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="sensor acquisition"
                  currentFrame={timelineFrames.sensorControl}
                  isLive={workflowProgress.sensorControl.isRunning}
                  isProcessing={workflowProgress.sensorControl.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('sensorControl', frame)}
                  module="sensor"
                />
              </div>
            )}
          </div>

          {!sensorControlsCollapsed && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <DepthCamera
                    onDepthUpdate={handleDepthUpdate}
                    isProcessing={isProcessing}
                    selectedSensor={currentSensor}
                    sensorSystems={sensorSystems}
                  />
                  <DepthControls
                    params={processingParams}
                    onParamsChange={setProcessingParams}
                    isProcessing={isProcessing}
                  />
                </div>
                <div className="space-y-4">
                  <ProcessingControls
                    isProcessing={isProcessing}
                    onToggleProcessing={toggleProcessing}
                    activeModule={activeModule}
                    onModuleChange={setActiveModule}
                    currentSensor={currentSensor}
                    onSensorChange={setCurrentSensor}
                    sensorSystems={sensorSystems}
                    params={processingParams}
                    onParamsChange={setProcessingParams}
                  />
                  <FloatingCameraSelector
                    sensors={sensorSystems}
                    currentSensor={currentSensor}
                    onSensorChange={setCurrentSensor}
                    isExpanded={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Operations Console */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">ed</span>
                <h2 className="text-primary animate-underline">main operations console</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getActiveModuleDisplayName()}
                </Badge>
                <Badge variant="outline" className={`font-mono text-xs terminal-code ${isProcessing ? 'text-terminal-green' : 'text-muted-foreground'}`}>
                  {isProcessing ? 'processing' : 'standby'}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  640×480
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timeline Toggle */}
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('operationsConsole')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.operationsConsole ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setActiveModule('depth')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant={activeModule === 'depth' ? 'default' : 'outline'}
                  >
                    <span className="terminal-code mr-1">dp</span>
                    depth
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveModule('mesh')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant={activeModule === 'mesh' ? 'default' : 'outline'}
                  >
                    <span className="terminal-code mr-1">ms</span>
                    mesh
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveModule('gaussian')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant={activeModule === 'gaussian' ? 'default' : 'outline'}
                  >
                    <span className="terminal-code mr-1">gs</span>
                    gaussian
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setActiveModule('octane')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant={activeModule === 'octane' ? 'default' : 'outline'}
                  >
                    <span className="terminal-code mr-1">oc</span>
                    octane
                  </Button>
                </div>

                {/* Quick Status Indicators */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${depthData ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">depth</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${normalData ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">normals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${workflowProgress.operationsConsole.isRunning ? 'warning' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">render</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOperationsConsoleCollapsed(!operationsConsoleCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{operationsConsoleCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            {/* Workflow Progress Bar */}
            <div className="mt-4">
              <WorkflowProgressBar
                title="operations"
                progress={workflowProgress.operationsConsole.progress}
                isRunning={workflowProgress.operationsConsole.isRunning}
                onStart={() => startWorkflow('operationsConsole')}
                onPause={() => pauseWorkflow('operationsConsole')}
                onReset={() => resetWorkflow('operationsConsole')}
                stages={workflowStages.operationsConsole}
                currentStage={workflowProgress.operationsConsole.currentStage}
              />
            </div>

            {/* Thumbnail Timeline */}
            {isTimelineVisible('operationsConsole') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="neural rendering"
                  currentFrame={timelineFrames.operationsConsole}
                  isLive={workflowProgress.operationsConsole.isRunning}
                  isProcessing={workflowProgress.operationsConsole.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('operationsConsole', frame)}
                  module="neural"
                />
              </div>
            )}
          </div>

          {!operationsConsoleCollapsed && (
            <div className="p-4">
              <Tabs value={activeModule} onValueChange={setActiveModule}>
                <TabsList className="grid w-full grid-cols-7 bg-muted mb-4">
                  <TabsTrigger value="depth" className="font-mono text-xs terminal-code">depth</TabsTrigger>
                  <TabsTrigger value="normals" className="font-mono text-xs terminal-code">normals</TabsTrigger>
                  <TabsTrigger value="pointcloud" className="font-mono text-xs terminal-code">cloud</TabsTrigger>
                  <TabsTrigger value="mesh" className="font-mono text-xs terminal-code">mesh</TabsTrigger>
                  <TabsTrigger value="gaussian" className="font-mono text-xs terminal-code">gaussian</TabsTrigger>
                  <TabsTrigger value="luma" className="font-mono text-xs terminal-code">neural</TabsTrigger>
                  <TabsTrigger value="octane" className="font-mono text-xs terminal-code">octane</TabsTrigger>
                </TabsList>

                <TabsContent value="depth" className="space-y-4">
                  <DepthVisualizer
                    depthData={depthData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="normals" className="space-y-4">
                  <SurfaceNormalVisualizer
                    normalData={normalData}
                    depthData={depthData}
                    isProcessing={isProcessing}
                    onNormalUpdate={handleNormalUpdate}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="pointcloud" className="space-y-4">
                  <PointCloudViewer
                    depthData={depthData}
                    normalData={normalData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="mesh" className="space-y-4">
                  <MeshPlayerThree
                    depthData={depthData}
                    normalData={normalData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="gaussian" className="space-y-4">
                  <GaussianSplatsViewer
                    depthData={depthData}
                    normalData={normalData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="luma" className="space-y-4">
                  <LumaSplatsViewer
                    depthData={depthData}
                    normalData={normalData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>

                <TabsContent value="octane" className="space-y-4">
                  <OctaneLatentRenderer
                    depthData={depthData}
                    normalData={normalData}
                    isProcessing={isProcessing}
                    params={processingParams}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Stability AI Processing Section */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">ai</span>
                <h2 className="text-primary animate-underline">stability ai neural generation</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {stabilityAIStats.activeModels} models
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {stabilityAIStats.successfulGenerations} generated
                </Badge>
                <Badge variant="outline" className={`font-mono text-xs terminal-code ${stabilityAIStats.apiStatus === 'connected' ? 'text-terminal-green' : 'text-terminal-red'}`}>
                  {stabilityAIStats.apiStatus}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('stabilityAI')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.stabilityAI ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => startWorkflow('stabilityAI')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">ai</span>
                    generate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resetWorkflow('stabilityAI')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">rt</span>
                    reset
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${stabilityAIStats.apiStatus === 'connected' ? 'active' : 'error'}`}></span>
                    <span className="text-muted-foreground">api</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${workflowProgress.stabilityAI.isRunning ? 'warning' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">generation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${stabilityAIStats.computeUsage > 80 ? 'error' : stabilityAIStats.computeUsage > 60 ? 'warning' : 'active'}`}></span>
                    <span className="text-muted-foreground">compute</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStabilityAICollapsed(!stabilityAICollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{stabilityAICollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <WorkflowProgressBar
                title="stability ai"
                progress={workflowProgress.stabilityAI.progress}
                isRunning={workflowProgress.stabilityAI.isRunning}
                onStart={() => startWorkflow('stabilityAI')}
                onPause={() => pauseWorkflow('stabilityAI')}
                onReset={() => resetWorkflow('stabilityAI')}
                stages={workflowStages.stabilityAI}
                currentStage={workflowProgress.stabilityAI.currentStage}
              />
            </div>

            {isTimelineVisible('stabilityAI') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="ai generation"
                  currentFrame={timelineFrames.stabilityAI}
                  isLive={workflowProgress.stabilityAI.isRunning}
                  isProcessing={workflowProgress.stabilityAI.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('stabilityAI', frame)}
                  module="stability"
                />
              </div>
            )}
          </div>

          {!stabilityAICollapsed && (
            <div className="p-4">
              <StabilityAIPanel
                depthData={depthData}
                normalData={normalData}
                onImageGenerated={handleImageGenerated}
                onVideoGenerated={handleVideoGenerated}
              />
            </div>
          )}
        </div>

        {/* Autonomous Deployment Coordination */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">au</span>
                <h2 className="text-primary animate-underline">autonomous deployment coordination</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getTotalInstances()} instances
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {aiAgentStats.activeAgents} ai agents
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {getTotalCoverage().toFixed(1)}% coverage
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('autonomousDeployment')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.autonomousDeployment ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleGlobalAutonomousMode}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">ai</span>
                    auto mode
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSectorDeploy('DELTA-04')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">dp</span>
                    deploy
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${getTotalActiveSectors() > 0 ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">sectors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${aiAgentStats.activeAgents > 0 ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">ai agents</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutonomousDeploymentCollapsed(!autonomousDeploymentCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{autonomousDeploymentCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <WorkflowProgressBar
                title="autonomous"
                progress={workflowProgress.autonomousDeployment.progress}
                isRunning={workflowProgress.autonomousDeployment.isRunning}
                onStart={() => startWorkflow('autonomousDeployment')}
                onPause={() => pauseWorkflow('autonomousDeployment')}
                onReset={() => resetWorkflow('autonomousDeployment')}
                stages={workflowStages.autonomousDeployment}
                currentStage={workflowProgress.autonomousDeployment.currentStage}
              />
            </div>

            {isTimelineVisible('autonomousDeployment') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="deployment sequence"
                  currentFrame={timelineFrames.autonomousDeployment}
                  isLive={workflowProgress.autonomousDeployment.isRunning}
                  isProcessing={workflowProgress.autonomousDeployment.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('autonomousDeployment', frame)}
                  module="deployment"
                />
              </div>
            )}
          </div>

          {!autonomousDeploymentCollapsed && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {deploymentSectors.map((sector) => (
                  <Card key={sector.id} className="terminal-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`status-dot ${getSectorStatusColor(sector.status).replace('text-', '').replace('terminal-', '')}`}></span>
                          <CardTitle className="text-sm">{sector.name}</CardTitle>
                          <Badge variant="outline" className="text-xs font-mono terminal-code">
                            {sector.id}
                          </Badge>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs font-mono terminal-code ${getSectorStatusColor(sector.status)}`}
                        >
                          {sector.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">coverage:</span>
                          <span className="font-mono text-foreground terminal-code">{sector.coverage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ai agents:</span>
                          <span className="font-mono text-foreground terminal-code">{sector.aiAgents}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSectorDeploy(sector.id)}
                          disabled={sector.status === 'deploying'}
                          className="terminal-button h-7 px-2 text-xs flex-1"
                          variant="outline"
                        >
                          <span className="terminal-code mr-1">dp</span>
                          deploy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSectorCalibrate(sector.id)}
                          disabled={sector.status === 'calibrating'}
                          className="terminal-button h-7 px-2 text-xs flex-1"
                          variant="outline"
                        >
                          <span className="terminal-code mr-1">cl</span>
                          calibrate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Analysis Section */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">tm</span>
                <h2 className="text-primary animate-underline">timeline data analysis</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {timelineStats.extraction.completed}/{timelineStats.extraction.totalEvents} events
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {timelineStats.intelligence.totalInsights} insights
                </Badge>
                <Badge variant="outline" className={`font-mono text-xs terminal-code ${getThreatLevelColor(timelineStats.intelligence.threatLevel)}`}>
                  {timelineStats.intelligence.threatLevel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('timelineAnalysis')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.timelineAnalysis ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setAiSearchPopout(true)}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">ai</span>
                    ai search
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => startWorkflow('timelineAnalysis')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">an</span>
                    analyze
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${timelineStats.extraction.activeStreams > 0 ? 'active' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">streams</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIndicator(timelineStats.analysis.analysisStatus)}
                    <span className="text-muted-foreground">ai</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimelineAnalysisCollapsed(!timelineAnalysisCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{timelineAnalysisCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <WorkflowProgressBar
                title="timeline"
                progress={workflowProgress.timelineAnalysis.progress}
                isRunning={workflowProgress.timelineAnalysis.isRunning}
                onStart={() => startWorkflow('timelineAnalysis')}
                onPause={() => pauseWorkflow('timelineAnalysis')}
                onReset={() => resetWorkflow('timelineAnalysis')}
                stages={workflowStages.timelineAnalysis}
                currentStage={workflowProgress.timelineAnalysis.currentStage}
              />
            </div>

            {isTimelineVisible('timelineAnalysis') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="event analysis"
                  currentFrame={timelineFrames.timelineAnalysis}
                  isLive={workflowProgress.timelineAnalysis.isRunning}
                  isProcessing={workflowProgress.timelineAnalysis.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('timelineAnalysis', frame)}
                  module="intelligence"
                />
              </div>
            )}
          </div>

          {!timelineAnalysisCollapsed && (
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TimelineViewer
                  onEventSelect={handleTimelineEventSelect}
                  isAnalyzing={workflowProgress.timelineAnalysis.isRunning}
                />
                <AISearchPanel
                  onSearch={handleAISearchQuery}
                  threatLevel={timelineStats.intelligence.threatLevel}
                />
              </div>
            </div>
          )}
        </div>

        {/* Export Management Section */}
        <div className="terminal-card animate-terminal-fade">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="terminal-code">ex</span>
                <h2 className="text-primary animate-underline">export management systems</h2>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {exportStats.archive.completed}/{exportStats.archive.totalExports} exports
                </Badge>
                <Badge variant="outline" className="font-mono text-xs terminal-code">
                  {exportStats.storage.localStorage + exportStats.storage.cloudStorage}gb stored
                </Badge>
                <Badge variant="outline" className={`font-mono text-xs terminal-code ${getStorageStatusColor()}`}>
                  {getStorageUsagePercent().toFixed(1)}% usage
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timelinesVisible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleIndividualTimeline('exportManagement')}
                    className="terminal-button h-8 px-2 text-xs"
                  >
                    <span className="terminal-code mr-1">{individualTimelineVisibility.exportManagement ? 'on' : 'of'}</span>
                    timeline
                  </Button>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleQuickExport('depth')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">ex</span>
                    export
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDistribution('secure-01')}
                    className="terminal-button h-7 px-2 text-xs"
                    variant="outline"
                  >
                    <span className="terminal-code mr-1">ds</span>
                    distribute
                  </Button>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${exportStats.archive.processing > 0 ? 'warning' : 'inactive'}`}></span>
                    <span className="text-muted-foreground">archive</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`status-dot ${getStorageUsagePercent() > 85 ? 'error' : getStorageUsagePercent() > 70 ? 'warning' : 'active'}`}></span>
                    <span className="text-muted-foreground">storage</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIndicator(exportStats.distribution.distributionStatus)}
                    <span className="text-muted-foreground">dist</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExportManagementCollapsed(!exportManagementCollapsed)}
                  className="terminal-button h-8 w-8 p-0"
                >
                  <span className="terminal-code">{exportManagementCollapsed ? ICONS.dn : ICONS.up}</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <WorkflowProgressBar
                title="export"
                progress={workflowProgress.exportManagement.progress}
                isRunning={workflowProgress.exportManagement.isRunning}
                onStart={() => startWorkflow('exportManagement')}
                onPause={() => pauseWorkflow('exportManagement')}
                onReset={() => resetWorkflow('exportManagement')}
                stages={workflowStages.exportManagement}
                currentStage={workflowProgress.exportManagement.currentStage}
              />
            </div>

            {isTimelineVisible('exportManagement') && (
              <div className="mt-4">
                <ThumbnailTimeline
                  title="export pipeline"
                  currentFrame={timelineFrames.exportManagement}
                  isLive={workflowProgress.exportManagement.isRunning}
                  isProcessing={workflowProgress.exportManagement.isRunning}
                  onFrameSelect={(frame) => handleTimelineFrameSelect('exportManagement', frame)}
                  module="export"
                />
              </div>
            )}
          </div>

          {!exportManagementCollapsed && (
            <div className="p-4">
              <ExportPanel
                depthData={depthData}
                normalData={normalData}
                onQuickExport={handleQuickExport}
                onDistribute={handleDistribution}
                exportStats={exportStats}
              />
            </div>
          )}
        </div>

        {/* Terminal Status Footer */}
        <div className="terminal-card">
          <div className="flex items-center justify-between text-xs p-3">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground font-mono">render-neural v2.1.0</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground font-mono">terminal interface</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground font-mono">stability ai integration</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="status-dot active"></span>
                <span className="text-muted-foreground font-mono">systems nominal</span>
              </div>
              <span className="font-mono text-muted-foreground">
                uptime: {Math.floor(Date.now() / 1000 % 86400 / 3600)}h {Math.floor(Date.now() / 1000 % 3600 / 60)}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}