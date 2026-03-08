'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { X, Calendar as CalendarIcon, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { CalendarFilters as CalendarFiltersType } from '@/types/calendar'

interface CalendarFiltersProps {
  filters: CalendarFiltersType
  onFiltersChange: (filters: CalendarFiltersType) => void
  availableProjects?: Array<{ id: string; title: string }>
  availableTeamMembers?: Array<{ id: string; name: string }>
  className?: string
  onClose?: () => void
}

/**
 * Calendar Filters Component
 * Filter panel matching Tasks/Projects filter UI patterns
 */
export default function CalendarFilters({
  filters,
  onFiltersChange,
  availableProjects = [],
  availableTeamMembers = [],
  className,
  onClose,
}: CalendarFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState('')

  const formatDateRangeLabel = () => {
    const range = filters.dateRange
    if (!range?.start || !range?.end) return ''

    const sameDay =
      range.start.getFullYear() === range.end.getFullYear() &&
      range.start.getMonth() === range.end.getMonth() &&
      range.start.getDate() === range.end.getDate()

    if (sameDay) return format(range.start, 'MMM d, yyyy')

    // Prefer a compact label; include year where it helps disambiguate.
    const sameYear = range.start.getFullYear() === range.end.getFullYear()
    const startFmt = sameYear ? 'MMM d' : 'MMM d, yyyy'
    const endFmt = 'MMM d, yyyy'
    return `${format(range.start, startFmt)} – ${format(range.end, endFmt)}`
  }

  const handleProjectToggle = (projectId: string) => {
    const currentProjects = filters.projects || []
    const newProjects = currentProjects.includes(projectId)
      ? currentProjects.filter(id => id !== projectId)
      : [...currentProjects, projectId]
    onFiltersChange({ ...filters, projects: newProjects.length > 0 ? newProjects : undefined })
  }

  const handleTeamMemberToggle = (memberId: string) => {
    const currentMembers = filters.teamMembers || []
    const newMembers = currentMembers.includes(memberId)
      ? currentMembers.filter(id => id !== memberId)
      : [...currentMembers, memberId]
    onFiltersChange({ ...filters, teamMembers: newMembers.length > 0 ? newMembers : undefined })
  }

  const handleTaskTypeToggle = (taskType: 'recurring' | 'one-time' | 'ongoing') => {
    const currentTypes = filters.taskTypes || []
    const newTypes = currentTypes.includes(taskType)
      ? currentTypes.filter(type => type !== taskType)
      : [...currentTypes, taskType]
    onFiltersChange({ ...filters, taskTypes: newTypes.length > 0 ? newTypes : undefined })
  }

  const handleStatusChange = (status: string) => {
    const currentStatus = filters.status || []
    if (currentStatus.includes(status)) {
      onFiltersChange({ ...filters, status: currentStatus.filter(s => s !== status) })
    } else {
      onFiltersChange({ ...filters, status: [...currentStatus, status] })
    }
  }

  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    if (start && end) {
      onFiltersChange({ ...filters, dateRange: { start, end } })
    } else {
      onFiltersChange({ ...filters, dateRange: undefined })
    }
  }

  const clearFilters = () => {
    onFiltersChange({})
    setSearchTerm('')
  }

  const hasActiveFilters = 
    (filters.projects && filters.projects.length > 0) ||
    (filters.teamMembers && filters.teamMembers.length > 0) ||
    (filters.taskTypes && filters.taskTypes.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.dateRange

  return (
    <Card
      className={cn('h-full w-full rounded-none border-0 shadow-none bg-background flex flex-col', className)}
      role="complementary"
      aria-label="Calendar filters"
    >
      <CardHeader className="px-4 pt-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-[11px]"
            disabled={!hasActiveFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>

        {/* Search */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects, people"
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Projects Filter */}
        {availableProjects.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Projects</Label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {availableProjects.map(project => (
                <div key={project.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                  <Checkbox
                    id={`project-${project.id}`}
                    checked={filters.projects?.includes(project.id) || false}
                    onCheckedChange={() => handleProjectToggle(project.id)}
                  />
                  <Label
                    htmlFor={`project-${project.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {project.title}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members Filter */}
        {availableTeamMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Team Members</Label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {availableTeamMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={filters.teamMembers?.includes(member.id) || false}
                    onCheckedChange={() => handleTeamMemberToggle(member.id)}
                  />
                  <Label
                    htmlFor={`member-${member.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Types Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Task Types</Label>
          <div className="space-y-1.5">
            {(['recurring', 'one-time', 'ongoing'] as const).map(taskType => (
              <div key={taskType} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                <Checkbox
                  id={`type-${taskType}`}
                  checked={filters.taskTypes?.includes(taskType) || false}
                  onCheckedChange={() => handleTaskTypeToggle(taskType)}
                />
                <Label
                  htmlFor={`type-${taskType}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {taskType.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="space-y-1.5">
            {['todo', 'in-progress', 'review', 'completed', 'planning', 'on-hold'].map(status => (
              <div key={status} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes(status) || false}
                  onCheckedChange={() => handleStatusChange(status)}
                />
                <Label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {status.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-9 rounded-lg',
                  !filters.dateRange && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange ? (
                  <span className="min-w-0 flex-1 truncate">
                    {formatDateRangeLabel()}
                  </span>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: filters.dateRange?.start,
                  to: filters.dateRange?.end
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    handleDateRangeChange(range.from, range.to)
                  } else if (range?.from) {
                    handleDateRangeChange(range.from, range.from)
                  } else {
                    handleDateRangeChange(undefined, undefined)
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>

      {/* Footer (sticky) */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear all
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 px-3 text-[11px]"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Card>
  )
}

