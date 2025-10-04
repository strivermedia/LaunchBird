describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.login()
    cy.visit('/dashboard')
  })

  it('should display the main dashboard elements', () => {
    cy.get('h1').should('contain', 'Dashboard')
    cy.get('[data-testid="greeting-card"]').should('be.visible')
    cy.get('[data-testid="quick-actions"]').should('be.visible')
    cy.get('[data-testid="projects-overview"]').should('be.visible')
    cy.get('[data-testid="activity-feed"]').should('be.visible')
  })

  it('should show time-based greeting', () => {
    const hour = new Date().getHours()
    const expectedGreeting = hour < 12 ? 'Good Morning' : 'Good Afternoon'
    
    cy.get('[data-testid="greeting-card"]').should('contain', expectedGreeting)
  })

  it('should display local time and weather', () => {
    cy.get('[data-testid="local-time"]').should('be.visible')
    cy.get('[data-testid="weather-info"]').should('be.visible')
  })

  it('should toggle between light and dark mode', () => {
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('have.class', 'dark')
    
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('should navigate to tasks page', () => {
    cy.get('[data-testid="quick-actions"]').within(() => {
      cy.get('a[href="/tasks"]').click()
    })
    cy.url().should('include', '/tasks')
  })

  it('should navigate to projects page', () => {
    cy.get('[data-testid="quick-actions"]').within(() => {
      cy.get('a[href="/projects"]').click()
    })
    cy.url().should('include', '/projects')
  })
})
