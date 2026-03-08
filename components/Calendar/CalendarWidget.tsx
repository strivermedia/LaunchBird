'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCalendarEvents } from '@/lib/calendar'
import { getCurrentUserProfile } from '@/lib/auth'
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import type { CalendarEvent } from '@/types/calendar'
import type { UserProfile } from '@/lib/auth'

/**
 * Calendar Widget Component
 * Compact calendar view for dashboard showing upcoming events
 */
export default function CalendarWidget() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const profile = await getCurrentUserProfile()
        setUserProfile(profile)

        if (profile?.organizationId) {
          // Get events for next 7 days
          const now = new Date()
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          
          const events = await getCalendarEvents(profile.organizationId, {
            dateRange: {
              start: now,
              end: nextWeek
            }
          })

          // Ensure events is an array, sort by date and take first 5
          const safeEvents = Array.isArray(events) ? events : []
          const sortedEvents = safeEvents
            .sort((a, b) => a.start.getTime() - b.start.getTime())
            .slice(0, 5)

          setUpcomingEvents(sortedEvents)
        }
      } catch (error) {
        console.error('Error loading calendar widget data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleViewCalendar = () => {
    router.push('/calendar')
  }

  const handleEventClick = (event: CalendarEvent) => {
    if (event.extendedProps.navigateTo) {
      router.push(event.extendedProps.navigateTo)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
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
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewCalendar}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="p-3 bg-card rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: event.extendedProps.color || '#3b82f6' }}
                      />
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(event.start, 'MMM d, h:mm a')}
                    </p>
                    {event.extendedProps.assigneeNames && event.extendedProps.assigneeNames.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.extendedProps.assigneeNames.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            onClick={handleViewCalendar}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            View Full Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}



