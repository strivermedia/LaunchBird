/**
 * Time Tracking Layer
 * CRUD operations for time entries
 */

import type { TimeEntry } from '@/types'
import type { CalendarFilters } from '@/types/calendar'
import { db } from './platform'

// Development mode flag
const DEV_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true'

// Mock data for development
const MOCK_TIME_ENTRIES: TimeEntry[] = []

/**
 * Get time entries for an organization
 */
export async function getTimeEntries(
  organizationId: string,
  filters?: CalendarFilters
): Promise<TimeEntry[]> {
  if (DEV_MODE) {
    // Use localStorage in dev mode
    if (typeof window === 'undefined') {
      return MOCK_TIME_ENTRIES.filter(entry => entry.organizationId === organizationId)
    }

    try {
      const storedEntries = localStorage.getItem(`time_entries-${organizationId}`)
      if (storedEntries) {
        const entries = JSON.parse(storedEntries)
        return entries.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }))
      }
      return MOCK_TIME_ENTRIES.filter(entry => entry.organizationId === organizationId)
    } catch (error) {
      console.error('Error loading time entries from localStorage:', error)
      return MOCK_TIME_ENTRIES.filter(entry => entry.organizationId === organizationId)
    }
  }

  // Use Supabase
  try {
    let query = db
      .from('time_entries')
      .select('*')
      .eq('organization_id', organizationId)

    // Apply filters
    if (filters) {
      if (filters.projects && filters.projects.length > 0) {
        query = query.in('project_id', filters.projects)
      }
      if (filters.teamMembers && filters.teamMembers.length > 0) {
        query = query.in('user_id', filters.teamMembers)
      }
      if (filters.dateRange) {
        query = query
          .gte('start_time', filters.dateRange.start.toISOString())
          .lte('start_time', filters.dateRange.end.toISOString())
      }
    }

    const { data, error } = await query.order('start_time', { ascending: false })

    if (error) {
      console.error('Supabase error fetching time entries:', error)
      throw error
    }

    // Transform Supabase data to TimeEntry type
    return (data || []).map((entry: any) => ({
      id: entry.id,
      organizationId: entry.organization_id,
      userId: entry.user_id,
      projectId: entry.project_id,
      taskId: entry.task_id,
      description: entry.description,
      startTime: new Date(entry.start_time),
      endTime: entry.end_time ? new Date(entry.end_time) : undefined,
      duration: entry.duration || (entry.end_time && entry.start_time 
        ? Math.round((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60))
        : undefined),
      createdAt: new Date(entry.created_at),
      updatedAt: new Date(entry.updated_at)
    }))
  } catch (error) {
    console.error('Error fetching time entries:', error)
    throw new Error('Failed to fetch time entries')
  }
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  organizationId: string,
  entryData: Omit<TimeEntry, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
): Promise<TimeEntry> {
  if (DEV_MODE) {
    const newEntry: TimeEntry = {
      id: `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organizationId,
      ...entryData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    if (typeof window !== 'undefined') {
      try {
        const storedEntries = localStorage.getItem(`time_entries-${organizationId}`)
        const entries = storedEntries ? JSON.parse(storedEntries) : []
        entries.push(newEntry)
        localStorage.setItem(`time_entries-${organizationId}`, JSON.stringify(entries))
      } catch (error) {
        console.error('Error saving time entry to localStorage:', error)
      }
    }

    return newEntry
  }

  // Use Supabase
  try {
    const { data, error } = await db
      .from('time_entries')
      .insert({
        organization_id: organizationId,
        user_id: entryData.userId,
        project_id: entryData.projectId,
        task_id: entryData.taskId,
        description: entryData.description,
        start_time: entryData.startTime.toISOString(),
        end_time: entryData.endTime?.toISOString(),
        duration: entryData.duration || (entryData.endTime && entryData.startTime
          ? Math.round((entryData.endTime.getTime() - entryData.startTime.getTime()) / (1000 * 60))
          : undefined)
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating time entry:', error)
      throw error
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      projectId: data.project_id,
      taskId: data.task_id,
      description: data.description,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      duration: data.duration,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  } catch (error) {
    console.error('Error creating time entry:', error)
    throw new Error('Failed to create time entry')
  }
}

/**
 * Update an existing time entry
 */
export async function updateTimeEntry(
  organizationId: string,
  entryId: string,
  updates: Partial<Omit<TimeEntry, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>>
): Promise<TimeEntry | null> {
  if (DEV_MODE) {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const storedEntries = localStorage.getItem(`time_entries-${organizationId}`)
      if (!storedEntries) return null

      const entries = JSON.parse(storedEntries)
      const entryIndex = entries.findIndex((e: TimeEntry) => e.id === entryId)

      if (entryIndex === -1) return null

      const updatedEntry = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date()
      }

      entries[entryIndex] = updatedEntry
      localStorage.setItem(`time_entries-${organizationId}`, JSON.stringify(entries))

      return {
        ...updatedEntry,
        startTime: new Date(updatedEntry.startTime),
        endTime: updatedEntry.endTime ? new Date(updatedEntry.endTime) : undefined,
        createdAt: new Date(updatedEntry.createdAt),
        updatedAt: new Date(updatedEntry.updatedAt)
      }
    } catch (error) {
      console.error('Error updating time entry in localStorage:', error)
      return null
    }
  }

  // Use Supabase
  try {
    const updateData: any = {}
    if (updates.userId) updateData.user_id = updates.userId
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId
    if (updates.taskId !== undefined) updateData.task_id = updates.taskId
    if (updates.description) updateData.description = updates.description
    if (updates.startTime) updateData.start_time = updates.startTime.toISOString()
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime?.toISOString()
    if (updates.duration !== undefined) {
      updateData.duration = updates.duration || (updates.endTime && updates.startTime
        ? Math.round((updates.endTime.getTime() - updates.startTime.getTime()) / (1000 * 60))
        : undefined)
    }

    const { data, error } = await db
      .from('time_entries')
      .update(updateData)
      .eq('id', entryId)
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating time entry:', error)
      throw error
    }

    if (!data) return null

    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      projectId: data.project_id,
      taskId: data.task_id,
      description: data.description,
      startTime: new Date(data.start_time),
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      duration: data.duration,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  } catch (error) {
    console.error('Error updating time entry:', error)
    throw new Error('Failed to update time entry')
  }
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(
  organizationId: string,
  entryId: string
): Promise<boolean> {
  if (DEV_MODE) {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const storedEntries = localStorage.getItem(`time_entries-${organizationId}`)
      if (!storedEntries) return false

      const entries = JSON.parse(storedEntries)
      const filteredEntries = entries.filter((e: TimeEntry) => e.id !== entryId)

      if (filteredEntries.length === entries.length) {
        return false // Entry not found
      }

      localStorage.setItem(`time_entries-${organizationId}`, JSON.stringify(filteredEntries))
      return true
    } catch (error) {
      console.error('Error deleting time entry from localStorage:', error)
      return false
    }
  }

  // Use Supabase
  try {
    const { error } = await db
      .from('time_entries')
      .delete()
      .eq('id', entryId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Supabase error deleting time entry:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting time entry:', error)
    throw new Error('Failed to delete time entry')
  }
}

