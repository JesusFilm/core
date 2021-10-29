describe('journeys', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('a').contains('#FallingPlates').click()
  })

  it('Should have correct metadata', () => {
    cy.get('head meta[property="og:image"]').should(
      'have.attr',
      'content',
      'https://i4.ytimg.com/vi/KGlx11BxF24/maxresdefault.jpg'
    )
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
    cy.title().should('eq', '#FallingPlates')
  })
})
