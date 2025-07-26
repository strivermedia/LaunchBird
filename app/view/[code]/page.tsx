'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { validateClientViewCode, signInAnonymouslyForClient } from '@/lib/auth'
import type { ClientViewCode } from '@/lib/auth'

/**
 * Client view page component
 * Handles anonymous access via 4-character codes with optional password protection
 */
export default function ClientViewPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [codeData, setCodeData] = useState<ClientViewCode | null>(null)

  useEffect(() => {
    validateCode()
  }, [code])

  /**
   * Validate the client view code
   */
  const validateCode = async () => {
    if (!code || code.length !== 4) {
      setError('Invalid access code')
      setIsLoading(false)
      return
    }

    try {
      const data = await validateClientViewCode(code)
      
      if (!data) {
        setError('Invalid or expired access code')
        setIsLoading(false)
        return
      }

      setCodeData(data)
      
      // If no password required, proceed to client view
      if (!data.password) {
        await proceedToClientView()
      }
      
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred while validating the access code')
      setIsLoading(false)
    }
  }

  /**
   * Handle password submission
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!codeData || !password.trim()) {
      setError('Please enter the password')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const data = await validateClientViewCode(code, password)
      
      if (!data) {
        setError('Incorrect password')
        return
      }

      await proceedToClientView()
    } catch (err) {
      setError('An error occurred while validating the password')
    } finally {
      setIsValidating(false)
    }
  }

  /**
   * Proceed to client view after successful validation
   */
  const proceedToClientView = async () => {
    try {
      // Sign in anonymously
      await signInAnonymouslyForClient()
      
      // Redirect to client view
      router.push('/view')
    } catch (err) {
      setError('An error occurred while accessing the client view')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#9844fc]" />
          <p className="text-muted-foreground">Validating access code...</p>
        </div>
      </div>
    )
  }

  if (error && !codeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#9844fc] hover:bg-[#7b33cc] text-white"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#9844fc] rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-3xl font-bold text-foreground">LaunchBird</h1>
        </div>

        {/* Password Form */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Client Access</h2>
            <p className="text-muted-foreground mt-2">
              This project requires a password to access
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter project password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={error ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <p id="password-error" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#9844fc] hover:bg-[#7b33cc] text-white"
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Access Project'
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-[#9844fc] hover:text-[#7b33cc] hover:underline"
            >
              Back to sign in
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 LaunchBird. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 