/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
      logout(): Chainable<void>
      createTask(task: {
        title: string
        description?: string
        priority?: 'low' | 'medium' | 'high' | 'urgent'
        dueDate?: string
      }): Chainable<void>
      createProject(project: {
        name: string
        description?: string
        clientId?: string
      }): Chainable<void>
    }
  }
}

const ORG_ID = 'dev-org-123'
const TASKS_STORAGE_KEY = `tasks-${ORG_ID}`

// Deterministic seed data for E2E runs (dev/mock mode uses localStorage).
const seedTasks = () => {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return [
    {
      id: 'task-1',
      organizationId: ORG_ID,
      title: 'Implement user authentication',
      description: 'Add login and registration functionality with proper validation',
      status: 'todo',
      priority: 'high',
      dueDate: new Date(now + 7 * day).toISOString(),
      assignedTo: ['user-1', 'user-2'],
      assignedToNames: ['John Doe', 'Jane Smith'],
      createdBy: 'dev-user-123',
      createdByName: 'Developer',
      projectId: 'project-1',
      projectTitle: 'Authentication System',
      dependencies: [],
      isRecurring: false,
      recurrencePattern: 'none',
      tags: [],
      comments: [],
      attachments: [],
      createdAt: new Date(now - 2 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
      estimatedHours: 8,
      actualHours: 0,
    },
    {
      id: 'task-2',
      organizationId: ORG_ID,
      title: 'Design database schema',
      description: 'Create database tables and relationships for the new system',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date(now + 3 * day).toISOString(),
      assignedTo: ['user-3'],
      assignedToNames: ['Bob Johnson'],
      createdBy: 'dev-user-123',
      createdByName: 'Developer',
      projectId: 'project-1',
      projectTitle: 'Authentication System',
      dependencies: ['task-1'],
      isRecurring: false,
      recurrencePattern: 'none',
      tags: [],
      comments: [],
      attachments: [],
      createdAt: new Date(now - 5 * day).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 12,
      actualHours: 4,
    },
    {
      id: 'task-3',
      organizationId: ORG_ID,
      title: 'Write unit tests',
      description: 'Add comprehensive test coverage for all components',
      status: 'completed',
      priority: 'low',
      dueDate: new Date(now - 1 * day).toISOString(),
      assignedTo: ['user-1'],
      assignedToNames: ['John Doe'],
      createdBy: 'dev-user-123',
      createdByName: 'Developer',
      projectId: 'project-2',
      projectTitle: 'Testing Framework',
      dependencies: [],
      isRecurring: false,
      recurrencePattern: 'none',
      tags: [],
      comments: [],
      attachments: [],
      createdAt: new Date(now - 10 * day).toISOString(),
      updatedAt: new Date(now - 3 * day).toISOString(),
      estimatedHours: 6,
      actualHours: 6,
      completedAt: new Date(now - 2 * day).toISOString(),
    },
  ]
}

// Custom login command
Cypress.Commands.add('login', (email = 'test@launchbird.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')

    // Seed deterministic tasks for E2E flows (used by /tasks).
    cy.window().then((win) => {
      win.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(seedTasks()))
    })
  })
})

// Custom logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Custom task creation command
Cypress.Commands.add('createTask', (task) => {
  cy.window().then((win) => {
    const existingRaw = win.localStorage.getItem(TASKS_STORAGE_KEY)
    const existing = existingRaw ? JSON.parse(existingRaw) : seedTasks()

    const now = new Date()
    const newTask = {
      id: `cypress-task-${Date.now()}`,
      organizationId: ORG_ID,
      title: task.title,
      description: task.description || '',
      status: 'todo',
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? new Date(`${task.dueDate}T00:00:00`).toISOString() : undefined,
      assignedTo: [],
      assignedToNames: [],
      createdBy: 'dev-user-123',
      createdByName: 'Developer',
      projectId: undefined,
      projectTitle: undefined,
      parentTaskId: undefined,
      dependencies: [],
      isRecurring: false,
      recurrencePattern: 'none',
      tags: [],
      comments: [],
      attachments: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      estimatedHours: 0,
      actualHours: 0,
    }

    win.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([newTask, ...existing]))
  })

  // Reload to ensure app reads updated localStorage.
  cy.reload()
})

// Custom project creation command
Cypress.Commands.add('createProject', (project) => {
  cy.get('[data-testid="create-project-button"]').click()
  cy.get('input[name="name"]').type(project.name)
  
  if (project.description) {
    cy.get('textarea[name="description"]').type(project.description)
  }
  
  if (project.clientId) {
    cy.get('select[name="clientId"]').select(project.clientId)
  }
  
  cy.get('button[type="submit"]').click()
})

export {}
