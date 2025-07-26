import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LaunchBird - Project Management Platform',
  description: 'Streamline your project management with LaunchBird. Secure authentication, role-based access, and real-time collaboration.',
  keywords: 'project management, collaboration, authentication, dashboard',
  authors: [{ name: 'LaunchBird Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'LaunchBird - Project Management Platform',
    description: 'Streamline your project management with LaunchBird',
    type: 'website',
    locale: 'en_US',
  },
}

/**
 * Root layout component for the LaunchBird application
 * Provides global styling, fonts, and metadata
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  )
} 