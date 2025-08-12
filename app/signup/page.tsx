import React from 'react'
import SignupForm from '@/components/Auth/SignupForm'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Signup page metadata
 */
export const metadata = {
  title: 'Sign Up - LaunchBird',
  description: 'Create your LaunchBird account to start managing projects and collaborating with your team.',
}

/**
 * Signup page component
 * Provides a clean, centered layout for the signup form
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
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

        {/* Signup Form */}
        <Card className="shadow-sm">
          <CardContent className="p-8">
            <SignupForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 LaunchBird. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 