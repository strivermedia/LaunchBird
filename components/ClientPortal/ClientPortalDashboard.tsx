'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Calendar, Clock, FileText, Download, Send, CheckCircle, AlertCircle, Info, Building2, Mail, Phone, ExternalLink, MessageSquare, Upload, ChevronDown, ChevronUp, Plus, File, Image, FileVideo, FileAudio, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { logClientAccess } from '@/lib/client-portal'
import { getDynamicGradient, getGradientColors } from '@/lib/dashboard'
import type { Client, Project } from '@/types'

interface ClientPortalDashboardProps {
  client: Client
  projects: Project[]
  code: string
}

interface ChecklistItem {
  id: string
  projectId: string
  title: string
  description: string
  isCompleted: boolean
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  category: 'document' | 'information' | 'approval' | 'other'
}

interface ProjectFile {
  id: string
  name: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
  category: 'design' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
}

/**
 * Client Portal Dashboard Component
 * Displays all projects for a specific client
 */
export default function ClientPortalDashboard({ 
  client, 
  projects, 
  code 
}: ClientPortalDashboardProps) {
  const [accessLogged, setAccessLogged] = useState(false)
  const [gradient, setGradient] = useState(getDynamicGradient())
  const [gradientColors, setGradientColors] = useState(getGradientColors())
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      projectId: '1',
      title: 'Company Logo Files',
      description: 'Please provide high-resolution logo files in vector format (AI, EPS, SVG) and raster formats (PNG, JPG)',
      isCompleted: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'document'
    },
    {
      id: '2',
      projectId: '1',
      title: 'Brand Guidelines',
      description: 'Share your brand guidelines document including color palette, typography, and design principles',
      isCompleted: false,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'document'
    },
    {
      id: '3',
      projectId: '1',
      title: 'Content Approval',
      description: 'Review and approve the initial content draft for your website',
      isCompleted: true,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      category: 'approval'
    },
    {
      id: '4',
      projectId: '2',
      title: 'App Requirements',
      description: 'Detailed app requirements and specifications document',
      isCompleted: false,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'document'
    },
    {
      id: '5',
      projectId: '2',
      title: 'Design Assets',
      description: 'Provide app icons, splash screens, and UI design assets',
      isCompleted: false,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      category: 'document'
    },
    {
      id: '6',
      projectId: '2',
      title: 'API Documentation',
      description: 'Share API documentation and integration requirements',
      isCompleted: false,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      priority: 'high',
      category: 'information'
    }
  ])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [projectFiles, setProjectFiles] = useState<Record<string, ProjectFile[]>>({
    '1': [
      {
        id: 'file-1',
        name: 'company-logo.ai',
        size: 2048576,
        type: 'application/illustrator',
        uploadedBy: 'Client',
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        category: 'design'
      },
      {
        id: 'file-2',
        name: 'brand-guidelines.pdf',
        size: 1048576,
        type: 'application/pdf',
        uploadedBy: 'Client',
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        category: 'document'
      }
    ],
    '2': [
      {
        id: 'file-3',
        name: 'app-requirements.docx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedBy: 'Client',
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        category: 'document'
      }
    ]
  })
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({})

  /**
   * Log client access for tracking and update gradient
   */
  useEffect(() => {
    const logAccess = async () => {
      if (!accessLogged) {
        try {
          await logClientAccess(code, client.id, client.organizationId)
          setAccessLogged(true)
        } catch (error) {
          console.error('Error logging client access:', error)
        }
      }
    }

    logAccess()
    
    // Update gradient every minute
    const gradientInterval = setInterval(() => {
      setGradient(getDynamicGradient())
      setGradientColors(getGradientColors())
    }, 60000)

    return () => clearInterval(gradientInterval)
  }, [code, client.id, client.organizationId, accessLogged])

  /**
   * Format date for display
   */
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Not set'
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Get status color for badges
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'on-hold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  /**
   * Get type color for badges
   */
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'one-time':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'ongoing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  /**
   * Calculate client statistics
   */
  const getClientStats = () => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'in-progress').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const totalProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0

    return { totalProjects, activeProjects, completedProjects, totalProgress }
  }

  const stats = getClientStats()

  /**
   * Get checklist items for a specific project
   */
  const getProjectChecklistItems = (projectId: string) => {
    return checklistItems.filter(item => item.projectId === projectId)
  }

  /**
   * Get project stats for checklist items
   */
  const getProjectChecklistStats = (projectId: string) => {
    const projectItems = getProjectChecklistItems(projectId)
    const pending = projectItems.filter(item => !item.isCompleted).length
    const completed = projectItems.filter(item => item.isCompleted).length
    return { pending, completed, total: projectItems.length }
  }

  /**
   * Toggle project expansion
   */
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  /**
   * Handle file upload for project files
   */
  const handleProjectFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(prev => ({ ...prev, [projectId]: true }))
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newFiles: ProjectFile[] = Array.from(files).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: 'Client',
      uploadedAt: new Date(),
      category: 'other' as const
    }))
    
    setProjectFiles(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), ...newFiles]
    }))
    
    setIsUploading(prev => ({ ...prev, [projectId]: false }))
    event.target.value = ''
  }

  /**
   * Handle file deletion
   */
  const handleFileDelete = (projectId: string, fileId: string) => {
    setProjectFiles(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).filter(file => file.id !== fileId)
    }))
  }

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Get file icon based on category
   */
  const getFileIcon = (category: string) => {
    switch (category) {
      case 'design': return <File className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <FileVideo className="h-4 w-4" />
      case 'audio': return <FileAudio className="h-4 w-4" />
      case 'archive': return <Archive className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  /**
   * Get priority color for checklist items
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20">
      {/* Simple Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 dark:border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-2xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-white">
                  LaunchBird
                </h1>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Client Portal
                </p>
              </div>
            </div>
            
            {/* Manager Contact Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {client.assignedManagerName?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground dark:text-white truncate">
                    {client.assignedManagerName || 'Project Manager'}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">
                    {client.assignedManagerTitle || 'Your Project Manager'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(`mailto:${client.assignedManagerEmail || 'manager@launchbird.com'}`, '_blank')}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => window.open(`sms:${client.assignedManagerPhone || '+1234567890'}`, '_blank')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Client Information */}
        <Card className="relative border border-border/80 shadow-sm mb-8 overflow-hidden card-glow">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-64">
            <div className="mx-auto h-full w-full rounded-b-3xl bg-gradient-to-t from-primary/5 via-primary/2 to-transparent blur-3xl dark:from-primary/4 dark:via-primary/2" />
          </div>
          <CardHeader className="relative z-10 pb-4">
                          <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {client.company || 'Company'}
                  </CardTitle>
                </div>
              </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Project Statistics */}
              <div className="bg-white/30 dark:bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-border/40">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Total Projects
                    </p>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                      {stats.totalProjects}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Active
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-300 mt-1">
                        {stats.activeProjects}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Completed
                      </p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-300 mt-1">
                        {stats.completedProjects}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-white/30 dark:bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-border/40">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${stats.totalProgress}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {Math.round(stats.totalProgress)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Overall Progress
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
              Your Projects
            </h2>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {projects.length === 0 ? (
            <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-muted/50 dark:bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                  No Projects Yet
                </h3>
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Your projects will appear here once they are created and assigned to you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Project
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Description
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Due Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Progress
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Items
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project, index) => {
                    const projectStats = getProjectChecklistStats(project.id)
                    return (
                      <React.Fragment key={project.id}>
                        <TableRow 
                          className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${
                            index !== projects.length - 1 ? 'border-b border-border/50' : ''
                          }`}
                        >
                          <TableCell className="py-4">
                            <div className="font-semibold text-foreground dark:text-white">
                              {project.title}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <Badge className={`${getStatusColor(project.status)} text-xs`}>
                              {project.status.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="text-sm text-muted-foreground dark:text-muted-foreground max-w-xs truncate">
                              {project.description || 'No description'}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(project.endDate || project.startDate)}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{project.progress}%</span>
                              <Progress 
                                value={project.progress} 
                                className="w-40 h-2"
                              />
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              <span>{projectStats.completed}/{projectStats.total}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleProjectExpansion(project.id)}
                              className="flex items-center gap-2"
                            >
                              {expandedProjects.has(project.id) ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  View Details
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                        
                        {/* Expanded Content */}
                        {expandedProjects.has(project.id) && (
                          <TableRow>
                            <TableCell colSpan={7} className="p-0">
                              <div className="bg-gradient-to-r from-muted/20 to-muted/10 dark:from-muted/30 dark:to-muted/20 border-t border-border/50">
                                <div className="p-8 space-y-8">
                                  {/* Items Needed Section */}
                                  <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                          <CheckCircle className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                          <h3 className="text-xl font-semibold text-foreground dark:text-white">
                                            Items Needed
                                          </h3>
                                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                            Complete these items to help us deliver your project
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-foreground dark:text-white">
                                            {projectStats.completed}/{projectStats.total}
                                          </div>
                                          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                                            items completed
                                          </div>
                                        </div>
                                        <div className="w-16 h-16 relative">
                                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeDasharray={`${(projectStats.total > 0 ? projectStats.completed / projectStats.total : 0) * 100}, 100`}
                                              className="text-primary"
                                            />
                                            <path
                                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeDasharray="100, 100"
                                              className="text-muted/30"
                                            />
                                          </svg>
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-foreground dark:text-white">
                                              {projectStats.total > 0 ? Math.round((projectStats.completed / projectStats.total) * 100) : 0}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="grid gap-4">
                                      {getProjectChecklistItems(project.id).map((item) => (
                                        <div
                                          key={item.id}
                                          className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                                            item.isCompleted 
                                              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                                              : 'bg-background dark:bg-background border-border/50 hover:border-primary/30'
                                          }`}
                                        >
                                          <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                                item.isCompleted 
                                                  ? 'bg-green-500 border-green-500' 
                                                  : 'border-muted-foreground/30 group-hover:border-primary'
                                              }`}>
                                                {item.isCompleted && (
                                                  <CheckCircle className="w-4 h-4 text-white" />
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-3 mb-3">
                                                <h4 className={`font-semibold text-lg ${
                                                  item.isCompleted 
                                                    ? 'text-green-700 dark:text-green-300 line-through' 
                                                    : 'text-foreground dark:text-white'
                                                }`}>
                                                  {item.title}
                                                </h4>
                                                <Badge className={`${getPriorityColor(item.priority)} text-xs font-medium`}>
                                                  {item.priority}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                  {item.category}
                                                </Badge>
                                                {item.isCompleted && (
                                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                                    Completed
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className={`text-sm mb-3 ${
                                                item.isCompleted 
                                                  ? 'text-green-600 dark:text-green-400' 
                                                  : 'text-muted-foreground dark:text-muted-foreground'
                                              }`}>
                                                {item.description}
                                              </p>
                                              {item.dueDate && (
                                                <div className="flex items-center gap-2 text-xs">
                                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                                  <span className={`font-medium ${
                                                    item.isCompleted 
                                                      ? 'text-green-600 dark:text-green-400' 
                                                      : 'text-muted-foreground'
                                                  }`}>
                                                    Due: {formatDate(item.dueDate)}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator className="my-8" />

                                  {/* File Upload Section */}
                                  <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                          <Upload className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                          <h3 className="text-xl font-semibold text-foreground dark:text-white">
                                            File Upload
                                          </h3>
                                          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                                            Share files and documents for this project
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-foreground dark:text-white">
                                            {(projectFiles[project.id] || []).length}
                                          </div>
                                          <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                                            files uploaded
                                          </div>
                                        </div>
                                        <input
                                          type="file"
                                          multiple
                                          onChange={(e) => handleProjectFileUpload(e, project.id)}
                                          className="hidden"
                                          id={`file-upload-${project.id}`}
                                          accept="*/*"
                                        />
                                        <label
                                          htmlFor={`file-upload-${project.id}`}
                                          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-6 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                          {isUploading[project.id] ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                              Uploading...
                                            </>
                                          ) : (
                                            <>
                                              <Upload className="h-4 w-4 mr-2" />
                                              Upload Files
                                            </>
                                          )}
                                        </label>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      {(projectFiles[project.id] || []).length === 0 ? (
                                        <div className="relative group">
                                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                          <div className="relative text-center py-12 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors duration-200">
                                            <div className="w-16 h-16 bg-muted/50 dark:bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors duration-200">
                                              <Upload className="h-8 w-8 text-muted-foreground dark:text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-foreground dark:text-white mb-2">
                                              No files uploaded yet
                                            </h4>
                                            <p className="text-muted-foreground dark:text-muted-foreground mb-4 max-w-md mx-auto">
                                              Upload design files, documents, and other project assets to help us deliver your project faster.
                                            </p>
                                            <label
                                              htmlFor={`file-upload-${project.id}`}
                                              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-4 cursor-pointer"
                                            >
                                              <Upload className="h-4 w-4 mr-2" />
                                              Upload Your First File
                                            </label>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="grid gap-4">
                                          {(projectFiles[project.id] || []).map((file) => (
                                            <div
                                              key={file.id}
                                              className="group relative p-4 bg-background dark:bg-background rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200"
                                            >
                                              <div className="flex items-center gap-4">
                                                <div className="p-3 bg-muted/50 dark:bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors duration-200">
                                                  {getFileIcon(file.category)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <h4 className="font-semibold text-foreground dark:text-white truncate group-hover:text-primary transition-colors duration-200">
                                                    {file.name}
                                                  </h4>
                                                  <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                                                    <span className="font-medium">{formatFileSize(file.size)}</span>
                                                    <span>•</span>
                                                    <span>Uploaded by {file.uploadedBy}</span>
                                                    <span>•</span>
                                                    <span>{formatDate(file.uploadedAt)}</span>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                                  >
                                                    <Download className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleFileDelete(project.id, file.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 dark:border-border/50 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              © 2024 LaunchBird. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70 mt-1">
              Access Code: {code} • Last updated: {formatDate(client.updatedAt)}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

