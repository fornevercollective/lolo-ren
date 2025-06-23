import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Github, GitBranch, Upload, Settings, CheckCircle, AlertCircle, Loader, FolderOpen } from 'lucide-react';

interface Repository {
  name: string;
  owner: string;
  branch: string;
  url: string;
  lastSync?: string;
}

interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

interface GitHubSyncProps {
  depthData: Float32Array | null;
  normalData: Float32Array | null;
  onSync: (repo: Repository, data: any) => void;
}

export function GitHubSync({ depthData, normalData, onSync }: GitHubSyncProps) {
  const [repositories] = useState<Repository[]>([
    {
      name: 'nerf-experiments',
      owner: 'your-username',
      branch: 'main',
      url: 'https://github.com/your-username/nerf-experiments',
      lastSync: '2024-01-15T10:30:00Z'
    },
    {
      name: 'depth-processing-results',
      owner: 'your-username', 
      branch: 'main',
      url: 'https://github.com/your-username/depth-processing-results'
    }
  ]);

  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [customRepo, setCustomRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('Add depth estimation results');
  const [syncPath, setSyncPath] = useState('results/');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    message: 'Ready to sync'
  });
  const [apiKey, setApiKey] = useState('');

  const handleSync = async () => {
    if (!selectedRepo && !customRepo) {
      setSyncStatus({
        status: 'error',
        message: 'Please select or enter a repository'
      });
      return;
    }

    setSyncStatus({
      status: 'syncing',
      message: 'Preparing data for sync...'
    });

    try {
      // Simulate sync process
      const steps = [
        'Preparing data for sync...',
        'Compressing depth maps...',
        'Generating metadata...',
        'Connecting to GitHub...',
        'Uploading files...',
        'Creating commit...',
        'Pushing to repository...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setSyncStatus({
          status: 'syncing',
          message: steps[i]
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const targetRepo = selectedRepo || {
        name: customRepo.split('/').pop() || 'unknown',
        owner: customRepo.split('/')[3] || 'unknown',
        branch,
        url: customRepo
      };

      setSyncStatus({
        status: 'success',
        message: `Successfully synced to ${targetRepo.name}/${branch}`,
        timestamp: new Date().toISOString()
      });

      // Prepare sync data
      const syncData = {
        depthData: depthData ? Array.from(depthData.slice(0, 100)) : null, // Sample for demo
        normalData: normalData ? Array.from(normalData.slice(0, 100)) : null,
        metadata: {
          timestamp: new Date().toISOString(),
          processing: 'nerf-extruder',
          path: syncPath,
          commit: commitMessage
        }
      };

      onSync(targetRepo, syncData);

    } catch (error) {
      setSyncStatus({
        status: 'error',
        message: 'Failed to sync to repository. Check your credentials.',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleRepoSelect = (repoName: string) => {
    const repo = repositories.find(r => r.name === repoName);
    setSelectedRepo(repo || null);
    if (repo) {
      setBranch(repo.branch);
      setCustomRepo('');
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing': return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Github className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canSync = depthData || normalData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Repository Selection */}
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository</label>
            <Select value={selectedRepo?.name || ''} onValueChange={handleRepoSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={repo.name} value={repo.name}>
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      <span>{repo.owner}/{repo.name}</span>
                      {repo.lastSync && (
                        <Badge variant="outline" className="text-xs">
                          Last: {formatDate(repo.lastSync)}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-center text-muted-foreground text-sm">or</div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Repository</label>
            <Input
              placeholder="https://github.com/username/repository"
              value={customRepo}
              onChange={(e) => {
                setCustomRepo(e.target.value);
                if (e.target.value) setSelectedRepo(null);
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Sync Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Branch</label>
            <div className="flex gap-2">
              <GitBranch className="w-4 h-4 mt-2 text-muted-foreground" />
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sync Path</label>
            <div className="flex gap-2">
              <FolderOpen className="w-4 h-4 mt-2 text-muted-foreground" />
              <Input
                value={syncPath}
                onChange={(e) => setSyncPath(e.target.value)}
                placeholder="results/"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Commit Message</label>
          <Textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes..."
            rows={2}
          />
        </div>

        {/* API Configuration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub Token (Optional)</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          />
          <p className="text-xs text-muted-foreground">
            For private repositories or higher rate limits
          </p>
        </div>

        <Separator />

        {/* Data Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Data to Sync</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 border rounded">
              <Badge variant={depthData ? "default" : "secondary"}>
                {depthData ? "✓" : "○"}
              </Badge>
              <span className="text-sm">Depth Data</span>
              {depthData && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {depthData.length.toLocaleString()} points
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <Badge variant={normalData ? "default" : "secondary"}>
                {normalData ? "✓" : "○"}
              </Badge>
              <span className="text-sm">Normal Data</span>
              {normalData && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {normalData.length.toLocaleString()} vectors
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{syncStatus.message}</p>
            {syncStatus.timestamp && (
              <p className="text-xs text-muted-foreground">
                {formatDate(syncStatus.timestamp)}
              </p>
            )}
          </div>
        </div>

        {/* Sync Button */}
        <Button 
          onClick={handleSync}
          disabled={!canSync || syncStatus.status === 'syncing' || (!selectedRepo && !customRepo)}
          className="w-full"
        >
          {syncStatus.status === 'syncing' ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Push to Repository
            </>
          )}
        </Button>

        {!canSync && (
          <p className="text-xs text-muted-foreground text-center">
            No data available to sync. Process some depth data first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}