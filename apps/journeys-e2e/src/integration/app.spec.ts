
describe('journeys', () => {
  beforeEach(() => cy.visit('http://localhost:4100/'))

  it('should display link to #FallingPlates', () => {
    cy.get('a').contains('#FallingPlates').should('exist')
  })
})
