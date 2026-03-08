'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Calendar Page Component
 * Redirects to Task Manager with Calendar tab pre-selected
 */
export default function CalendarPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Task Manager with calendar view
    router.replace('/tasks?view=calendar')
  }, [router])

  return null
}
