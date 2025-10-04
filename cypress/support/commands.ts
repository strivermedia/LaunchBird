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

// Custom login command
Cypress.Commands.add('login', (email = 'test@launchbird.com', password = 'password123') => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/login')
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
  cy.get('[data-testid="create-task-button"]').click()
  cy.get('input[name="title"]').type(task.title)
  
  if (task.description) {
    cy.get('textarea[name="description"]').type(task.description)
  }
  
  if (task.priority) {
    cy.get('select[name="priority"]').select(task.priority)
  }
  
  if (task.dueDate) {
    cy.get('input[name="dueDate"]').type(task.dueDate)
  }
  
  cy.get('button[type="submit"]').click()
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
