'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendPasswordReset } from '@/lib/auth'
import type { AuthError } from '@/lib/auth'

/**
 * Reset password form validation schema
 */
const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/**
 * ResetPasswordForm component for password reset
 * Features: Email validation, success state, error handling
 */
export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  /**
   * Handle form submission
   * @param data - Form data
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Send password reset email
      await sendPasswordReset(data.email)
      setIsSuccess(true)
    } catch (err) {
      const authError = err as AuthError
      
      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address')
          break
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later')
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address')
          break
        default:
          setError('An error occurred. Please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Check your email
          </h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent a password reset link to your email address. Click the link
            in the email to reset your password.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium text-foreground mb-2">Didn&apos;t receive the email?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your spam folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          <Button
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Try again
          </Button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-[#9844fc] hover:text-[#7b33cc] hover:underline"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we&apos;ll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              {...register('email')}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#9844fc] hover:bg-[#7b33cc] text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="text-center space-y-2">
        <a
          href="/login"
          className="text-sm text-[#9844fc] hover:text-[#7b33cc] hover:underline"
        >
          Back to sign in
        </a>
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a
            href="/signup"
            className="text-[#9844fc] hover:text-[#7b33cc] hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
} 