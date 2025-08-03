'use client'

import { useState, useEffect } from 'react'
import { getCurrentUserProfile, type UserProfile } from './auth'

/**
 * React hook for authentication state
 * @returns Object with user profile and loading state
 */
export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userProfile = await getCurrentUserProfile()
        setUser(userProfile)
      } catch (error) {
        console.error('Error loading user profile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return { user, loading }
} 