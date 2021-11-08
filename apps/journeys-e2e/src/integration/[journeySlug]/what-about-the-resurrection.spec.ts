describe('what-about-the-resurrection', () => {
  before(() => {
    cy.visit('/')
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
  })

  it('what about it', () => {
    cy.get('a').contains('What About The Resurrection?').click()
    cy.get('h3').contains('What About It?').should('exist')
    cy.get('button').contains('Find Out').should('exist')
  })

  it('(video start)', () => {
    cy.get('button').contains('Find Out').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
    // cy.get('video').then(($video) => {
    //   $video[0].playbackRate = 1
    // })
  })

  it('Where did his body go?', () => {
    cy.get('h3').contains('Where did his body go?').should('exist')
    cy.get('button').contains('Someone stole').should('exist')
    cy.get('button').contains("didn't really die").should('exist')
    cy.get('button').contains('rose from the dead').should('exist')
  })

  it('(video continues 1)', () => {
    cy.get('button').contains('Someone stole').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
  })

  it('a quote', () => {
    cy.get('h6').contains("pierced Jesus' side").should('exist')
    cy.get('button').contains('What does it mean?').should('exist')
  })

  it('(video continues 2)', () => {
    cy.get('button').contains('What does it mean?').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
  })

  it('What is Christianity to you', () => {
    cy.get('h3').contains('What is Christianity to you?').should('exist')
    cy.get('button').contains('many ways').should('exist')
    cy.get('button').contains('great lie').should('exist')
    cy.get('button').contains('One true way to God').should('exist')
  })

  it('should navigate to the next journey when any of the repsonses are clicked on', () => {
    cy.get('button').contains('One true way to God').click({ force: true })
    cy.url().should('include', '/whats-jesus-got-to-do-with-me')
  })
})
