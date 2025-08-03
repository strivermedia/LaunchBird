'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Home, ArrowLeft } from 'lucide-react'

/**
 * Not Found component for Next.js App Router
 * Handles 404 errors with helpful navigation options
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#9844fc]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="h-8 w-8 text-[#9844fc]" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you&apos;re looking for doesn&apos;t exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="border-[#9844fc] text-[#9844fc] hover:bg-[#9844fc] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Link href="/">
            <Button className="bg-[#9844fc] hover:bg-[#7b33cc] text-white">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Popular Pages
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-[#9844fc] hover:bg-[#9844fc]/10">
                Dashboard
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-[#9844fc] hover:bg-[#9844fc]/10">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="ghost" size="sm" className="text-[#9844fc] hover:bg-[#9844fc]/10">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 