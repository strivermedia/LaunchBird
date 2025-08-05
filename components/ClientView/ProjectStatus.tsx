'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle, Calendar, MessageSquare, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Project, Activity } from '@/types'

interface ProjectStatusProps {
  project: Project
  activities: Activity[]
}

/**
 * Project Status Component
 * Displays project milestones, timeline, and recent activities
 */
export default function ProjectStatus({ project, activities }: ProjectStatusProps) {
  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  /**
   * Format relative time
   */
  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`
    
    return formatDate(date)
  }

  /**
   * Get activity icon based on type
   */
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_update':
        return <Calendar className="h-4 w-4 text-[#6d28d9] dark:text-[#7c3aed]" />
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'client_feedback':
        return <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'deadline_reminder':
        return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
    }
  }

  /**
   * Get milestone status
   */
  const getMilestoneStatus = (milestone: any) => {
    const now = new Date()
    const milestoneDate = new Date(milestone.date)
    
    if (milestone.completed) return 'completed'
    if (milestoneDate < now) return 'overdue'
    if (milestoneDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return 'upcoming'
    return 'pending'
  }

  /**
   * Mock milestones data - in real implementation, these would come from Firestore
   */
  const milestones = [
    {
      id: '1',
      title: 'Project Kickoff',
      description: 'Initial meeting and requirements gathering',
      date: new Date(project.startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      completed: true,
    },
    {
      id: '2',
      title: 'Design Phase',
      description: 'UI/UX design and wireframes',
      date: new Date(project.startDate.getTime() + 21 * 24 * 60 * 60 * 1000),
      completed: project.progress >= 30,
    },
    {
      id: '3',
      title: 'Development Phase',
      description: 'Core functionality implementation',
      date: new Date(project.startDate.getTime() + 42 * 24 * 60 * 60 * 1000),
      completed: project.progress >= 70,
    },
    {
      id: '4',
      title: 'Testing & Review',
      description: 'Quality assurance and client review',
      date: new Date(project.startDate.getTime() + 56 * 24 * 60 * 60 * 1000),
      completed: project.progress >= 90,
    },
    {
      id: '5',
      title: 'Project Delivery',
      description: 'Final delivery and handover',
      date: project.endDate || new Date(project.startDate.getTime() + 70 * 24 * 60 * 60 * 1000),
      completed: project.status === 'completed',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Milestones Timeline */}
      <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
            <span>Project Milestones</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground">
            Key milestones and timeline for your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const status = getMilestoneStatus(milestone)
              const isLast = index === milestones.length - 1
              
              return (
                <div key={milestone.id} className="relative">
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        status === 'completed' 
                          ? 'bg-green-500 border-green-500' 
                          : status === 'overdue'
                          ? 'bg-red-500 border-red-500'
                          : status === 'upcoming'
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-[#6d28d9] border-[#6d28d9] dark:bg-[#7c3aed] dark:border-[#7c3aed]'
                      }`}>
                        {status === 'completed' && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`absolute top-3 left-1.5 w-0.5 h-12 ${
                          status === 'completed' 
                            ? 'bg-green-200 dark:bg-green-800' 
                            : 'bg-muted dark:bg-muted'
                        }`} />
                      )}
                    </div>
                    
                    {/* Milestone content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground dark:text-white">
                          {milestone.title}
                        </h4>
                        <Badge className={`text-xs ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : status === 'overdue'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : status === 'upcoming'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {status === 'completed' ? 'Completed' :
                           status === 'overdue' ? 'Overdue' :
                           status === 'upcoming' ? 'Upcoming' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70 mt-1">
                        {formatDate(milestone.date)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/50 dark:border-border/50 shadow-lg dark:shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground dark:text-white flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-[#6d28d9] dark:text-[#7c3aed]" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground dark:text-muted-foreground">
            Latest updates and progress on your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground dark:text-white">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <User className="h-3 w-3 text-muted-foreground dark:text-muted-foreground" />
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                        {activity.userName}
                        {activity.userTitle && ` • ${activity.userTitle}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  No recent activity
                </p>
                <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70">
                  Updates will appear here as the project progresses
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 