import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProjectByClientCode, getProjectActivities, getClientByAccessCode, getClientProjects } from '@/lib/client-profile'
import { validateClientProfileCode } from '@/lib/auth'
import ClientProfileContent from '@/components/ClientProfile/ClientProfileContent'
import ClientProfileDashboard from '@/components/ClientProfile/ClientProfileDashboard'
import type { Project, Activity, Client } from '@/types'

interface ClientProfilePageProps {
  params: {
    code: string
  }
  searchParams: {
    password?: string
  }
}

/**
 * Generate metadata for the client profile page
 */
export async function generateMetadata({ params }: ClientProfilePageProps): Promise<Metadata> {
  const code = params.code
  
  try {
    const project = await getProjectByClientCode(code)
    
    if (!project) {
      return {
        title: 'Access Denied - LaunchBird',
        description: 'Invalid or expired access code',
      }
    }
    
    return {
      title: `${project.title} - Client Profile - LaunchBird`,
      description: `View project details and progress for ${project.title}`,
      openGraph: {
        title: `${project.title} - Client Profile`,
        description: `View project details and progress for ${project.title}`,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: 'Client Profile - LaunchBird',
      description: 'View your project details and progress',
    }
  }
}

/**
 * Generate static params for SSG
 * Note: In a real implementation, you would fetch all valid codes from Firestore
 */
export async function generateStaticParams() {
  // For SSG, we would typically fetch all valid client codes
  // For now, we'll return an empty array and rely on dynamic rendering
  return []
}

/**
 * Client Profile Page Component
 * Handles static site generation and client-side hydration
 */
export default async function ClientProfilePage({ params, searchParams }: ClientProfilePageProps) {
  const code = params.code
  const password = searchParams.password
  
  // Try to get client first, then project
  let client: Client | null = null
  let project: Project | null = null
  let activities: Activity[] = []
  let error: string | null = null
  
  try {
    // First try to get client by access code
    client = await getClientByAccessCode(code)
    
    if (client) {
      // This is a client access code - show client dashboard
      const projects = await getClientProjects(client.id, client.organizationId)
      return (
        <ClientProfileDashboard 
          client={client}
          projects={projects}
          code={code}
        />
      )
    }
    
    // If not a client code, try project code
    if (password) {
      const codeData = await validateClientProfileCode(code, password)
      if (!codeData) {
        error = 'Invalid access code or password'
      }
    }
    
    // Get project data
    project = await getProjectByClientCode(code)
    
    if (!project) {
      error = 'Invalid or expired access code'
    } else {
      // Get project activities
      activities = await getProjectActivities(project.id, project.organizationId, 20)
    }
  } catch (err) {
          console.error('Error loading client profile:', err)
    error = 'An error occurred while loading the project'
  }
  
  // If no project found, return 404
  if (!project || error) {
    notFound()
  }
  
  return (
    <ClientProfileContent 
      project={project} 
      activities={activities}
      code={code}
      password={password}
    />
  )
} 