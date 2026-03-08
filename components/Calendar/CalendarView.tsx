'use client'

import React, { useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core'
import type { CalendarEvent } from '@/types/calendar'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onEventDrop?: (eventId: string, newStart: Date, newEnd?: Date) => void
  onDateSelect?: (start: Date, end: Date) => void
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
  height?: string | number
  className?: string
}

/**
 * Calendar View Component
 * FullCalendar wrapper with drag-and-drop, dark mode, and navigation support
 */
// Get event color based on type - using app color scheme
function getEventColor(type: string, priority?: string): string {
  // Use priority-based colors for tasks
  if (type === 'task' && priority) {
    switch (priority) {
      case 'urgent':
        return 'oklch(0.5770 0.2450 27.3250)' // destructive/red
      case 'high':
        return 'oklch(0.7042 0.1602 288.9880)' // chart-2/orange
      case 'medium':
        return 'oklch(0.5106 0.2301 276.9656)' // primary/purple
      case 'low':
        return 'oklch(0.5679 0.2113 276.7065)' // chart-3/blue-purple
      default:
        return 'oklch(0.5106 0.2301 276.9656)' // primary
    }
  }

  // Type-based colors
  switch (type) {
    case 'task':
      return 'oklch(0.5106 0.2301 276.9656)' // primary purple
    case 'project':
      return 'oklch(0.6356 0.1922 281.8054)' // chart-4/purple
    case 'milestone':
      return 'oklch(0.7042 0.1602 288.9880)' // chart-2/orange
    case 'time_entry':
      return 'oklch(0.5679 0.2113 276.7065)' // chart-3/blue-purple
    default:
      return 'oklch(0.5560 0 0)' // muted
  }
}

export default function CalendarView({
  events,
  onEventClick,
  onEventDrop,
  onDateSelect,
  initialView = 'dayGridMonth',
  height = 'auto',
  className
}: CalendarViewProps) {
  const router = useRouter()

  // Transform CalendarEvent[] to FullCalendar EventInput[] (memoized for performance)
  const fullCalendarEvents = useMemo(() => {
    // Ensure events is always an array
    const safeEvents = Array.isArray(events) ? events : []
    return safeEvents.map(event => {
      const color = event.extendedProps.color || getEventColor(event.type, event.extendedProps.priority)
      const isTask = event.type === 'task'
      const isCompleted = event.extendedProps.status === 'completed'
      const typeClass =
        event.type === 'task'
          ? 'lb-calendar-task'
          : event.type === 'project'
          ? 'lb-calendar-project-banner'
          : event.type === 'milestone'
          ? 'lb-calendar-milestone'
          : event.type === 'time_entry'
          ? 'lb-calendar-time-entry'
          : ''
      return {
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        // Tasks use project-colored left border with light pill fill
        backgroundColor: isTask ? '#ffffff' : color,
        borderColor: color,
        textColor: isTask ? '#111827' : 'oklch(0.9850 0 0)',
        extendedProps: event.extendedProps,
        classNames: [
          'calendar-event',
          typeClass,
          isCompleted ? 'lb-calendar-task-completed' : '',
        ].filter(Boolean),
      }
    })
  }, [events])

  // Handle event click
  const handleEventClick = (clickInfo: EventClickArg) => {
    const safeEvents = Array.isArray(events) ? events : []
    const event = safeEvents.find(e => e.id === clickInfo.event.id)
    if (event) {
      if (onEventClick) {
        onEventClick(event)
      } else if (event.extendedProps.navigateTo) {
        router.push(event.extendedProps.navigateTo)
      }
    }
  }

  // Handle event drop (drag-and-drop)
  const handleEventDrop = (dropInfo: EventDropArg) => {
    const safeEvents = Array.isArray(events) ? events : []
    const event = safeEvents.find(e => e.id === dropInfo.event.id)
    if (event && onEventDrop) {
      onEventDrop(
        event.id,
        dropInfo.event.start || new Date(),
        dropInfo.event.end || undefined
      )
    }
  }

  // Handle date select
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo.start, selectInfo.end)
    }
  }


  return (
    <div className={cn('w-full calendar-wrapper', className)} role="application" aria-label="Calendar">
      {typeof window !== 'undefined' && (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={initialView}
          events={fullCalendarEvents}
          editable={!!onEventDrop}
          droppable={false}
          selectable={!!onDateSelect}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          select={handleDateSelect}
          height={height}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          // Custom styling via CSS classes
          eventClassNames={(arg) => {
            return [
              'calendar-event',
              'cursor-pointer',
              'transition-all'
            ]
          }}
        />
      )}
    </div>
  )
}

