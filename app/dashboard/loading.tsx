import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

/**
 * Dashboard loading component
 * Shows while the dashboard is loading
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-card border-r border-border p-4">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </header>

        {/* Content Skeleton */}
        <main className="flex-1 p-6">
          <div className="mb-8">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 