import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUserProfile } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side check for admin access
  const user = await getCurrentUserProfile()
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 