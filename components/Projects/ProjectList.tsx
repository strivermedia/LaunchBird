/**
 * ProjectList Component
 * Displays projects in a table format with actions and status indicators
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Users, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  DollarSign,
  Building2,
  ChevronDown,
  ChevronUp,
  Plus,
  Upload,
  File,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Archive,
  Download,
  Trash2 as TrashIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadialProgress } from '@/components/ui/radial-progress'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/useAuth'
import { Project, ProjectStatus, ProjectType } from '@/types'

interface ProjectListProps {
  projects: Project[]
  onProjectUpdate: (project: Project) => void
}

// Mock client data for development
const mockClients = {
  'client-1': { id: 'client-1', name: 'Acme Corporation', company: 'Acme Corp' },
  'client-2': { id: 'client-2', name: 'TechStart Inc', company: 'TechStart' },
  'client-3': { id: 'client-3', name: 'Global Solutions', company: 'Global Solutions LLC' }
}

// Mock project items/tasks
const createMockProjectItems = (projectId: string) => [
  {
    id: 'item-1',
    title: 'Design System Setup',
    description: 'Create comprehensive design system with components and guidelines',
    status: 'completed',
    priority: 'high',
    dueDate: new Date('2024-01-20'),
    assignedTo: 'John Doe'
  },
  {
    id: 'item-2',
    title: 'Homepage Wireframes',
    description: 'Create wireframes for homepage and main landing pages',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2024-01-25'),
    assignedTo: 'Jane Smith'
  },
  {
    id: 'item-3',
    title: 'Mobile Responsive Design',
    description: 'Ensure all pages are mobile-friendly and responsive',
    status: 'planning',
    priority: 'medium',
    dueDate: new Date('2024-02-01'),
    assignedTo: 'Mike Johnson'
  }
]

// Mock project files
const createMockProjectFiles = (projectId: string) => [
  {
    id: 'file-1',
    name: 'design-system.figma',
    size: 2048576,
    type: 'application/figma',
    uploadedBy: 'John Doe',
    uploadedAt: new Date('2024-01-18'),
    category: 'design'
  },
  {
    id: 'file-2',
    name: 'homepage-wireframes.pdf',
    size: 1048576,
    type: 'application/pdf',
    uploadedBy: 'Jane Smith',
    uploadedAt: new Date('2024-01-20'),
    category: 'document'
  },
  {
    id: 'file-3',
    name: 'product-catalog-mockup.png',
    size: 3145728,
    type: 'image/png',
    uploadedBy: 'John Doe',
    uploadedAt: new Date('2024-01-22'),
    category: 'image'
  }
]

/**
 * Get status badge variant and styling based on project status
 */
const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case 'planning':
      return {
        variant: 'secondary' as const,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-border'
      }
    case 'in-progress':
      return {
        variant: 'default' as const,
        color: 'text-primary-foreground',
        bgColor: 'bg-primary',
        borderColor: 'border-primary'
      }
    case 'review':
      return {
        variant: 'outline' as const,
        color: 'text-foreground',
        bgColor: 'bg-background',
        borderColor: 'border-border'
      }
    case 'completed':
      return {
        variant: 'default' as const,
        color: 'text-primary-foreground',
        bgColor: 'bg-primary',
        borderColor: 'border-primary'
      }
    case 'on-hold':
      return {
        variant: 'destructive' as const,
        color: 'text-destructive-foreground',
        bgColor: 'bg-destructive',
        borderColor: 'border-destructive'
      }
    default:
      return {
        variant: 'secondary' as const,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/50',
        borderColor: 'border-border'
      }
  }
}

/**
 * Get status icon based on project status
 */
const getStatusIcon = (status: ProjectStatus) => {
  switch (status) {
    case 'planning':
      return <Clock className="h-4 w-4" />
    case 'in-progress':
      return <Play className="h-4 w-4" />
    case 'review':
      return <AlertCircle className="h-4 w-4" />
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'on-hold':
      return <Pause className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

/**
 * Format date for display
 */
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

/**
 * Get progress color based on percentage
 */
const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'bg-primary'
  if (progress >= 60) return 'bg-primary'
  if (progress >= 40) return 'bg-primary'
  return 'bg-primary'
}

/**
 * Get client name from client ID
 */
const getClientName = (clientId?: string) => {
  if (!clientId) return null
  return mockClients[clientId as keyof typeof mockClients]?.name || 'Unknown Client'
}

/**
 * Get client company from client ID
 */
const getClientCompany = (clientId?: string) => {
  if (!clientId) return null
  return mockClients[clientId as keyof typeof mockClients]?.company || null
}

/**
 * Calculate budget progress percentage
 */
const getBudgetProgress = (budget?: number, budgetSpent?: number) => {
  if (!budget || !budgetSpent) return 0
  return Math.min((budgetSpent / budget) * 100, 100)
}

/**
 * Get budget status color based on progress
 */
const getBudgetStatusColor = (progress: number) => {
  if (progress >= 90) return 'text-red-500'
  if (progress >= 75) return 'text-orange-500'
  if (progress >= 50) return 'text-yellow-500'
  return 'text-green-500'
}

/**
 * ProjectList component
 * Displays projects in a responsive table format
 */
export default function ProjectList({ projects, onProjectUpdate }: ProjectListProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null)

  const canEditProject = (project: Project) => {
    return user?.role === 'admin' || 
           (user?.role === 'team_member' && project.assignedTo.includes(user.uid))
  }

  const copyClientCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const updateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    const updatedProject = projects.find(p => p.id === projectId)
    if (updatedProject) {
      onProjectUpdate({
        ...updatedProject,
        status: newStatus,
        updatedAt: new Date()
      })
    }
  }

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId)
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                No projects found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get started by creating your first project or adjust your search filters
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {projects.map((project) => {
          const statusConfig = getStatusConfig(project.status)
          const clientName = getClientName(project.clientId)
          const clientCompany = getClientCompany(project.clientId)
          const budgetProgress = getBudgetProgress(project.budget, project.budgetSpent)
          const budgetStatusColor = getBudgetStatusColor(budgetProgress)
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  {/* Project Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {project.title}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {project.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={statusConfig.variant} className="text-xs shrink-0">
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(project.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{project.assignedTo.length}</span>
                      </div>
                      {clientName && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span className="truncate">{clientName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress and Actions */}
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold">{project.progress}%</div>
                      <Progress 
                        value={project.progress} 
                        className="w-16 h-2"
                      />
                    </div>
                    
                    <Link 
                      href={`/projects/${project.id}`}
                      className="block"
                    >
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
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
                  Type
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Progress
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Timeline
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Team
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Client
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Budget
                </TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, index) => {
                const statusConfig = getStatusConfig(project.status)
                const clientName = getClientName(project.clientId)
                const clientCompany = getClientCompany(project.clientId)
                const budgetProgress = getBudgetProgress(project.budget, project.budgetSpent)
                const budgetStatusColor = getBudgetStatusColor(budgetProgress)
                return (
                  <TableRow 
                    key={project.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 ${
                      index !== projects.length - 1 ? 'border-b border-border/50' : ''
                    }`}
                  >
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            console.log('Project title clicked for project:', project.id)
                            router.push(`/projects/${project.id}`)
                          }}
                          className="font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors duration-200 text-left cursor-pointer"
                        >
                          {project.title}
                        </button>
                        {project.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <Badge variant={statusConfig.variant} className="text-xs">
                        {project.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <Badge variant="outline" className="text-xs">
                        {project.type.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="w-32 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress 
                          value={project.progress} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div>{formatDate(project.startDate)}</div>
                        {project.endDate && (
                          <div>to {formatDate(project.endDate)}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{project.assignedTo.length}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {clientName ? (
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {clientName}
                            </span>
                          </div>
                          {clientCompany && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {clientCompany}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4">
                      {project.budget ? (
                        <div className="flex items-center gap-3">
                          <RadialProgress 
                            value={budgetProgress} 
                            size={48} 
                            strokeWidth={4}
                            showValue={false}
                            className={budgetStatusColor}
                          />
                          <div className="flex flex-col">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${project.budgetSpent?.toLocaleString() || 0}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              of ${project.budget.toLocaleString()}
                            </div>
                            <div className="text-xs font-medium" style={{ color: budgetStatusColor }}>
                              {Math.round(budgetProgress)}% used
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 relative">
                                              <Link 
                          href={`/projects/${project.id}`}
                          className="block"
                        >
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 cursor-pointer z-10 relative"
                          >
                            View Details
                          </Button>
                        </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Copy Success Toast */}
      {copiedCode && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Client code copied: {copiedCode}</span>
        </div>
      )}
    </div>
  )
}
