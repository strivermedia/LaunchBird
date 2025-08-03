'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PlusCircle, 
  CheckSquare, 
  Star, 
  MessageSquare,
  Users,
  Calendar,
  FileText,
  Settings,
  ArrowRight
} from 'lucide-react'
import { QuickAction, QuickActionType } from '@/types'

interface QuickActionsProps {
  userRole: string
  onAction: (actionType: QuickActionType) => void
}

/**
 * QuickActions component
 * Modern quick action buttons with clean card design
 */
export default function QuickActions({ userRole, onAction }: QuickActionsProps) {
  const isAdmin = userRole === 'admin'

  const quickActions: QuickAction[] = [
    {
      type: 'create_project',
      label: 'New Project',
      icon: 'PlusCircle',
      description: 'Create a new project',
      requiresAdmin: true,
      action: () => onAction('create_project'),
    },
    {
      type: 'create_task',
      label: 'New Task',
      icon: 'CheckSquare',
      description: 'Create a new task',
      requiresAdmin: false,
      action: () => onAction('create_task'),
    },
    {
      type: 'create_shoutout',
      label: 'Give Shoutout',
      icon: 'Star',
      description: 'Recognize team member',
      requiresAdmin: false,
      action: () => onAction('create_shoutout'),
    },
    {
      type: 'send_message',
      label: 'Send Message',
      icon: 'MessageSquare',
      description: 'Send team message',
      requiresAdmin: false,
      action: () => onAction('send_message'),
    },
  ]

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      PlusCircle,
      CheckSquare,
      Star,
      MessageSquare,
      Users,
      Calendar,
      FileText,
      Settings,
    }
    return iconMap[iconName] || PlusCircle
  }

  const filteredActions = quickActions.filter(
    (action) => !action.requiresAdmin || isAdmin
  )

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-[hsl(60,9.1%,97.8%)] dark:from-gray-900 dark:to-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Common tasks and shortcuts
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6">
          {filteredActions.map((action) => {
            const IconComponent = getIconComponent(action.icon)
            return (
              <Button
                key={action.type}
                onClick={action.action}
                variant="ghost"
                className="group bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:bg-[#f5f5f5] dark:hover:bg-gray-700 hover:shadow-md hover:border-[#7c3aed]/30 transition-all duration-200 text-left h-auto flex-1 min-w-[240px] max-w-[280px]"
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center group-hover:bg-[#7c3aed]/20 transition-colors flex-shrink-0 mt-0.5">
                    <IconComponent className="h-5 w-5 text-[#7c3aed]" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-left">
                      {action.label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left leading-tight">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              12
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Active Projects
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckSquare className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              8
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Pending Tasks
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              156
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total Hours
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
            <div className="w-10 h-10 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              5
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Team Members
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="mt-6 text-center">
          <Button variant="outline" className="border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white transition-colors">
            View All Actions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 