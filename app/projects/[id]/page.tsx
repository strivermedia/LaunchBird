/**
 * Project Details Page
 * Comprehensive view of individual project with all details, tasks, and activity
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Share,
  Download,
  MoreHorizontal,
  Plus,
  MessageSquare,
  FileText,
  BarChart3,
  Target,
  TrendingUp,
  User,
  Building,
  Tag,
  CalendarDays,
  Upload,
  File,
  Folder,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  Trash2,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project, Task, Activity, Client } from '@/types'
import { useAuth } from '@/lib/useAuth'

// File upload component
interface ProjectFile {
  id: string
  name: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
  url: string
  category: 'design' | 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
}

// Mock data functions
const createMockProject = (projectId: string): Project => ({
  id: projectId,
  organizationId: 'org-1',
  title: 'E-commerce Website Redesign',
  description: 'Complete redesign of client e-commerce platform with modern UI/UX, improved user experience, and enhanced functionality.',
  type: 'one-time',
  status: 'in-progress',
  progress: 65,
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-03-15'),
  deadline: new Date('2024-03-15'),
  assignedTo: ['user-1', 'user-2', 'user-3'],
  createdBy: 'user-1',
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-25'),
  clientId: 'client-1',
  budget: 15000,
  budgetSpent: 9750,
  tags: ['web-design', 'e-commerce', 'ui-ux', 'responsive'],
  clientCode: 'AB12',
  assignedManagerId: 'user-1',
  assignedManagerName: 'John Doe',
  assignedManagerTitle: 'Senior Developer',
  assignedManagerEmail: 'john@launchbird.com',
  assignedManagerPhone: '+1-555-0123'
})

const createMockTasks = (projectId: string): Task[] => [
  {
    id: 'task-1',
    organizationId: 'org-1',
    title: 'Design System Setup',
    description: 'Create comprehensive design system with components and guidelines',
    projectId: projectId,
    assignedTo: 'user-1',
    priority: 'high',
    status: 'completed',
    dueDate: new Date('2024-01-20'),
    completedAt: new Date('2024-01-18'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    estimatedHours: 16,
    actualHours: 14
  },
  {
    id: 'task-2',
    organizationId: 'org-1',
    title: 'Homepage Wireframes',
    description: 'Create wireframes for homepage and main landing pages',
    projectId: projectId,
    assignedTo: 'user-2',
    priority: 'high',
    status: 'in-progress',
    dueDate: new Date('2024-01-25'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22'),
    estimatedHours: 12,
    actualHours: 8
  }
]

const createMockActivities = (projectId: string): Activity[] => [
  {
    id: 'activity-1',
    organizationId: 'org-1',
    type: 'project_update',
    title: 'Project Status Updated',
    description: 'Project progress updated to 65%',
    userId: 'user-1',
    userName: 'John Doe',
    userTitle: 'Senior Developer',
    projectId: projectId,
    timestamp: new Date('2024-01-25 10:30:00')
  },
  {
    id: 'activity-2',
    organizationId: 'org-1',
    type: 'task_completed',
    title: 'Task Completed',
    description: 'Design System Setup completed ahead of schedule',
    userId: 'user-1',
    userName: 'John Doe',
    userTitle: 'Senior Developer',
    projectId: projectId,
    taskId: 'task-1',
    timestamp: new Date('2024-01-18 16:45:00')
  }
]

const createMockClient = (): Client => ({
  id: 'client-1',
  organizationId: 'org-1',
  name: 'Acme Corporation',
  email: 'contact@acmecorp.com',
  phone: '+1-555-0123',
  company: 'Acme Corp',
  position: 'Marketing Director',
  assignedManagerId: 'user-1',
  assignedManagerName: 'John Doe',
  assignedManagerTitle: 'Senior Developer',
  assignedManagerEmail: 'john@launchbird.com',
  assignedManagerPhone: '+1-555-0123',
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-25'),
  notes: 'High priority client, prefers weekly updates',
  tags: ['premium', 'e-commerce'],
  lastContactDate: new Date('2024-01-25'),
  totalProjects: 3,
  activeProjects: 2,
  completedProjects: 1
})

const createMockFiles = (): ProjectFile[] => [
  {
    id: 'file-1',
    name: 'design-system.figma',
    size: 2048576,
    type: 'application/figma',
    uploadedBy: 'John Doe',
    uploadedAt: new Date('2024-01-18'),
    url: '#',
    category: 'design'
  },
  {
    id: 'file-2',
    name: 'homepage-wireframes.pdf',
    size: 1048576,
    type: 'application/pdf',
    uploadedBy: 'Jane Smith',
    uploadedAt: new Date('2024-01-20'),
    url: '#',
    category: 'document'
  },
  {
    id: 'file-3',
    name: 'product-catalog-mockup.png',
    size: 3145728,
    type: 'image/png',
    uploadedBy: 'John Doe',
    uploadedAt: new Date('2024-01-22'),
    url: '#',
    category: 'image'
  }
]

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'activity' | 'files'>('overview')
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (projectId) {
      setProject(createMockProject(projectId))
      setTasks(createMockTasks(projectId))
      setActivities(createMockActivities(projectId))
      setClient(createMockClient())
      setFiles(createMockFiles())
      setLoading(false)
    }
  }, [projectId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'planning': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'on-hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const newFiles: ProjectFile[] = Array.from(files).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: 'Unknown',
      uploadedAt: new Date(),
      url: '#',
      category: 'other' as const
    }))
    
    setFiles(prev => [...newFiles, ...prev])
    setIsUploading(false)
    event.target.value = ''
  }

  const handleFileDelete = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Project Not Found</h1>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalTasks = tasks.length
  const budgetRemaining = (project.budget || 0) - (project.budgetSpent || 0)
  const budgetPercentage = project.budget ? ((project.budgetSpent || 0) / project.budget) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/projects')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
            <p className="text-muted-foreground">Project Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Update
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-3xl font-bold text-foreground">{project.progress}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Progress value={project.progress} className="mt-4" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tasks</p>
                <p className="text-3xl font-bold text-foreground">{completedTasks}/{totalTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Budget Used</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(project.budgetSpent || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              of {formatCurrency(project.budget || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Team</p>
                <p className="text-3xl font-bold text-foreground">{project.assignedTo.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">members assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'files', label: 'Files', icon: Folder },
              { id: 'team', label: 'Team', icon: Users },
              { id: 'activity', label: 'Activity', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content based on active tab */}
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Type</h4>
                    <Badge variant="outline">{project.type}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Start Date</h4>
                    <p className="text-sm">{formatDate(project.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">End Date</h4>
                    <p className="text-sm">{project.endDate ? formatDate(project.endDate) : 'Ongoing'}</p>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'tasks' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Tasks ({totalTasks})
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Due: {task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                          {task.estimatedHours && (
                            <span>Est: {task.estimatedHours}h</span>
                          )}
                          {task.actualHours && (
                            <span>Actual: {task.actualHours}h</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'files' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Project Files ({files.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept="*/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 cursor-pointer"
                    >
                      {isUploading ? (
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
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload design files, documents, and other project assets
                    </p>
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-3 cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Your First File
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {getFileIcon(file.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{file.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>Uploaded by {file.uploadedBy}</span>
                              <span>•</span>
                              <span>{formatDate(file.uploadedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFileDelete(file.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">John Doe</h4>
                      <p className="text-sm text-muted-foreground">Senior Developer</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Project Manager</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Jane Smith</h4>
                      <p className="text-sm text-muted-foreground">UI/UX Designer</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Team Member</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{activity.userName}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Project Manager */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Project Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{project.assignedManagerName}</p>
                  <p className="text-sm text-muted-foreground">{project.assignedManagerTitle}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{project.assignedManagerEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{project.assignedManagerPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          {client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.company}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Budget</span>
                  <span className="font-medium">{formatCurrency(project.budget || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Spent</span>
                  <span className="font-medium text-orange-600">{formatCurrency(project.budgetSpent || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining</span>
                  <span className="font-medium text-green-600">{formatCurrency(budgetRemaining)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span>{budgetPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={budgetPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Project Started</p>
                    <p className="text-xs text-muted-foreground">{formatDate(project.startDate)}</p>
                  </div>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Deadline</p>
                      <p className="text-xs text-muted-foreground">{formatDate(project.deadline)}</p>
                    </div>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Expected End</p>
                      <p className="text-xs text-muted-foreground">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
