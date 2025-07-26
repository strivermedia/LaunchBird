import React from 'react'
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm'

/**
 * Reset password page metadata
 */
export const metadata = {
  title: 'Reset Password - LaunchBird',
  description: 'Reset your LaunchBird account password securely.',
}

/**
 * Reset password page component
 * Provides a clean, centered layout for the password reset form
 */
export default function ResetPasswordPage() {
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

        {/* Reset Password Form */}
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <ResetPasswordForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2024 LaunchBird. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 