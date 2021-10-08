describe('journeys', () => {
  beforeEach(() => cy.visit('/c1fd3143-8a24-4031-a05f-e043cf8c4d21'))

  it('Should render the journey', () => {
    cy.get('.MuiContainer-root').should('exist')
    cy.get('.MuiPaper-root').should('exist')
  })

  it('Should play the video on click', () => {
    cy.get('.vjs-big-play-button').click()
    cy.get('.vjs-playing').should('exist')
  })

  it('Should render the question', () => {
    cy.get('h3')
      .contains('Jesus asks you, "Will you follow Me?"')
      .should('exist')
  })

  it('Should render the options', () => {
    cy.get('button').contains('I follow another faith').should('exist')
    cy.get('button').contains('I want to start').should('exist')
    cy.get('button').contains('I am already following').should('exist')
  })
})
