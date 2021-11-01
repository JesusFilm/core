describe('journeys', () => {
  beforeEach(() => cy.visit('/'))

  it('should display link to #FallingPlates', () => {
    cy.get('a').contains('#FallingPlates').should('exist')
  })
})
