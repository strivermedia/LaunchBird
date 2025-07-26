import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'

/**
 * Loading component for Next.js App Router
 * Shows while pages are loading
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#9844fc]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="h-8 w-8 text-[#9844fc] animate-spin" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Loading...
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please wait while we load your content.
        </p>

        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  )
} 