'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FolderOpen, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  ArrowRight,
  Star,
  Plus
} from 'lucide-react'
import { Project, ProjectStatus } from '@/types'
import { Button } from '@/components/ui/button'

interface ProjectsOverviewProps {
  projects: Project[]
  loading?: boolean
}

/**
 * ProjectsOverview component
 * Modern projects display with clean card design
 */
export default function ProjectsOverview({ projects, loading = false }: ProjectsOverviewProps) {
  const getStatusIcon = (status: ProjectStatus) => {
    const iconMap: Record<ProjectStatus, React.ComponentType<any>> = {
      planning: Clock,
      'in-progress': Play,
      review: AlertCircle,
      completed: CheckCircle,
      'on-hold': Pause,
    }
    return iconMap[status] || Clock
  }

  const getStatusColor = (status: ProjectStatus) => {
    const colorMap: Record<ProjectStatus, string> = {
      planning: 'text-blue-600 dark:text-blue-400',
      'in-progress': 'text-green-600 dark:text-green-400',
      review: 'text-yellow-600 dark:text-yellow-400',
      completed: 'text-purple-600 dark:text-purple-400',
      'on-hold': 'text-gray-600 dark:text-gray-400',
    }
    return colorMap[status] || 'text-gray-600 dark:text-gray-400'
  }

  const getStatusBgColor = (status: ProjectStatus) => {
    const bgColorMap: Record<ProjectStatus, string> = {
      planning: 'bg-blue-50 dark:bg-blue-900/20',
      'in-progress': 'bg-green-50 dark:bg-green-900/20',
      review: 'bg-yellow-50 dark:bg-yellow-900/20',
      completed: 'bg-purple-50 dark:bg-purple-900/20',
      'on-hold': 'bg-gray-50 dark:bg-gray-900/20',
    }
    return bgColorMap[status] || 'bg-gray-100 dark:bg-gray-800/20'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[hsl(60,9.1%,97.8%)] dark:from-gray-900 dark:to-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Active Projects
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeProjects = projects.filter(
    (project) => project.status !== 'completed'
  )

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[hsl(60,9.1%,97.8%)] dark:from-gray-900 dark:to-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Projects
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {activeProjects.length} projects in progress
            </p>
          </div>
          <Button variant="outline" size="sm" className="border-[#9844fc] text-[#9844fc] hover:bg-[#9844fc] hover:text-white">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activeProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#9844fc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-[#9844fc]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No active projects
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create a new project to get started
            </p>
            <Button className="bg-[#9844fc] hover:bg-[#7b33cc] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeProjects.slice(0, 5).map((project) => {
              const StatusIcon = getStatusIcon(project.status)
              const statusColor = getStatusColor(project.status)
              const statusBgColor = getStatusBgColor(project.status)
              const daysUntilDeadline = project.deadline 
                ? getDaysUntilDeadline(project.deadline)
                : null

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project.title}
                        </h3>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#9844fc] transition-colors p-0 h-auto">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                      {project.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${statusBgColor}`}>
                      <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                      <span className={statusColor}>
                        {project.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">{project.progress}%</span>
                      </div>
                      <Progress 
                        value={project.progress} 
                        className="h-2"
                        style={{
                          '--progress-background': '#9844fc',
                        } as React.CSSProperties}
                      />
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.startDate ? formatDate(project.startDate) : 'No start date'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4" />
                        <span>{project.assignedTo.length} members</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <FolderOpen className="h-4 w-4" />
                        <span>{project.type === 'one-time' ? 'One-time' : 'Ongoing'}</span>
                      </div>

                      {project.budget && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <span className="font-semibold">${project.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Deadline Warning */}
                    {project.deadline && daysUntilDeadline !== null && (
                      <div className={`flex items-center space-x-2 text-sm ${
                        daysUntilDeadline <= 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : daysUntilDeadline <= 3 
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        <Clock className="h-4 w-4" />
                        <span>
                          {daysUntilDeadline <= 0 
                            ? 'Overdue' 
                            : daysUntilDeadline === 1 
                              ? 'Due tomorrow'
                              : `Due in ${daysUntilDeadline} days`
                          }
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="border-[#9844fc] text-[#9844fc] hover:bg-[#9844fc] hover:text-white">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-[#f5f5f5] dark:hover:bg-gray-700">
                          Edit
                        </Button>
                      </div>
                      <Button size="sm" className="bg-[#9844fc] hover:bg-[#7b33cc] text-white">
                        Open
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeProjects.length > 5 && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="border-[#9844fc] text-[#9844fc] hover:bg-[#9844fc] hover:text-white">
              View all {activeProjects.length} projects
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 