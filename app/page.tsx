'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { isDevMode } from '@/lib/auth'

/**
 * Home page component
 * Provides navigation to authentication pages or redirects in dev mode
 */
export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // In development mode, redirect directly to dashboard
    if (isDevMode()) {
      router.push('/dashboard')
    }
  }, [router])

  // Show loading while redirecting in dev mode
  if (isDevMode()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-2xl text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">LaunchBird</h1>
          <p className="text-xl text-muted-foreground">
            Streamline your project management with secure authentication and role-based access
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Secure Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Email/password login with role-based access control and secure client codes
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Role Management</h3>
            <p className="text-sm text-muted-foreground">
              Admin and Team Member roles with different access levels and permissions
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Client Access</h3>
            <p className="text-sm text-muted-foreground">
              Secure 4-character codes for anonymous client access with optional password protection
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button className="px-8 py-3">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" className="px-8 py-3">
              Create Account
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p>© 2024 LaunchBird. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 