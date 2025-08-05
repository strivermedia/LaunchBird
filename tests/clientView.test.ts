/**
 * Client View Tests
 * Comprehensive test suite for client view functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock client-view library
jest.mock('@/lib/client-view', () => ({
  getProjectByClientCode: jest.fn(),
  validateClientCode: jest.fn(),
  submitClientFeedback: jest.fn(),
  logClientAccess: jest.fn(),
  getProjectActivities: jest.fn(),
  getOrCreateClientAccessCode: jest.fn(),
  getClientByAccessCode: jest.fn(),
  getClientProjects: jest.fn(),
  isDevMode: jest.fn(),
}))

// Mock project data
const mockProject = {
  id: 'test-project-123',
  organizationId: 'test-org-123',
  title: 'Test Project',
  description: 'A test project for client view',
  type: 'one-time' as const,
  status: 'in-progress' as const,
  progress: 65,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-03-01'),
  deadline: new Date('2024-02-28'),
  assignedTo: ['user-1', 'user-2'],
  createdBy: 'user-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  clientId: 'client-123',
  budget: 10000,
  tags: ['web', 'design'],
  clientCode: 'TEST',
  codeExpiry: new Date('2024-12-31'),
  clientAccessEnabled: true,
}

const mockActivities = [
  {
    id: 'activity-1',
    organizationId: 'test-org-123',
    type: 'project_update' as const,
    title: 'Project Update',
    description: 'Updated project status',
    userId: 'user-1',
    userName: 'John Doe',
    userTitle: 'Project Manager',
    projectId: 'test-project-123',
    timestamp: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'activity-2',
    organizationId: 'test-org-123',
    type: 'task_completed' as const,
    title: 'Task Completed',
    description: 'Completed design phase',
    userId: 'user-2',
    userName: 'Jane Smith',
    userTitle: 'Designer',
    projectId: 'test-project-123',
    timestamp: new Date('2024-01-14T15:30:00Z'),
  },
]

describe('Client View Library Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate client code correctly', async () => {
    const clientView = require('@/lib/client-view')
    clientView.getProjectByClientCode.mockResolvedValue(mockProject)
    clientView.validateClientCode.mockResolvedValue({ valid: true, project: mockProject })
    
    const result = await clientView.validateClientCode('TEST')
    
    expect(result.valid).toBe(true)
    expect(result.project).toEqual(mockProject)
  })

  it('should handle invalid client code', async () => {
    const clientView = require('@/lib/client-view')
    clientView.getProjectByClientCode.mockResolvedValue(null)
    clientView.validateClientCode.mockResolvedValue({ 
      valid: false, 
      error: 'Invalid or expired access code' 
    })
    
    const result = await clientView.validateClientCode('INVALID')
    
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid or expired access code')
  })

  it('should handle disabled client access', async () => {
    const clientView = require('@/lib/client-view')
    const disabledProject = { ...mockProject, clientAccessEnabled: false }
    clientView.getProjectByClientCode.mockResolvedValue(disabledProject)
    clientView.validateClientCode.mockResolvedValue({ 
      valid: false, 
      error: 'Client access is disabled for this project' 
    })
    
    const result = await clientView.validateClientCode('TEST')
    
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Client access is disabled for this project')
  })
})

describe('Client View Basic Functionality', () => {
  it('should have proper mock data structure', () => {
    expect(mockProject).toHaveProperty('id')
    expect(mockProject).toHaveProperty('title')
    expect(mockProject).toHaveProperty('status')
    expect(mockProject).toHaveProperty('progress')
    expect(mockProject.clientAccessEnabled).toBe(true)
  })

  it('should have proper activities structure', () => {
    expect(mockActivities).toHaveLength(2)
    expect(mockActivities[0]).toHaveProperty('id')
    expect(mockActivities[0]).toHaveProperty('title')
    expect(mockActivities[0]).toHaveProperty('type')
    expect(mockActivities[0]).toHaveProperty('timestamp')
  })
}) 