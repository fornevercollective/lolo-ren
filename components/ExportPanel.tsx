import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Download, Upload, FileText, Database, MessageSquare, Terminal, Wifi, Monitor, Smartphone, Server, Radio, ChevronDown, ChevronUp, Play, Pause, Settings, Eye, EyeOff } from 'lucide-react';

interface ExportPanelProps {
  depthData: Float32Array | null;
  normalData: Float32Array | null;
  isProcessing: boolean;
}

export function ExportPanel({ depthData, normalData, isProcessing }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState('json');
  const [syncTarget, setSyncTarget] = useState('terminal');
  const [syncConfig, setSyncConfig] = useState({
    host: '192.168.1.100',
    port: '8080',
    device: 'TACTICAL-UNIT-01',
    protocol: 'secure-tcp'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastExport, setLastExport] = useState<Date | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [exportCollapsed, setExportCollapsed] = useState(false);
  const [syncCollapsed, setSyncCollapsed] = useState(false);
  const [showSyncPassword, setShowSyncPassword] = useState(false);

  // Compilation state
  const [compiledData, setCompiledData] = useState<Array<{
    name: string;
    type: string;
    size: string;
    source: string;
    timestamp: Date;
  }>>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompile, setLastCompile] = useState<Date | null>(null);

  const exportFormats = [
    { value: 'json', label: 'JSON', icon: Database, description: 'Structured data format' },
    { value: 'txt', label: 'TXT', icon: FileText, description: 'Plain text format' },
    { value: 'markdown', label: 'MARKDOWN', icon: FileText, description: 'Documentation format' },
    { value: 'csv', label: 'CSV', icon: Database, description: 'Spreadsheet format' },
    { value: 'teleprompter', label: 'TELEPROMPTER', icon: MessageSquare, description: 'AI agent format' }
  ];

  const syncTargets = [
    { value: 'terminal', label: 'TERMINAL', icon: Terminal, description: 'Command line interface' },
    { value: 'network', label: 'NETWORK', icon: Wifi, description: 'Network device' },
    { value: 'device', label: 'DEVICE', icon: Smartphone, description: 'Connected device' },
    { value: 'server', label: 'SERVER', icon: Server, description: 'Remote server' }
  ];

  const protocols = [
    { value: 'secure-tcp', label: 'SECURE TCP' },
    { value: 'ssh', label: 'SSH' },
    { value: 'sftp', label: 'SFTP' },
    { value: 'websocket', label: 'WEBSOCKET' },
    { value: 'mqtt', label: 'MQTT' },
    { value: 'http', label: 'HTTP/REST' }
  ];

  const handleExport = async (format: string) => {
    if (!depthData || !normalData) return;
    
    setIsExporting(true);
    
    try {
      let exportData: any;
      
      // Use compiled data if available, otherwise use raw data
      const useCompiledData = compiledData.length > 0;
      
      switch (format) {
        case 'json':
          exportData = {
            timestamp: new Date().toISOString(),
            sensor: 'LIDAR-01',
            classification: 'SECRET',
            compilation_info: useCompiledData ? {
              compiled: true,
              items: compiledData.length,
              compile_timestamp: lastCompile?.toISOString(),
              total_size_mb: (compiledData.reduce((total, item) => total + parseFloat(item.size.replace(/[^\d.]/g, '')), 0)).toFixed(1)
            } : { compiled: false },
            depth: Array.from(depthData),
            normals: Array.from(normalData),
            compiled_sections: useCompiledData ? compiledData.map(item => ({
              name: item.name,
              type: item.type,
              source: item.source,
              size: item.size,
              timestamp: item.timestamp.toISOString()
            })) : [],
            metadata: {
              width: 640,
              height: 480,
              format: 'float32',
              encoding: 'raw'
            }
          };
          break;
          
        case 'txt':
          exportData = `LATTICE SDK EXPORT
TIMESTAMP: ${new Date().toISOString()}
SENSOR: LIDAR-01
CLASSIFICATION: SECRET
WIDTH: 640
HEIGHT: 480

DEPTH DATA:
${Array.from(depthData).join(' ')}

NORMAL DATA:
${Array.from(normalData).join(' ')}`;
          break;
          
        case 'markdown':
          exportData = `# LATTICE SDK TACTICAL EXPORT

**Classification:** SECRET  
**Timestamp:** ${new Date().toISOString()}  
**Sensor System:** LIDAR-01  
**Resolution:** 640x480  

## Depth Analysis
- **Total Points:** ${depthData.length}
- **Format:** Float32 Array
- **Encoding:** Raw Binary

## Surface Normals
- **Total Vectors:** ${normalData.length / 3}
- **Format:** Float32 Array (XYZ)
- **Coordinate System:** Right-handed

## Mission Parameters
- **Processing Status:** ${isProcessing ? 'ACTIVE' : 'STANDBY'}
- **Data Quality:** OPERATIONAL
- **Security Level:** ENCRYPTED`;
          break;
          
        case 'csv':
          const csvHeaders = 'Index,Depth,Normal_X,Normal_Y,Normal_Z\n';
          const csvData = Array.from(depthData).map((depth, i) => {
            const nx = normalData[i * 3] || 0;
            const ny = normalData[i * 3 + 1] || 0;
            const nz = normalData[i * 3 + 2] || 0;
            return `${i},${depth},${nx},${ny},${nz}`;
          }).join('\n');
          exportData = csvHeaders + csvData;
          break;
          
        case 'teleprompter':
          exportData = {
            agent_config: {
              mission_id: `MISSION_${Date.now()}`,
              classification: 'SECRET',
              ai_model: 'lattice-neural-v2.1',
              timestamp: new Date().toISOString(),
              compilation_mode: useCompiledData
            },
            sensor_data: {
              depth_field: Array.from(depthData),
              normal_vectors: Array.from(normalData),
              confidence_scores: Array.from(depthData).map(() => Math.random() * 0.3 + 0.7)
            },
            compiled_intelligence: useCompiledData ? {
              staging_complete: true,
              sections_compiled: compiledData.length,
              compiled_assets: compiledData.map(item => ({
                asset_name: item.name,
                asset_type: item.type,
                source_system: item.source,
                data_size: item.size
              }))
            } : { staging_complete: false },
            tactical_context: {
              threat_level: 'NOMINAL',
              environment: 'URBAN',
              visibility: 'CLEAR',
              mission_phase: 'RECONNAISSANCE'
            },
            ai_prompts: [
              "Analyze depth field for potential obstacles and navigation paths",
              "Identify surface characteristics from normal vector data", 
              "Generate tactical recommendations based on spatial intelligence",
              "Assess threat probability from environmental geometry",
              ...(useCompiledData ? [
                "Process compiled intelligence from previous mission sections",
                "Correlate multi-source data for enhanced situational awareness",
                "Generate comprehensive mission intelligence summary"
              ] : [])
            ]
          };
          break;
      }

      // Create and download file
      const blob = new Blob([typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2)], {
        type: format === 'json' || format === 'teleprompter' ? 'application/json' : 'text/plain'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lattice_export_${Date.now()}.${format === 'teleprompter' ? 'json' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastExport(new Date());
      console.log(`Export completed: ${format.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleSync = async () => {
    if (!depthData || !normalData) return;
    
    setIsSyncing(true);
    
    try {
      const syncData = {
        target: syncTarget,
        config: syncConfig,
        data: {
          depth: Array.from(depthData),
          normals: Array.from(normalData),
          timestamp: new Date().toISOString()
        }
      };
      
      console.log(`Syncing to ${syncTarget.toUpperCase()}:`, syncConfig);
      console.log('Sync payload size:', JSON.stringify(syncData).length, 'bytes');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastSync(new Date());
      console.log('Sync completed successfully');
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCompileFromSections = async () => {
    setIsCompiling(true);
    
    try {
      // Simulate compilation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCompiledData = [];
      
      // Add depth data if available
      if (depthData) {
        newCompiledData.push({
          name: 'DEPTH_DATA_FIELD',
          type: 'SENSOR/DEPTH',
          size: `${(depthData.length * 4 / 1024 / 1024).toFixed(1)}MB`,
          source: 'SENSOR_FEED',
          timestamp: new Date()
        });
      }
      
      // Add normal data if available
      if (normalData) {
        newCompiledData.push({
          name: 'SURFACE_NORMALS',
          type: 'SENSOR/NORMALS',
          size: `${(normalData.length * 4 / 1024 / 1024).toFixed(1)}MB`,
          source: 'DEPTH_PROCESSING',
          timestamp: new Date()
        });
      }
      
      // Add processing parameters
      newCompiledData.push({
        name: 'PROCESSING_PARAMS',
        type: 'CONFIG/PARAMS',
        size: '0.1KB',
        source: 'SENSOR_CONTROLS',
        timestamp: new Date()
      });
      
      // Add sensor configuration
      newCompiledData.push({
        name: 'SENSOR_CONFIG',
        type: 'CONFIG/SENSOR',
        size: '0.5KB',
        source: 'SENSOR_CONTROLS',
        timestamp: new Date()
      });
      
      // Add mission metadata
      newCompiledData.push({
        name: 'MISSION_METADATA',
        type: 'META/MISSION',
        size: '1.2KB',
        source: 'TIMELINE_ANALYSIS',
        timestamp: new Date()
      });
      
      // Add AI analysis results
      newCompiledData.push({
        name: 'AI_ANALYSIS_RESULTS',
        type: 'INTEL/AI',
        size: '2.8KB',
        source: 'TIMELINE_ANALYSIS',
        timestamp: new Date()
      });
      
      setCompiledData(newCompiledData);
      setLastCompile(new Date());
      
      console.log('Compilation completed:', newCompiledData.length, 'items staged');
      
    } catch (error) {
      console.error('Compilation failed:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleRemoveCompiledItem = (index: number) => {
    setCompiledData(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearCompilation = () => {
    setCompiledData([]);
    console.log('Compilation staging cleared');
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'NEVER';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}S AGO`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}M AGO`;
    const hours = Math.floor(minutes / 60);
    return `${hours}H AGO`;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-lattice-surface">
          <TabsTrigger value="export" className="font-mono text-xs">EXPORT OPTIONS</TabsTrigger>
          <TabsTrigger value="sync" className="font-mono text-xs">SYNC TARGETS</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          {/* Export Formats Section */}
          <Card className="lattice-container">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary text-sm">
                  <Download className="w-4 h-4" />
                  EXPORT FORMATS
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {exportFormats.find(f => f.value === exportFormat)?.label || 'JSON'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExportCollapsed(!exportCollapsed)}
                    className="h-8 w-8 p-0"
                  >
                    {exportCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {exportCollapsed && (
                <div className="mt-3 bg-lattice-surface p-2 rounded border border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">LAST EXPORT:</span>
                    <span className="font-mono text-foreground">{formatTimeAgo(lastExport)}</span>
                  </div>
                </div>
              )}
            </CardHeader>
            
            {!exportCollapsed && (
              <CardContent className="space-y-4">
                {/* Compilation Staging Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">COMPILATION STAGING</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {compiledData.length} ITEMS
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={handleCompileFromSections}
                        disabled={isCompiling}
                        className="font-mono h-7 px-3 text-xs"
                        variant="outline"
                      >
                        {isCompiling ? (
                          <>
                            <Settings className="w-3 h-3 mr-1 animate-spin" />
                            COMPILING
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            COMPILE FROM SECTIONS
                          </>
                        )}
                      </Button>
                      
                      {compiledData.length > 0 && (
                        <Button
                          size="sm"
                          onClick={handleClearCompilation}
                          variant="ghost"
                          className="font-mono h-7 px-2 text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          CLEAR
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Compilation Status Display */}
                  <div className="bg-lattice-surface p-3 rounded border border-border">
                    {compiledData.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-lattice-secondary/20 flex items-center justify-center">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            NO DATA COMPILED - CLICK "COMPILE FROM SECTIONS" TO STAGE DATA
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {compiledData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-card rounded border border-border">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-2 h-2 rounded-full bg-tactical-green"></div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.type}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Badge variant="secondary" className="text-xs font-mono px-1">
                                  {item.size}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveCompiledItem(index)}
                                  className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <EyeOff className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            <span>TOTAL COMPILED: </span>
                            <span className="font-mono text-foreground">{compiledData.length} ITEMS</span>
                            <span className="ml-3">SIZE: </span>
                            <span className="font-mono text-foreground">
                              {(compiledData.reduce((total, item) => total + parseFloat(item.size.replace(/[^\d.]/g, '')), 0)).toFixed(1)} MB
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>LAST COMPILE: </span>
                            <span className="font-mono text-foreground">{formatTimeAgo(lastCompile)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <div
                        key={format.value}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          exportFormat === format.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setExportFormat(format.value)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="font-mono text-xs font-medium">{format.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{format.description}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <div>LAST EXPORT: {formatTimeAgo(lastExport)}</div>
                    <div>DATA POINTS: {depthData ? depthData.length.toLocaleString() : 0}</div>
                    {compiledData.length > 0 && (
                      <div>COMPILED ITEMS: {compiledData.length}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleExport(exportFormat)}
                      disabled={!depthData || !normalData || isExporting}
                      className="font-mono"
                    >
                      {isExporting ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          EXPORTING
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-1" />
                          EXPORT {exportFormats.find(f => f.value === exportFormat)?.label}
                          {compiledData.length > 0 && ' + COMPILED'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          {/* Sync Configuration Section */}
          <Card className="lattice-container">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-primary text-sm">
                  <Upload className="w-4 h-4" />
                  SYNC CONFIGURATION
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {syncTargets.find(t => t.value === syncTarget)?.label || 'TERMINAL'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSyncCollapsed(!syncCollapsed)}
                    className="h-8 w-8 p-0"
                  >
                    {syncCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {syncCollapsed && (
                <div className="mt-3 bg-lattice-surface p-2 rounded border border-border">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TARGET:</span>
                      <span className="font-mono text-foreground">{syncConfig.host}:{syncConfig.port}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LAST SYNC:</span>
                      <span className="font-mono text-foreground">{formatTimeAgo(lastSync)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>
            
            {!syncCollapsed && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {syncTargets.map((target) => {
                    const Icon = target.icon;
                    return (
                      <div
                        key={target.value}
                        className={`p-3 rounded border cursor-pointer transition-colors ${
                          syncTarget === target.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSyncTarget(target.value)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4" />
                          <span className="font-mono text-xs font-medium">{target.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{target.description}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        HOST/IP ADDRESS
                      </label>
                      <Input
                        value={syncConfig.host}
                        onChange={(e) => setSyncConfig(prev => ({ ...prev, host: e.target.value }))}
                        placeholder="192.168.1.100"
                        className="font-mono text-xs"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        PORT
                      </label>
                      <Input
                        value={syncConfig.port}
                        onChange={(e) => setSyncConfig(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="8080"
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        DEVICE ID
                      </label>
                      <Input
                        value={syncConfig.device}
                        onChange={(e) => setSyncConfig(prev => ({ ...prev, device: e.target.value }))}
                        placeholder="TACTICAL-UNIT-01"
                        className="font-mono text-xs"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        PROTOCOL
                      </label>
                      <Select
                        value={syncConfig.protocol}
                        onValueChange={(value) => setSyncConfig(prev => ({ ...prev, protocol: value }))}
                      >
                        <SelectTrigger className="font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {protocols.map((protocol) => (
                            <SelectItem key={protocol.value} value={protocol.value} className="font-mono text-xs">
                              {protocol.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <div>LAST SYNC: {formatTimeAgo(lastSync)}</div>
                    <div>TARGET: {syncConfig.host}:{syncConfig.port}</div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      TEST
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSync}
                      disabled={!depthData || !normalData || isSyncing}
                      className="font-mono"
                    >
                      {isSyncing ? (
                        <>
                          <Radio className="w-3 h-3 mr-1 animate-pulse" />
                          SYNCING
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3 mr-1" />
                          SYNC DATA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}