'use client'

import React from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'

interface CalendarEventTooltipProps {
  event: CalendarEvent
  className?: string
}

/**
 * Calendar Event Tooltip Component
 * Shows detailed information about a calendar event on hover
 */
export default function CalendarEventTooltip({
  event,
  className
}: CalendarEventTooltipProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'todo':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <Card className={cn('w-80 shadow-lg', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-1">
            {event.title}
          </h3>
          {event.extendedProps.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.extendedProps.description}
            </p>
          )}
        </div>

        {/* Date/Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {event.allDay
              ? format(event.start, 'PPP')
              : `${format(event.start, 'PPP p')} - ${event.end ? format(event.end, 'p') : ''}`}
          </span>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          {event.extendedProps.status && (
            <Badge className={getStatusColor(event.extendedProps.status)}>
              {event.extendedProps.status.replace('-', ' ')}
            </Badge>
          )}
          {event.extendedProps.priority && (
            <Badge className={getPriorityColor(event.extendedProps.priority)}>
              {event.extendedProps.priority}
            </Badge>
          )}
        </div>

        {/* Assignees */}
        {event.extendedProps.assigneeNames && event.extendedProps.assigneeNames.length > 0 && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {event.extendedProps.assigneeNames.map((name, idx) => (
                <span key={idx} className="text-sm text-muted-foreground">
                  {name}
                  {idx < event.extendedProps.assigneeNames!.length - 1 && ','}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Type indicator */}
        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground capitalize">
            {event.type.replace('_', ' ')}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}






