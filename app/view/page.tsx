'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Zap, Shield, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Client View Code Entry Page
 * Allows clients to enter their 4-character access code
 */
export default function ClientViewCodeEntryPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle code submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code.trim() || code.length !== 4) {
      setError('Please enter a valid 4-character access code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Redirect to the client view page with the code
      router.push(`/view/${code.toUpperCase()}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle code input change
   */
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCode(value)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#6d28d9] dark:bg-[#7c3aed] rounded-3xl shadow-lg">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground dark:text-white">
              LaunchBird
            </h1>
            <p className="text-muted-foreground dark:text-muted-foreground mt-2">
              Client View
            </p>
          </div>
        </div>

        {/* Code Entry Form */}
        <Card className="border-border/50 dark:border-border/50 shadow-xl dark:shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-semibold text-foreground dark:text-white">
              Enter Access Code
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-muted-foreground">
              Enter your 4-character project access code to view your project details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="code" 
                  className="text-sm font-medium text-foreground dark:text-white"
                >
                  Access Code
                </Label>
                <div className="relative">
                  <Input
                    id="code"
                    type="text"
                    placeholder="XXXX"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={4}
                    className="text-center text-lg font-mono tracking-widest bg-background dark:bg-background border-border dark:border-border focus:border-[#6d28d9] dark:focus:border-[#7c3aed] focus:ring-[#6d28d9] dark:focus:ring-[#7c3aed]"
                    aria-describedby={error ? 'code-error' : undefined}
                  />
                  <Eye className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                </div>
                {error && (
                  <p id="code-error" className="text-sm text-destructive dark:text-destructive">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] dark:bg-[#7c3aed] dark:hover:bg-[#6d28d9] text-white shadow-lg dark:shadow-xl"
                disabled={isLoading || code.length !== 4}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Accessing...
                  </>
                ) : (
                  <>
                    Access Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <Alert className="border-[#6d28d9]/20 dark:border-[#7c3aed]/20 bg-[#6d28d9]/5 dark:bg-[#7c3aed]/5">
              <Shield className="h-4 w-4 text-[#6d28d9] dark:text-[#7c3aed]" />
              <AlertDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                Your access is secure and encrypted. Codes expire automatically for your protection.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Need help? Contact your project manager
          </p>
          <p className="text-xs text-muted-foreground/70 dark:text-muted-foreground/70">
            © 2024 LaunchBird. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 