'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Dashboard-specific error component
 * Handles errors within the dashboard route
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard Error
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We encountered an error while loading your dashboard. This might be due to a network issue or temporary service disruption.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Error Details (Development):
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={reset}
            className="bg-[#9844fc] hover:bg-[#7b33cc] text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#9844fc] hover:bg-[#9844fc]/10"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#9844fc] hover:bg-[#9844fc]/10"
              onClick={() => window.location.href = '/login'}
            >
              Re-login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 