"use client"

import * as React from "react"
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  className?: string
}

interface FileWithStatus extends File {
  id: string
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function FileUpload({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'],
  maxFileSize = 10,
  maxFiles = 5,
  className
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [files, setFiles] = React.useState<FileWithStatus[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles)
    const validFiles: FileWithStatus[] = []

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        const fileWithError: FileWithStatus = {
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'error',
          error: `File size exceeds ${maxFileSize}MB limit`
        }
        validFiles.push(fileWithError)
        return
      }

      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!acceptedFileTypes.includes(fileExtension)) {
        const fileWithError: FileWithStatus = {
          ...file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'error',
          error: 'File type not supported'
        }
        validFiles.push(fileWithError)
        return
      }

      const fileWithStatus: FileWithStatus = {
        ...file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'uploading'
      }
      validFiles.push(fileWithStatus)
    })

    // Limit number of files
    const limitedFiles = validFiles.slice(0, maxFiles)
    setFiles(limitedFiles)
    onFilesSelected(limitedFiles)

    // Simulate upload process
    limitedFiles.forEach((file) => {
      if (file.status === 'uploading') {
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'success' as const } : f
          ))
        }, 1000 + Math.random() * 2000)
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: {acceptedFileTypes.join(', ')} • Max size: {maxFileSize}MB • Max files: {maxFiles}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

