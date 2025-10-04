describe('Task Management', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/tasks')
  })

  it('should display the task manager page', () => {
    cy.get('h1').should('contain', 'Task Manager')
    cy.get('[data-testid="task-statistics"]').should('be.visible')
    cy.get('[data-testid="view-toggle"]').should('be.visible')
  })

  it('should toggle between Kanban and List views', () => {
    cy.get('[data-testid="view-toggle"]').within(() => {
      cy.get('button').contains('Kanban').should('have.attr', 'data-state', 'active')
      cy.get('button').contains('List').click()
      cy.get('button').contains('List').should('have.attr', 'data-state', 'active')
    })
  })

  it('should create a new task', () => {
    cy.get('[data-testid="create-task-button"]').click()
    
    cy.createTask({
      title: 'Test Task',
      description: 'This is a test task',
      priority: 'high',
      dueDate: '2024-12-31'
    })
    
    cy.get('[data-testid="task-card"]').should('contain', 'Test Task')
  })

  it('should filter tasks by status', () => {
    cy.get('[data-testid="status-filter"]').select('todo')
    cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0)
  })

  it('should filter tasks by priority', () => {
    cy.get('[data-testid="priority-filter"]').select('high')
    cy.get('[data-testid="task-card"]').should('have.length.greaterThan', 0)
  })

  it('should update task status', () => {
    cy.get('[data-testid="task-card"]').first().within(() => {
      cy.get('button').contains('Start').click()
    })
    
    cy.get('[data-testid="task-card"]').first().should('contain', 'in-progress')
  })

  it('should delete a task', () => {
    cy.get('[data-testid="task-card"]').first().within(() => {
      cy.get('[data-testid="task-menu"]').click()
      cy.get('[data-testid="delete-task"]').click()
    })
    
    cy.get('[data-testid="confirm-delete"]').click()
    cy.get('[data-testid="task-card"]').should('have.length.lessThan', 3)
  })
})
