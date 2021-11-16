describe('journey-admin', () => {
  beforeEach(() => cy.visit('/'))

  it('should display dashboard heading', () => {
    cy.get('h1').contains('Dashboard').should('exist')
  })
})
