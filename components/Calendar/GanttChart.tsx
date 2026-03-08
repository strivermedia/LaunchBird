'use client'

import React from 'react'
import {
  addDays,
  differenceInCalendarDays,
  format,
  isWeekend,
  parseISO,
  startOfDay,
} from 'date-fns'
import type { GanttTask, GanttZoom } from '@/types/calendar'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/**
 * LaunchBird Gantt (custom, lightweight)
 * - Calm, modern UI
 * - Drag-first interactions
 * - Day/Week/Month views (default Week)
 * - Finish-to-Start dependencies + lightweight arrows
 * - Phases (projects) + collapsible groups
 *
 * Notes:
 * - We use an inclusive day model for display: a 1-day task has start=end.
 * - FS constraint: successor.start >= predecessor.end + 1 day.
 * - This component is intentionally minimal: no right-click menus, no config modals.
 */

type View = GanttZoom // 'day' | 'week' | 'month'

type ItemKind = 'phase' | 'task' | 'milestone'

type HeaderSegment = { key: string; startIndex: number; endIndex: number; label: string }

type Item = {
  id: string
  parent?: string
  name: string
  kind: ItemKind
  start: Date
  end: Date // inclusive for display
  progress: number // 0..1
  readonly: boolean
  dependencies: string[] // predecessor IDs (Finish-to-Start)
  // Optional extras (used in tooltip if present)
  assigneeName?: string
  plannedMinutes?: number
  loggedMinutes?: number
}

export interface GanttChartProps {
  tasks: GanttTask[]
  /** Called when a task/milestone is clicked (parent opens a right-side panel). */
  onTaskClick?: (taskId: string) => void
  /**
   * Called when task dates change due to drag/resize OR dependency auto-shift.
   * Called once per changed leaf task.
   */
  onTaskUpdate?: (taskId: string, startDate: Date, endDate?: Date) => void
  /** Persist a new Finish-to-Start dependency (from -> to). */
  onDependencyCreate?: (fromTaskId: string, toTaskId: string) => void | Promise<void>
  zoom?: View
  onZoomChange?: (zoom: View) => void
  /** Optional: show planned vs logged time in tooltip (hidden unless enabled). */
  timeTrackingEnabled?: boolean
  onTimeTrackingEnabledChange?: (enabled: boolean) => void
  height?: string | number
  className?: string
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)))

const toDate = (value: Date | string | undefined, fallback: Date) => {
  if (!value) return fallback
  if (value instanceof Date) return value
  const s = String(value)
  // Accept "YYYY-MM-DD HH:mm" by coercing to ISO-like "YYYY-MM-DDTHH:mm"
  const isoish = s.includes('T') ? s : s.replace(' ', 'T')
  const d = parseISO(isoish)
  return Number.isNaN(d.getTime()) ? fallback : d
}

const normalizeProgress = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return clamp01(n > 1 ? n / 100 : n)
}

const daysInclusive = (start: Date, end: Date) => Math.max(1, differenceInCalendarDays(end, start) + 1)
const addDaysInclusive = (start: Date, durationDays: number) => addDays(start, Math.max(1, durationDays) - 1)

const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()

const startOfWeekSunday = (d: Date) => {
  const x = startOfDay(d)
  const day = x.getDay() // 0..6 (Sun..Sat)
  return addDays(x, -day)
}

const endOfWeekSaturday = (d: Date) => addDays(startOfWeekSunday(d), 6)

const formatRangeLabel = (start: Date, end: Date) => `${format(start, 'MMM d')} – ${format(end, 'MMM d')}`

function reachable(adj: Record<string, string[]>, from: string, target: string): boolean {
  const stack = [from]
  const seen = new Set<string>()
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === target) return true
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const next of adj[cur] || []) stack.push(next)
  }
  return false
}

function applyDependenciesFS(itemsById: Record<string, Item>, edges: Array<{ from: string; to: string }>) {
  const next: Record<string, Item> = { ...itemsById }
  const succ: Record<string, string[]> = {}
  for (const { from, to } of edges) {
    succ[from] ||= []
    succ[from].push(to)
  }

  const queue: string[] = Array.from(new Set(edges.map((e) => e.from)))
  const inQueue = new Set(queue)

  while (queue.length) {
    const from = queue.shift()!
    inQueue.delete(from)
    const fromItem = next[from]
    if (!fromItem) continue
    for (const to of succ[from] || []) {
      const toItem = next[to]
      if (!toItem) continue
      if (toItem.readonly) continue
      const requiredStart = addDays(fromItem.end, 1)
      if (toItem.start.getTime() >= requiredStart.getTime()) continue
      const duration = daysInclusive(toItem.start, toItem.end)
      const newStart = requiredStart
      const newEnd = addDaysInclusive(newStart, duration)
      next[to] = { ...toItem, start: newStart, end: newEnd }
      if (!inQueue.has(to)) {
        queue.push(to)
        inQueue.add(to)
      }
    }
  }

  return next
}

function buildAdj(edges: Array<{ from: string; to: string }>) {
  const adj: Record<string, string[]> = {}
  for (const e of edges) {
    adj[e.from] ||= []
    adj[e.from].push(e.to)
  }
  return adj
}

export default function GanttChart({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onDependencyCreate,
  zoom = 'week',
  onZoomChange,
  timeTrackingEnabled = false,
  onTimeTrackingEnabledChange,
  height = 600,
  className,
}: GanttChartProps) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})
  const [warning, setWarning] = React.useState<string | null>(null)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [tooltip, setTooltip] = React.useState<{ id: string; x: number; y: number } | null>(null)
  const [scrollLeft, setScrollLeft] = React.useState(0)
  const [scrollTop, setScrollTop] = React.useState(0)

  const leftPaneRef = React.useRef<HTMLDivElement>(null)
  const rightScrollRef = React.useRef<HTMLDivElement>(null)
  const timelineRef = React.useRef<HTMLDivElement>(null)
  const barRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  // ---- normalize incoming tasks into internal items
  const base = React.useMemo(() => {
    const now = startOfDay(new Date())
    const safe = Array.isArray(tasks) ? tasks : []
    const byId: Record<string, Item> = {}

    for (const t of safe) {
      const id = String(t.id)
      const kind: ItemKind =
        t.type === 'milestone'
          ? 'milestone'
          : String(id).startsWith('project-') || t.type === 'project'
          ? 'phase'
          : 'task'
      const s = startOfDay(toDate(t.start_date as any, now))
      const eRaw = toDate((t.end_date as any) ?? t.start_date, s)
      const e = startOfDay(eRaw)

      const progress = normalizeProgress(t.progress)
      const readonly = kind === 'phase'

      byId[id] = {
        id,
        parent: t.parent ? String(t.parent) : undefined,
        name: String((t as any).text ?? ''),
        kind,
        start: s,
        end: kind === 'milestone' ? s : e,
        progress,
        readonly,
        dependencies: uniq((t.dependencies || []).map(String)),
        assigneeName: undefined,
        plannedMinutes: undefined,
        loggedMinutes: undefined,
      }
    }

    // compute children + rollups (phases and group rows)
    const childrenById: Record<string, string[]> = {}
    for (const it of Object.values(byId)) {
      if (!it.parent) continue
      childrenById[it.parent] ||= []
      childrenById[it.parent].push(it.id)
    }

    for (const parentId of Object.keys(childrenById)) {
      const parent = byId[parentId]
      if (!parent) continue
      const kids = (childrenById[parentId] || []).map((cid) => byId[cid]).filter(Boolean)
      if (kids.length === 0) continue
      const minStart = new Date(Math.min(...kids.map((k) => k.start.getTime())))
      const maxEnd = new Date(Math.max(...kids.map((k) => k.end.getTime())))
      const avgProgress = kids.reduce((sum, k) => sum + (k.progress || 0), 0) / kids.length
      byId[parentId] = { ...parent, kind: 'phase', readonly: true, start: minStart, end: maxEnd, progress: clamp01(avgProgress) }
    }

    return { byId, childrenById }
  }, [tasks])

  const itemsByIdRef = React.useRef<Record<string, Item>>({})
  const [items, setItems] = React.useState<Record<string, Item>>({})

  React.useEffect(() => {
    itemsByIdRef.current = base.byId
    setItems(base.byId)
  }, [base.byId])

  const edges = React.useMemo(() => {
    const e: Array<{ from: string; to: string }> = []
    for (const it of Object.values(items)) {
      for (const pred of it.dependencies || []) {
        if (!items[pred]) continue
        if (!items[it.id]) continue
        e.push({ from: pred, to: it.id })
      }
    }
    return e
  }, [items])

  const roots = React.useMemo(() => {
    const byId = items
    const childrenById: Record<string, string[]> = {}
    for (const it of Object.values(byId)) {
      if (!it.parent) continue
      childrenById[it.parent] ||= []
      childrenById[it.parent].push(it.id)
    }

    const rootIds = Object.values(byId)
      .filter((it) => !it.parent)
      .map((it) => it.id)
      .sort((a, b) => {
        const A = byId[a]
        const B = byId[b]
        const ak = A?.kind === 'phase' ? 0 : 1
        const bk = B?.kind === 'phase' ? 0 : 1
        if (ak !== bk) return ak - bk
        return (A?.start?.getTime() || 0) - (B?.start?.getTime() || 0)
      })

    return { rootIds, childrenById }
  }, [items])

  const flatRows = React.useMemo(() => {
    const rows: Array<{ id: string; depth: number; hasChildren: boolean }> = []
    const walk = (id: string, depth: number) => {
      const children = roots.childrenById[id] || []
      const hasChildren = children.length > 0
      rows.push({ id, depth, hasChildren })
      if (hasChildren && collapsed[id]) return
      for (const cid of children) walk(cid, depth + 1)
    }
    for (const rid of roots.rootIds) walk(rid, 0)
    return rows
  }, [roots, collapsed])

  const range = React.useMemo(() => {
    const all = Object.values(items)
    const now = startOfDay(new Date())
    const dates: Date[] = []
    for (const it of all) {
      dates.push(it.start, it.end)
    }
    const min = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : now
    const max = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : now
    const pad = zoom === 'month' ? 14 : zoom === 'day' ? 3 : 7
    return { start: addDays(startOfDay(min), -pad), end: addDays(startOfDay(max), pad) }
  }, [items, zoom])

  const pxPerDay = React.useMemo(() => {
    if (zoom === 'day') return 120
    if (zoom === 'month') return 22
    return 52
  }, [zoom])

  const totalDays = React.useMemo(() => daysInclusive(range.start, range.end), [range])

  const xForDate = React.useCallback(
    (d: Date) => differenceInCalendarDays(startOfDay(d), range.start) * pxPerDay,
    [range.start, pxPerDay]
  )

  // ---- drag state
  const dragRef = React.useRef<{
    kind: 'move' | 'resize-start' | 'resize-end' | 'link'
    id: string
    pointerStartX: number
    originStart: Date
    originEnd: Date
    previewToId?: string
  } | null>(null)
  const [, bump] = React.useReducer((x) => x + 1, 0)

  const warn = React.useCallback((msg: string) => {
    setWarning(msg)
    window.setTimeout(() => setWarning(null), 2200)
  }, [])

  const commit = React.useCallback(
    (nextById: Record<string, Item>) => {
      setItems(nextById)
      if (onTaskUpdate) {
        for (const [id, next] of Object.entries(nextById)) {
          const prev = itemsByIdRef.current[id]
          if (!prev) continue
          if (next.readonly) continue
          if (isSameDay(prev.start, next.start) && isSameDay(prev.end, next.end)) continue
          onTaskUpdate(id, next.start, next.end)
        }
      }
      itemsByIdRef.current = nextById
    },
    [onTaskUpdate]
  )

  const onBarPointerDown = React.useCallback(
    (e: React.PointerEvent, id: string, kind: 'move' | 'resize-start' | 'resize-end') => {
      const it = items[id]
      if (!it || it.readonly) return
      if (it.kind !== 'task') return
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = { kind, id, pointerStartX: e.clientX, originStart: it.start, originEnd: it.end }
    },
    [items]
  )

  const onLinkPointerDown = React.useCallback(
    (e: React.PointerEvent, fromId: string) => {
      const it = items[fromId]
      if (!it || it.readonly) return
      if (it.kind !== 'task') return
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = { kind: 'link', id: fromId, pointerStartX: e.clientX, originStart: it.start, originEnd: it.end }
      bump()
    },
    [items]
  )

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return

      if (drag.kind === 'link') {
        const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
        const toId = el?.closest?.('[data-gantt-bar-id]')?.getAttribute?.('data-gantt-bar-id') || undefined
        drag.previewToId = toId && toId !== drag.id ? toId : undefined
        bump()
        return
      }

      const dxPx = e.clientX - drag.pointerStartX
      const dxDays = Math.round(dxPx / pxPerDay)
      if (dxDays === 0) return

      const duration = daysInclusive(drag.originStart, drag.originEnd)
      let nextStart = drag.originStart
      let nextEnd = drag.originEnd

      if (drag.kind === 'move') {
        nextStart = addDays(drag.originStart, dxDays)
        nextEnd = addDays(drag.originEnd, dxDays)
      } else if (drag.kind === 'resize-start') {
        nextStart = addDays(drag.originStart, dxDays)
        const maxStart = addDays(drag.originEnd, -1)
        if (nextStart.getTime() > maxStart.getTime()) nextStart = maxStart
        nextEnd = drag.originEnd
      } else if (drag.kind === 'resize-end') {
        nextEnd = addDays(drag.originEnd, dxDays)
        if (nextEnd.getTime() < drag.originStart.getTime()) nextEnd = drag.originStart
        // keep inclusive-day duration stable for extreme drags
        if (daysInclusive(drag.originStart, nextEnd) < 1) nextEnd = addDaysInclusive(drag.originStart, duration)
        nextStart = drag.originStart
      }

      setItems((prev) => ({
        ...prev,
        [drag.id]: { ...prev[drag.id], start: startOfDay(nextStart), end: startOfDay(nextEnd) },
      }))
    },
    [pxPerDay]
  )

  const onPointerUp = React.useCallback(
    async (_e: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null

      if (drag.kind === 'link') {
        const toId = drag.previewToId
        if (!toId || toId === drag.id) {
          bump()
          return
        }
        const from = drag.id
        const to = toId

        const nextEdges = [...edges, { from, to }]
        const adj = buildAdj(nextEdges)
        if (reachable(adj, to, from)) {
          warn('That would create a circular dependency.')
          bump()
          return
        }

        // update local dependencies on successor
        setItems((prev) => {
          const cur = prev[to]
          if (!cur) return prev
          const next = { ...prev, [to]: { ...cur, dependencies: uniq([...(cur.dependencies || []), from]) } }
          const allEdges = Object.values(next).flatMap((it) => (it.dependencies || []).map((pred) => ({ from: pred, to: it.id })))
          return applyDependenciesFS(next, allEdges)
        })

        try {
          await onDependencyCreate?.(from, to)
        } catch {
          warn('Could not save dependency.')
        }

        bump()
        return
      }

      // commit move/resize and apply FS shifting
      const nextById = applyDependenciesFS(items, edges)
      commit(nextById)
    },
    [commit, edges, items, onDependencyCreate, warn]
  )

  // ---- Arrow layout (measure bars)
  const [barRects, setBarRects] = React.useState<Record<string, DOMRect>>({})
  const measure = React.useCallback(() => {
    const container = timelineRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const next: Record<string, DOMRect> = {}
    for (const [id, el] of Object.entries(barRefs.current)) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      // normalize to container coords
      next[id] = new DOMRect(r.left - containerRect.left, r.top - containerRect.top, r.width, r.height)
    }
    setBarRects(next)
  }, [])

  React.useLayoutEffect(() => {
    measure()
  }, [measure, flatRows.length, zoom, pxPerDay, totalDays])

  React.useEffect(() => {
    const on = () => measure()
    window.addEventListener('resize', on)
    const scroller = rightScrollRef.current
    scroller?.addEventListener('scroll', on, { passive: true })
    return () => {
      window.removeEventListener('resize', on)
      scroller?.removeEventListener('scroll', on as any)
    }
  }, [measure])

  // Sync header + left rows with the right scroll container.
  React.useEffect(() => {
    const scroller = rightScrollRef.current
    if (!scroller) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(() => {
        raf = 0
        setScrollLeft(scroller.scrollLeft)
        setScrollTop(scroller.scrollTop)
      })
    }
    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Forward wheel/trackpad scrolling from the left pane to the right scroller.
  // This prevents the page/container from horizontally scrolling when the user
  // scrolls while their cursor is over the task list (common Gantt UX expectation).
  React.useEffect(() => {
    const left = leftPaneRef.current
    const right = rightScrollRef.current
    if (!left || !right) return

    const onWheel = (ev: WheelEvent) => {
      // If the user scrolls over the left pane, treat it as scrolling the timeline.
      // - deltaY scrolls vertically (rows)
      // - deltaX scrolls horizontally (timeline)
      // - shift+wheel often maps to horizontal scroll
      const dx = ev.shiftKey ? ev.deltaY : ev.deltaX
      const dy = ev.shiftKey ? 0 : ev.deltaY

      // Only intercept if there is something to scroll.
      const canScrollX = right.scrollWidth > right.clientWidth
      const canScrollY = right.scrollHeight > right.clientHeight
      if ((!canScrollX || dx === 0) && (!canScrollY || dy === 0)) return

      ev.preventDefault()
      if (canScrollX && dx) right.scrollLeft += dx
      if (canScrollY && dy) right.scrollTop += dy
    }

    left.addEventListener('wheel', onWheel, { passive: false })
    return () => left.removeEventListener('wheel', onWheel)
  }, [flatRows.length, totalDays, pxPerDay])

  // ---- UI helpers
  const todayX = React.useMemo(() => xForDate(startOfDay(new Date())), [xForDate])

  const headerDates = React.useMemo(() => {
    const arr: Date[] = []
    for (let i = 0; i < totalDays; i++) arr.push(addDays(range.start, i))
    return arr
  }, [range.start, totalDays])

  const rowHeight = 44
  const leftNameWidth = 260
  const leftDatesWidth = 160
  const leftWidth = leftNameWidth + leftDatesWidth
  const headerHeight = 56

  const headerSegments = React.useMemo<HeaderSegment[]>(() => {
    if (headerDates.length === 0) return []

    if (zoom === 'month') {
      const segments: HeaderSegment[] = []
      let startIdx = 0
      let curKey = format(headerDates[0], 'yyyy-MM')
      for (let i = 1; i < headerDates.length; i++) {
        const k = format(headerDates[i], 'yyyy-MM')
        if (k !== curKey) {
          const start = headerDates[startIdx]
          segments.push({
            key: curKey,
            startIndex: startIdx,
            endIndex: i - 1,
            label: format(start, 'MMMM yyyy'),
          })
          startIdx = i
          curKey = k
        }
      }
      const start = headerDates[startIdx]
      segments.push({
        key: curKey,
        startIndex: startIdx,
        endIndex: headerDates.length - 1,
        label: format(start, 'MMMM yyyy'),
      })
      return segments
    }

    if (zoom === 'day') {
      const start = headerDates[0]
      const end = headerDates[headerDates.length - 1]
      return [
        {
          key: 'range',
          startIndex: 0,
          endIndex: headerDates.length - 1,
          label: formatRangeLabel(start, end),
        },
      ]
    }

    // week: group into Sun–Sat segments (matches the reference layout)
    const segments: HeaderSegment[] = []
    let startIdx = 0
    let curStart = startOfWeekSunday(headerDates[0])
    let curKey = curStart.toISOString()
    for (let i = 1; i < headerDates.length; i++) {
      const wkStart = startOfWeekSunday(headerDates[i])
      const wkKey = wkStart.toISOString()
      if (wkKey !== curKey) {
        const segStart = curStart
        const segEnd = endOfWeekSaturday(curStart)
        segments.push({
          key: curKey,
          startIndex: startIdx,
          endIndex: i - 1,
          label: formatRangeLabel(segStart, segEnd),
        })
        startIdx = i
        curStart = wkStart
        curKey = wkKey
      }
    }
    const segStart = curStart
    const segEnd = endOfWeekSaturday(curStart)
    segments.push({
      key: curKey,
      startIndex: startIdx,
      endIndex: headerDates.length - 1,
      label: formatRangeLabel(segStart, segEnd),
    })
    return segments
  }, [headerDates, zoom])

  const formatTaskDates = React.useCallback((it: Item) => {
    if (it.kind === 'milestone') return format(it.start, 'MMM d')
    return `${format(it.start, 'MMM d')} – ${format(it.end, 'MMM d')}`
  }, [])

  return (
    <div className={cn('w-full', className)} role="application" aria-label="Gantt Chart">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <Tabs value={zoom} onValueChange={(v) => (v === 'day' || v === 'week' || v === 'month') && onZoomChange?.(v)}>
          <TabsList aria-label="Timeline view">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {onTimeTrackingEnabledChange && (
          <button
            type="button"
            onClick={() => onTimeTrackingEnabledChange(!timeTrackingEnabled)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {timeTrackingEnabled ? 'Hide time' : 'Show time'}
          </button>
        )}
      </div>

      {warning && (
        <div className="mb-3 text-sm rounded-md border border-border bg-muted px-3 py-2 text-muted-foreground">
          {warning}
        </div>
      )}

      {/* Main grid */}
      <div
        className="relative border border-border rounded-lg overflow-hidden bg-card"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Header */}
        <div className="flex border-b border-border bg-muted">
          <div
            className="shrink-0 border-r border-border bg-muted"
            style={{ width: leftWidth }}
          >
            <div className="flex" style={{ height: headerHeight }}>
              <div
                className="px-4 flex items-center text-xs font-semibold tracking-wide text-muted-foreground"
                style={{ width: leftNameWidth }}
              >
                Task Name
              </div>
              <div
                className="px-4 flex items-center text-xs font-semibold tracking-wide text-muted-foreground border-l border-border"
                style={{ width: leftDatesWidth }}
              >
                Task Dates
              </div>
            </div>
          </div>
          <div className="relative flex-1 min-w-0 overflow-hidden">
            <div
              className="relative"
              style={{
                width: totalDays * pxPerDay,
                height: headerHeight,
                transform: `translateX(${-scrollLeft}px)`,
              }}
            >
              {/* Weekend shading */}
              {headerDates.map((d) => {
                const x = xForDate(d)
                const weekend = isWeekend(d)
                return (
                  <div
                    key={d.toISOString()}
                    className={cn('absolute top-0 bottom-0', weekend ? 'bg-muted/40' : 'bg-transparent')}
                    style={{ left: x, width: pxPerDay }}
                  />
                )
              })}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-primary/40"
                style={{ left: todayX }}
                aria-hidden="true"
              />

              {/* Top header segments (Week ranges / Month label) */}
              <div className="absolute left-0 right-0 top-0 h-[28px]">
                {headerSegments.map((seg) => {
                  const left = seg.startIndex * pxPerDay
                  const width = (seg.endIndex - seg.startIndex + 1) * pxPerDay
                  return (
                    <div
                      key={seg.key}
                      className="absolute top-0 h-[28px] flex items-center justify-center text-[11px] font-semibold text-muted-foreground border-l border-border/60"
                      style={{ left, width }}
                    >
                      {seg.label}
                    </div>
                  )
                })}
              </div>

              {/* Bottom day-number row */}
              <div className="absolute left-0 right-0 bottom-0 h-[28px] flex">
                {headerDates.map((d) => (
                  <div
                    key={d.toISOString()}
                    className="flex items-center justify-center text-[11px] text-muted-foreground border-l border-border/50"
                    style={{ width: pxPerDay }}
                  >
                    {format(d, 'd')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex" style={{ height: `calc(100% - ${headerHeight}px)` }}>
          {/* Left pane (pinned, no horizontal scroll; vertically synced to right scrollTop) */}
          <div
            ref={leftPaneRef}
            className="shrink-0 border-r border-border bg-card overflow-hidden"
            style={{ width: leftWidth }}
          >
            <div style={{ transform: `translateY(${-scrollTop}px)`, willChange: 'transform' }}>
              {flatRows.map(({ id, depth, hasChildren }) => {
                const it = items[id]
                if (!it) return null
                const isPhase = it.kind === 'phase'
                const displayName =
                  isPhase && !it.name.toLowerCase().startsWith('project:')
                    ? `Project: ${it.name}`
                    : it.name
                return (
                  <div
                    key={id}
                    className={cn(
                      'h-[44px] flex border-b border-border/50',
                      isPhase ? 'bg-muted/25' : 'bg-card'
                    )}
                  >
                    {/* Name column */}
                    <div className="flex items-center gap-2 px-3" style={{ width: leftNameWidth }}>
                      <div style={{ width: depth * 14 }} />
                      {hasChildren ? (
                        <button
                          type="button"
                          className="w-6 h-6 grid place-items-center rounded-md hover:bg-muted transition-colors"
                          onClick={() => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))}
                          aria-label={collapsed[id] ? 'Expand' : 'Collapse'}
                        >
                          <span className="text-muted-foreground">{collapsed[id] ? '▸' : '▾'}</span>
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}

                      {it.kind === 'milestone' ? (
                        <div className="w-2.5 h-2.5 rotate-45 rounded-sm bg-primary/80" aria-hidden="true" />
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onTaskClick?.(id)}
                        className={cn(
                          'text-left truncate flex-1',
                          isPhase ? 'font-semibold text-foreground' : 'text-foreground'
                        )}
                        title={displayName}
                      >
                        {displayName || 'Untitled'}
                      </button>
                    </div>

                    {/* Dates column */}
                    <div
                      className="flex items-center px-3 text-sm text-muted-foreground border-l border-border"
                      style={{ width: leftDatesWidth }}
                    >
                      {formatTaskDates(it)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right scroll container (the ONLY scroller for the grid: both X + Y) */}
          <div ref={rightScrollRef} className="relative flex-1 min-w-0 overflow-auto overscroll-contain">
            <div
              ref={timelineRef}
              className="relative"
              style={{ width: totalDays * pxPerDay, height: flatRows.length * rowHeight }}
            >
              {/* Weekend shading in body */}
              {headerDates.map((d) => {
                const x = xForDate(d)
                const weekend = isWeekend(d)
                return (
                  <div
                    key={`bg-${d.toISOString()}`}
                    className={cn('absolute top-0 bottom-0', weekend ? 'bg-muted/30' : 'bg-transparent')}
                    style={{ left: x, width: pxPerDay }}
                    aria-hidden="true"
                  />
                )
              })}

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-primary/40"
                style={{ left: todayX }}
                aria-hidden="true"
              />

              {/* Row separators */}
              {flatRows.map((r, idx) => (
                <div
                  key={`sep-${r.id}`}
                  className="absolute left-0 right-0 border-b border-border/40"
                  style={{ top: (idx + 1) * rowHeight }}
                  aria-hidden="true"
                />
              ))}

              {/* Bars */}
              {flatRows.map(({ id }, idx) => {
                const it = items[id]
                if (!it) return null
                const top = idx * rowHeight + (rowHeight - 26) / 2

                // milestone
                if (it.kind === 'milestone') {
                  const x = xForDate(it.start)
                  return (
                    <div
                      key={id}
                      className="absolute"
                      style={{ top, left: x - 8, width: 16, height: 16 }}
                      data-gantt-bar-id={id}
                      onMouseEnter={() => setHoveredId(id)}
                      onMouseLeave={() => setHoveredId((cur) => (cur === id ? null : cur))}
                      onMouseMove={(e) => setTooltip({ id, x: e.clientX, y: e.clientY })}
                      onClick={() => onTaskClick?.(id)}
                    >
                      <div className="w-4 h-4 rotate-45 rounded-sm bg-primary shadow-sm border border-border" />
                    </div>
                  )
                }

                const x = xForDate(it.start)
                const w = daysInclusive(it.start, it.end) * pxPerDay
                const isReadonly = it.readonly
                const isDragging = dragRef.current?.id === id && dragRef.current?.kind !== 'link'

                return (
                  <div
                    key={id}
                    ref={(el) => {
                      barRefs.current[id] = el
                    }}
                    className={cn(
                      'absolute rounded-full border shadow-sm group',
                      isReadonly ? 'bg-muted border-border' : 'bg-primary border-border',
                      isDragging ? 'opacity-90' : 'opacity-100'
                    )}
                    style={{
                      top,
                      left: x,
                      width: w,
                      height: 26,
                      transition: isDragging ? 'none' : 'transform 120ms ease, width 120ms ease, left 120ms ease',
                    }}
                    data-gantt-bar-id={id}
                    onMouseEnter={() => setHoveredId(id)}
                    onMouseLeave={() => {
                      setHoveredId((cur) => (cur === id ? null : cur))
                      setTooltip(null)
                    }}
                    onMouseMove={(e) => setTooltip({ id, x: e.clientX, y: e.clientY })}
                    onClick={() => onTaskClick?.(id)}
                    onPointerDown={(e) => !isReadonly && onBarPointerDown(e, id, 'move')}
                  >
                    {/* progress fill */}
                    <div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        isReadonly ? 'bg-foreground/10' : 'bg-black/15'
                      )}
                      style={{ width: `${Math.round(clamp01(it.progress) * 100)}%` }}
                      aria-hidden="true"
                    />

                    <div className="absolute inset-0 flex items-center justify-center px-3">
                      <div className={cn('truncate text-sm font-semibold', isReadonly ? 'text-foreground' : 'text-primary-foreground')}>
                        {it.name}
                      </div>
                    </div>

                    {/* resize handles (leaf tasks only) */}
                    {!isReadonly && it.kind === 'task' && (
                      <>
                        <div
                          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100"
                          onPointerDown={(e) => onBarPointerDown(e, id, 'resize-start')}
                          aria-hidden="true"
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize opacity-0 group-hover:opacity-100"
                          onPointerDown={(e) => onBarPointerDown(e, id, 'resize-end')}
                          aria-hidden="true"
                        />

                        {/* dependency handle */}
                        <button
                          type="button"
                          className={cn(
                            'absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-border bg-card shadow-sm',
                            'opacity-0 group-hover:opacity-100 transition-opacity'
                          )}
                          onPointerDown={(e) => onLinkPointerDown(e, id)}
                          aria-label="Create dependency"
                        />
                      </>
                    )}
                  </div>
                )
              })}

              {/* Dependency arrows (SVG overlay) */}
              <svg className="absolute inset-0 pointer-events-none" width={totalDays * pxPerDay} height={flatRows.length * rowHeight}>
                {edges.map(({ from, to }) => {
                  const a = barRects[from]
                  const b = barRects[to]
                  if (!a || !b) return null
                  const x1 = a.x + a.width
                  const y1 = a.y + a.height / 2
                  const x2 = b.x
                  const y2 = b.y + b.height / 2
                  const midX = Math.min(x1 + 24, x2 - 24)
                  const path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
                  const isHovered = hoveredId === from || hoveredId === to
                  return (
                    <path
                      key={`${from}->${to}`}
                      d={path}
                      stroke={isHovered ? 'rgba(99,102,241,0.9)' : 'rgba(148,163,184,0.55)'}
                      strokeWidth={2}
                      fill="none"
                    />
                  )
                })}

                {/* Link preview */}
                {(() => {
                  const drag = dragRef.current
                  if (!drag || drag.kind !== 'link' || !drag.previewToId) return null
                  const from = barRects[drag.id]
                  const to = barRects[drag.previewToId]
                  if (!from || !to) return null
                  const x1 = from.x + from.width
                  const y1 = from.y + from.height / 2
                  const x2 = to.x
                  const y2 = to.y + to.height / 2
                  const midX = Math.min(x1 + 24, x2 - 24)
                  const path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
                  return <path d={path} stroke="rgba(99,102,241,0.9)" strokeWidth={2} fill="none" />
                })()}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip (calm, small, obvious) */}
      {tooltip && (() => {
        const it = items[tooltip.id]
        if (!it) return null
        const showTime = timeTrackingEnabled && (it.plannedMinutes || it.loggedMinutes)
        const planned = it.plannedMinutes ?? 0
        const logged = it.loggedMinutes ?? 0
        const over = planned > 0 && logged > planned

        return (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            <div className="max-w-[320px] rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
              <div className="text-sm font-semibold text-popover-foreground truncate">{it.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {format(it.start, 'MMM d, yyyy')} → {format(it.end, 'MMM d, yyyy')}
              </div>
              {it.assigneeName && (
                <div className="mt-1 text-xs text-muted-foreground">Assignee: {it.assigneeName}</div>
              )}
              {showTime && (
                <div className={cn('mt-1 text-xs', over ? 'text-destructive' : 'text-muted-foreground')}>
                  Time: {Math.round(planned / 60)}h planned · {Math.round(logged / 60)}h logged
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

