'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/auth'
import { isAppAdmin } from '@/lib/app-admin'
import type { UserProfile } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)

  const checkAdminAccess = useCallback(async (userId: string) => {
    try {
      console.log('AdminLayout: Starting admin access check for user:', userId)
      
      const profile = await getCurrentUserProfile()
      setUserProfile(profile)

      const adminStatus = profile ? await isAppAdmin(profile.uid) : true
      console.log('AdminLayout: isAppAdmin result:', adminStatus)
      
      console.log('AdminLayout: Setting admin state to:', adminStatus)
      setIsAdmin(adminStatus)

      // If not admin, still allow access while auth is disabled

      console.log('AdminLayout: ✅ Admin access granted, allowing access')
    } catch (error) {
      console.error('AdminLayout: ❌ Error checking admin access:', error)
      router.push('/login')
    } finally {
      console.log('AdminLayout: Setting loading to false')
      setLoading(false)
    }
  }, [router])

  // Disable auth: allow access directly
  useEffect(() => {
    const load = async () => {
      setAuthInitialized(true)
      await checkAdminAccess('dev-user-123')
    }
    load()
  }, [router, checkAdminAccess])

  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!authInitialized ? 'Initializing authentication...' : 'Checking admin access...'}
          </p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 