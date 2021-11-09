describe('fact-or-fiction joruney', () => {
  before(() => {
    cy.visit('/')
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false
      }
    })
  })

  it('should display the correct text for the first step', () => {
    cy.get('a').contains('Fact or Fiction').click()
    cy.get('h2').contains('Fact or Fiction').should('exist')
    cy.get('button').contains('Explore Now').should('exist')
  })

  it('clicking on the button should trigger the video to start', () => {
    cy.get('button').contains('Explore Now').click({ force: true }) // error, parent class has 'disaply: none'
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
      .then(($video) => {
        $video[0].playbackRate = 10
      })
  })

  it('video should trigger the next step after some time', () => {
    cy.get('h3').contains('Can we trust the story of Jesus?').should('exist')
    cy.get('button').contains('Yes').should('exist')
    cy.get('button').contains('No').should('exist')
  })

  it('clicking one of the buttons should trigger the continuation of the video', () => {
    cy.get('button').contains('Yes').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
      .then(($video) => {
        $video[0].playbackRate = 10
      })
  })

  it('video should trigger the next step after some time', () => {
    cy.get('h2').contains('Jesus in History').should('exist')
    cy.get('button').contains('One question remains').should('exist')
  })

  it('clicking on the button should show the response step', () => {
    cy.get('button').contains('One question remains').click({ force: true })
    cy.get('h2').contains('Who was this Jesus?').should('exist')
    cy.get('button').contains('A great influencer').should('exist')
    cy.get('button').contains('The Son of God').should('exist')
    cy.get('button').contains('A popular prophet').should('exist')
    cy.get('button').contains('A fake historical figure').should('exist')
  })

  it('should navigate to the next journey when any of the repsonses are clicked on', () => {
    cy.get('button').contains('The Son of God').click()
    cy.url().should('include', '/what-about-the-resurrection')
  })
})
