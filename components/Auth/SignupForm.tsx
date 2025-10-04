'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, User, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUserAccount, getUserProfile, getRedirectPath } from '@/lib/auth'
import type { AuthError, UserRole } from '@/lib/auth'

/**
 * Signup form validation schema
 */
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'team_member'] as const),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  location: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

/**
 * SignupForm component for user registration
 * Features: Email verification, role selection, password confirmation
 */
export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'team_member',
    },
  })

  const selectedRole = watch('role')

  /**
   * Handle form submission
   * @param data - Form data
   */
  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create user account
      const result = await createUserAccount(
        data.email,
        data.password,
        data.role as UserRole,
        data.title,
        data.location
      )

      // Get user profile to determine redirect path
      if (result.user?.id) {
        const userProfile = await getUserProfile(result.user.id)
        
        if (userProfile) {
          const redirectPath = getRedirectPath(userProfile.role)
          router.push(redirectPath)
        } else {
          // Fallback to dashboard if no profile found
          router.push('/dashboard')
        }
      } else {
        // Default redirect if no user ID
        router.push('/dashboard')
      }
    } catch (err) {
      const authError = err as AuthError
      
      // Handle specific auth errors
      switch (authError.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists')
          break
        case 'auth/weak-password':
          setError('Password is too weak. Please choose a stronger password')
          break
        case 'auth/invalid-email':
          setError('Please enter a valid email address')
          break
        default:
          setError('An error occurred during sign up. Please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Create account</h1>
        <p className="text-muted-foreground mt-2">
          Join LaunchBird and start managing your projects
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
              placeholder="Create a password"
              className="pl-10 pr-10"
              {...register('password')}
              aria-describedby={errors.password ? 'password-error' : undefined}
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
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-medium">
            Role
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as 'admin' | 'team_member')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="team_member">Team Member</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {selectedRole === 'admin' 
              ? 'Full access to all features and user management'
              : 'Access to assigned projects and tasks'
            }
          </p>
        </div>

        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Job title
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="title"
              type="text"
              placeholder="e.g., Project Manager, Developer"
              className="pl-10"
              {...register('title')}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
          </div>
          {errors.title && (
            <p id="title-error" className="text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Location (optional)
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              type="text"
              placeholder="e.g., San Francisco, CA"
              className="pl-10"
              {...register('location')}
            />
          </div>
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
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-primary hover:text-primary/90 hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
} 