'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  CheckCircle, 
  MessageSquare, 
  Star, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react'
import { Activity as ActivityType, ActivityType as ActivityTypeEnum } from '@/types'

interface ActivityFeedProps {
  activities: ActivityType[]
  loading?: boolean
}

/**
 * ActivityFeed component
 * Modern activity feed with clean card design
 */
export default function ActivityFeed({ activities, loading = false }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityTypeEnum) => {
    const iconMap: Record<ActivityTypeEnum, React.ComponentType<any>> = {
      task_completed: CheckCircle,
      message: MessageSquare,
      shoutout: Star,
      project_update: FileText,
      client_feedback: AlertCircle,
      deadline_reminder: Clock,
    }
    return iconMap[type] || Activity
  }

  const getActivityColor = (type: ActivityTypeEnum) => {
    const colorMap: Record<ActivityTypeEnum, string> = {
      task_completed: 'text-green-600 dark:text-green-400',
      message: 'text-blue-600 dark:text-blue-400',
      shoutout: 'text-yellow-600 dark:text-yellow-400',
      project_update: 'text-purple-600 dark:text-purple-400',
      client_feedback: 'text-orange-600 dark:text-orange-400',
      deadline_reminder: 'text-red-600 dark:text-red-400',
    }
    return colorMap[type] || 'text-gray-600 dark:text-gray-400'
  }

  const getActivityBgColor = (type: ActivityTypeEnum) => {
    const bgColorMap: Record<ActivityTypeEnum, string> = {
      task_completed: 'bg-green-50 dark:bg-green-900/20',
      message: 'bg-blue-50 dark:bg-blue-900/20',
      shoutout: 'bg-yellow-50 dark:bg-yellow-900/20',
      project_update: 'bg-purple-50 dark:bg-purple-900/20',
      client_feedback: 'bg-orange-50 dark:bg-orange-900/20',
      deadline_reminder: 'bg-red-50 dark:bg-red-900/20',
    }
    return bgColorMap[type] || 'bg-gray-100 dark:bg-gray-800/20'
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
          <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[hsl(60,9.1%,97.8%)] dark:from-gray-900 dark:to-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </CardTitle>
      </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[hsl(60,9.1%,97.8%)] dark:from-gray-900 dark:to-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Latest updates and notifications
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-[#7c3aed] transition-colors p-0 h-auto">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#7c3aed]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-[#7c3aed]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Activity will appear here as you work
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const activityColor = getActivityColor(activity.type)
                const activityBgColor = getActivityBgColor(activity.type)

                return (
                  <div
                    key={activity.id}
                    className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Activity Icon */}
                      <div className={`w-8 h-8 ${activityBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <ActivityIcon className={`h-4 w-4 ${activityColor}`} />
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {activity.title}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {activity.description}
                        </p>

                        {/* Activity Metadata */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{activity.userName}</span>
                            {activity.userTitle && (
                              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {activity.userTitle}
                              </span>
                            )}
                          </div>
                          
                          {activity.projectId && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3" />
                              <span>Project #{activity.projectId.slice(-4)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}

        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Button variant="ghost" className="text-sm text-[#7c3aed] hover:text-[#6d28d9] transition-colors flex items-center justify-center space-x-1">
              <span>View all activity</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 