describe('what-about-the-resurrection', () => {
  before(() => {
    cy.visit('/')
  })

  it('what about it', () => {
    // click journey from home page
    cy.get('a').contains('What About The Resurrection?').click()
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
    // check heading
    cy.get('h3').contains('What About It?').should('exist')
    // check button text
    cy.get('button').contains('Find Out').should('exist')
  })

  it('(video start)', () => {
    cy.get('button').contains('Find Out').click({force: true})
    // check video is play
    cy.get('video').should('have.prop', 'paused', false).and('have.prop', 'ended', false)
    .then(($video) => {
      $video[0].playbackRate = 10
    })
    // speed up playback
    // -- triggers the next step after a certain amount of time
  })

  it('Where did his body go?', () => {
    // check heading
    cy.get('h3').contains('Where did his body go?').should('exist')
    // check button text
    cy.get('button').contains('Someone stole').should('exist')
    cy.get('button').contains('didn\'t really die').should('exist')
    cy.get('button').contains('rose from the dead').should('exist')
  })

  it('(video continues 1)', () => {
    // click a button
    cy.get('button').contains('Someone stole').click({force: true})
    // check video continues
    cy.get('video').should('have.prop', 'paused', false).and('have.prop', 'ended', false)
  })

  it('a quote', () => {
    // cy.wait(50000)
    // check quote
    cy.get('h3').contains('pierced Jesus\' side').should('exist')
    // check button text
    cy.get('button').contains('What does it mean?').should('exist')
  })

  it('(video continues 2)', () => {
    // click the button
    cy.get('button').contains('What does it mean?').click({force: true})
    // check video playing
    cy.get('video').should('have.prop', 'paused', false).and('have.prop', 'ended', false)
  })

  it('What is Christianity to you', () => {
    // check heading
    cy.get('h3').contains('What is Christianity to you?').should('exist')
    // check button texts
    cy.get('button').contains('many ways?').should('exist')
    cy.get('button').contains('great lie').should('exist')
    cy.get('button').contains('One true way to God').should('exist')
  })

  it('should navigate to the next journey when any of the repsonses are clicked on', () => {
    // click a button
    cy.get('button').contains('One true way to God').click()
    // check the url
    cy.url().should('include', '/whats-jesus-got-to-do-with-me')
  })


})