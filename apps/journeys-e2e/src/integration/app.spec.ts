describe('journeys', () => {
  beforeEach(() => cy.visit('/'))

  it('should display link to #FallingPlates', () => {
    cy.get('a').contains('#FallingPlates').should('exist')
  })
  it('should display link to Fact or Fiction', () => {
    cy.get('a').contains('Fact or Fiction').should('exist')
  })
  it('should display link to What About The Resurrection?', () => {
    cy.get('a').contains('What About The Resurrection?').should('exist')
  })
  it("should display link to What's Jesus Got to Do With Me?", () => {
    cy.get('a').contains("What's Jesus Got to Do With Me?").should('exist')
  })
  it('should display link to Decision', () => {
    cy.get('a').contains('Decision').should('exist')
  })
})
