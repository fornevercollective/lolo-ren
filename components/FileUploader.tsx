import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, File, Image, Video, Database, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadItem {
  id: string;
  file: File;
  name: string;
  type: 'image' | 'video' | 'nerf' | 'unknown';
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

interface FileUploaderProps {
  onFileUpload: (files: FileUploadItem[]) => void;
  onFileProcess: (file: FileUploadItem) => void;
  acceptedTypes?: string[];
}

export function FileUploader({ 
  onFileUpload, 
  onFileProcess,
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.mp4', '.mov', '.avi', '.ply', '.obj', '.json']
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const determineFileType = (file: File): 'image' | 'video' | 'nerf' | 'unknown' => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    const nerfTypes = ['.ply', '.obj', '.json', '.nerf'];
    
    if (imageTypes.includes(file.type)) return 'image';
    if (videoTypes.includes(file.type)) return 'video';
    if (nerfTypes.some(ext => file.name.toLowerCase().endsWith(ext))) return 'nerf';
    return 'unknown';
  };

  const createPreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const processFiles = useCallback(async (files: FileList) => {
    const newFiles: FileUploadItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const preview = await createPreview(file);
      
      const uploadItem: FileUploadItem = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        type: determineFileType(file),
        size: file.size,
        progress: 0,
        status: 'uploading',
        preview
      };
      
      newFiles.push(uploadItem);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(true);
    
    // Simulate upload progress
    for (const fileItem of newFiles) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileItem.id 
              ? { ...f, progress }
              : f
          )
        );
      }
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed' }
            : f
        )
      );
      
      onFileProcess(fileItem);
    }
    
    setIsProcessing(false);
    onFileUpload(newFiles);
  }, [onFileUpload, onFileProcess]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'nerf': return <Database className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          File Upload & Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Drop files here or click to upload</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, videos, and NeRF data files
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Supported File Types */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Image className="w-3 h-3 mr-1" />
            Images
          </Badge>
          <Badge variant="outline">
            <Video className="w-3 h-3 mr-1" />
            Videos
          </Badge>
          <Badge variant="outline">
            <Database className="w-3 h-3 mr-1" />
            NeRF Data
          </Badge>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {file.preview ? (
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {file.type}
                      </Badge>
                      {getStatusIcon(file.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-2 mt-2" />
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}