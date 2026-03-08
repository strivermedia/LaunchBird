'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import type { TaskFilter, TaskPriority, TaskStatus } from '@/types'
import { format } from 'date-fns'

interface TaskFiltersProps {
  filters: TaskFilter
  onFiltersChange: (filters: TaskFilter) => void
  availableProjects?: Array<{ id: string; title: string }>
  availableTeamMembers?: Array<{ id: string; name: string }>
  isOpen?: boolean
  onClose?: () => void
  onClear?: () => void
}

const statusOptions: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed']
const priorityOptions: TaskPriority[] = ['urgent', 'high', 'medium', 'low']

export default function TaskFilters({
  filters,
  onFiltersChange,
  availableProjects = [],
  availableTeamMembers = [],
  isOpen,
  onClose,
  onClear,
}: TaskFiltersProps) {
  const [draft, setDraft] = React.useState<TaskFilter>(filters)
  const [listSearch, setListSearch] = React.useState('')
  const [isDueOpen, setIsDueOpen] = React.useState(false)

  // When the panel opens, reset the draft to the current applied filters.
  React.useEffect(() => {
    if (isOpen) {
      setDraft(filters)
      setListSearch('')
      setIsDueOpen(false)
    }
  }, [isOpen, filters])

  const hasActiveFilters =
    (draft.status?.length ?? 0) > 0 ||
    (draft.priority?.length ?? 0) > 0 ||
    (draft.assignedTo?.length ?? 0) > 0 ||
    Boolean(draft.projectId) ||
    Boolean(draft.isOverdue) ||
    Boolean(draft.dueDateFrom || draft.dueDateTo)

  const toggleStatus = (status: TaskStatus) => {
    const current = draft.status || []
    const next = current.includes(status)
      ? current.filter(value => value !== status)
      : [...current, status]

    const nextFilters = { ...draft }
    if (next.length > 0) {
      nextFilters.status = next
    } else {
      delete nextFilters.status
    }
    setDraft(nextFilters)
  }

  const togglePriority = (priority: TaskPriority) => {
    const current = draft.priority || []
    const next = current.includes(priority)
      ? current.filter(value => value !== priority)
      : [...current, priority]

    const nextFilters = { ...draft }
    if (next.length > 0) {
      nextFilters.priority = next
    } else {
      delete nextFilters.priority
    }
    setDraft(nextFilters)
  }

  const toggleAssignee = (userId: string) => {
    const current = draft.assignedTo || []
    const next = current.includes(userId)
      ? current.filter(value => value !== userId)
      : [...current, userId]

    const nextFilters = { ...draft }
    if (next.length > 0) {
      nextFilters.assignedTo = next
    } else {
      delete nextFilters.assignedTo
    }
    setDraft(nextFilters)
  }

  const toggleProject = (projectId: string) => {
    const nextFilters = { ...draft }
    if (draft.projectId === projectId) {
      delete nextFilters.projectId
    } else {
      nextFilters.projectId = projectId
    }
    setDraft(nextFilters)
  }

  const toggleOverdue = () => {
    const nextFilters = { ...draft }
    if (draft.isOverdue) {
      delete nextFilters.isOverdue
    } else {
      nextFilters.isOverdue = true
    }
    setDraft(nextFilters)
  }

  const handleDueDateChange = (key: 'dueDateFrom' | 'dueDateTo', value: string) => {
    const nextFilters = { ...draft }
    if (value) {
      nextFilters[key] = new Date(`${value}T00:00:00`)
    } else {
      delete nextFilters[key]
    }
    setDraft(nextFilters)
  }

  const clearDueDateFilters = () => {
    handleDueDateChange('dueDateFrom', '')
    handleDueDateChange('dueDateTo', '')
  }

  const setDueRange = (from?: Date, to?: Date) => {
    const next = { ...draft }
    if (from) next.dueDateFrom = from
    else delete next.dueDateFrom
    if (to) next.dueDateTo = to
    else delete next.dueDateTo
    setDraft(next)
  }

  const handleClear = () => {
    setDraft({})
    setListSearch('')
    onClear?.()
  }

  const handleCancel = () => {
    setDraft(filters)
    setListSearch('')
    onClose?.()
  }

  const handleApply = () => {
    onFiltersChange(draft)
    onClose?.()
  }

  const dueLabel = (() => {
    if (!draft.dueDateFrom && !draft.dueDateTo) return 'Pick a date range'
    const from = draft.dueDateFrom ? format(draft.dueDateFrom, 'MMM d') : '…'
    const to = draft.dueDateTo ? format(draft.dueDateTo, 'MMM d') : '…'
    return `${from} – ${to}`
  })()

  const normalizedListSearch = listSearch.trim().toLowerCase()
  const filteredMembers =
    normalizedListSearch.length === 0
      ? availableTeamMembers
      : availableTeamMembers.filter(m => m.name.toLowerCase().includes(normalizedListSearch))
  const filteredProjects =
    normalizedListSearch.length === 0
      ? availableProjects
      : availableProjects.filter(p => p.title.toLowerCase().includes(normalizedListSearch))

  return (
    <Card
      className="h-full w-full rounded-none border-0 shadow-none bg-background flex flex-col"
      role="complementary"
      aria-label="Task filters"
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
            onClick={handleClear}
            className="h-7 px-2 text-[11px]"
            disabled={!hasActiveFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>

        {/* Quick filter search (projects/assignees lists) */}
        {(availableProjects.length > 0 || availableTeamMembers.length > 0) && (
          <div className="mt-3">
            <Input
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Search projects or people…"
              className="h-8 text-xs"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => {
              const active = Boolean(draft.status?.includes(status))
              return (
                <Button
                  key={status}
                  type="button"
                  variant={active ? 'pillActive' : 'pill'}
                  size="sm"
                  className="h-8 px-3 text-xs capitalize rounded-full border-border"
                  onClick={() => toggleStatus(status)}
                >
                  {status.replace('-', ' ')}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map(priority => {
              const active = Boolean(draft.priority?.includes(priority))
              return (
                <Button
                  key={priority}
                  type="button"
                  variant={active ? 'pillActive' : 'pill'}
                  size="sm"
                  className="h-8 px-3 text-xs capitalize rounded-full border-border"
                  onClick={() => togglePriority(priority)}
                >
                  {priority}
                </Button>
              )
            })}
          </div>
        </div>

        {availableTeamMembers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assignees</Label>
            <div className="space-y-1.5">
              {filteredMembers.map(member => {
                const checked = draft.assignedTo?.includes(member.id) || false
                return (
                  <div key={member.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <Checkbox
                      id={`task-filter-assignee-${member.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleAssignee(member.id)}
                    />
                    <Label htmlFor={`task-filter-assignee-${member.id}`} className="text-sm font-normal cursor-pointer">
                      {member.name}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {availableProjects.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Project</Label>
            <div className="space-y-1.5">
              {filteredProjects.map(project => {
                const checked = draft.projectId === project.id
                return (
                  <div key={project.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60">
                    <Checkbox
                      id={`task-filter-project-${project.id}`}
                      checked={checked}
                      onCheckedChange={() => toggleProject(project.id)}
                    />
                    <Label htmlFor={`task-filter-project-${project.id}`} className="text-sm font-normal cursor-pointer">
                      {project.title}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center justify-between">
            Due Date
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={clearDueDateFilters}
            >
              Clear
            </Button>
          </Label>
          <Popover open={isDueOpen} onOpenChange={setIsDueOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-9 justify-start rounded-lg font-normal"
              >
                <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className={draft.dueDateFrom || draft.dueDateTo ? 'text-foreground' : 'text-muted-foreground'}>
                  {dueLabel}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="range"
                selected={{ from: draft.dueDateFrom, to: draft.dueDateTo }}
                onSelect={(range) => {
                  if (!range?.from && !range?.to) {
                    setDueRange(undefined, undefined)
                    return
                  }
                  if (range?.from && !range?.to) {
                    setDueRange(range.from, range.from)
                    return
                  }
                  setDueRange(range?.from, range?.to)
                }}
                numberOfMonths={1}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="task-filter-overdue"
            checked={Boolean(draft.isOverdue)}
            onCheckedChange={toggleOverdue}
          />
          <Label htmlFor="task-filter-overdue" className="text-sm font-normal">
            Show only overdue tasks
          </Label>
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
            onClick={handleClear}
            disabled={!hasActiveFilters}
          >
            Clear all
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[11px]"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 px-3 text-[11px]"
              onClick={handleApply}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

