/**
 * ProjectList Component
 * Displays projects in a table format with actions and status indicators
 */

'use client'

import { useState } from 'react'
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
  Building2
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

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
      <div className="block md:hidden space-y-4">
        {projects.map((project) => {
          const statusConfig = getStatusConfig(project.status)
          const clientName = getClientName(project.clientId)
          const clientCompany = getClientCompany(project.clientId)
          const budgetProgress = getBudgetProgress(project.budget, project.budgetSpent)
          const budgetStatusColor = getBudgetStatusColor(budgetProgress)
          return (
            <Card key={project.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {project.title}
                    </CardTitle>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {canEditProject(project) && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Status and Type */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant} className="text-xs">
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.type.replace('-', ' ')}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{project.progress}%</span>
                  </div>
                  <Progress 
                    value={project.progress} 
                    className="h-2"
                  />
                </div>

                {/* Timeline and Team */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(project.startDate)}
                      {project.endDate && ` - ${formatDate(project.endDate)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{project.assignedTo.length} members</span>
                  </div>
                </div>

                {/* Client and Budget */}
                <div className="flex items-center justify-between">
                  {clientName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Client:</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{clientName}</span>
                        {clientCompany && (
                          <span className="text-xs text-muted-foreground">({clientCompany})</span>
                        )}
                      </div>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <RadialProgress 
                          value={budgetProgress} 
                          size={40} 
                          strokeWidth={3}
                          showValue={false}
                          className={budgetStatusColor}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Budget</span>
                        <span className="text-sm font-semibold">
                          ${project.budgetSpent?.toLocaleString() || 0} / ${project.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
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
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4 text-right">
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
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {project.title}
                        </div>
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
                    
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canEditProject(project) && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
