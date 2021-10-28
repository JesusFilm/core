describe('journeys', () => {
  beforeEach(() => cy.visit('/a9b15d41-df33-4048-8055-81b6466dfbb8'))
  // beforeEach(() => cy.visit(`/${Journey.id}`))

  it('Should have correct metadata', () => {
    cy.document().its('title').should('eq', '#FallingPlates')
    cy.get('head meta[name="description"]').should(
      'have.attr',
      'content',
      'Watch this viral (4 minute) video about LIFE, DEATH, and the LOVE of a Savior. By the end of this short film, your faith will grow stronger. Afterward, you will receive a free special resource for continuing your spiritual journey. Watch it. Share it.'
    )
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      '#FallingPlates'
    )
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      'https://i4.ytimg.com/vi/KGlx11BxF24/maxresdefault.jpg'
    )
  })
})
