import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProjectByClientCode, getProjectActivities, getClientByAccessCode, getClientProjects } from '@/lib/client-view'
import { validateClientViewCode } from '@/lib/auth'
import ClientViewContent from '@/components/ClientView/ClientViewContent'
import ClientDashboardView from '@/components/ClientView/ClientDashboardView'
import type { Project, Activity, Client } from '@/types'

interface ClientViewPageProps {
  params: {
    code: string
  }
  searchParams: {
    password?: string
  }
}

/**
 * Generate metadata for the client view page
 */
export async function generateMetadata({ params }: ClientViewPageProps): Promise<Metadata> {
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
      title: `${project.title} - Client View - LaunchBird`,
      description: `View project details and progress for ${project.title}`,
      openGraph: {
        title: `${project.title} - Client View`,
        description: `View project details and progress for ${project.title}`,
        type: 'website',
      },
    }
  } catch (error) {
    return {
      title: 'Client View - LaunchBird',
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
 * Client View Page Component
 * Handles static site generation and client-side hydration
 */
export default async function ClientViewPage({ params, searchParams }: ClientViewPageProps) {
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
        <ClientDashboardView 
          client={client}
          projects={projects}
          code={code}
        />
      )
    }
    
    // If not a client code, try project code
    if (password) {
      const codeData = await validateClientViewCode(code, password)
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
    console.error('Error loading client view:', err)
    error = 'An error occurred while loading the project'
  }
  
  // If no project found, return 404
  if (!project || error) {
    notFound()
  }
  
  return (
    <ClientViewContent 
      project={project} 
      activities={activities}
      code={code}
      password={password}
    />
  )
} 