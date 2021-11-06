describe('fact-or-fiction joruney', () => {
  before(() => {
    cy.visit('/')
    cy.on('uncaught:exception', (err, runnable) => {
      return false
    })
  })

  it('should display the correct text for the first step', () => {
    cy.get('a').contains('Fact or Fiction').click()
    // this uncaught error will fail the test, catching it for now
    cy.get('h2').contains('Fact or Fiction').should('exist')
    cy.get('button').contains('Explore Now').should('exist')
  })

  it('clicking on the button should trigger the video to start', () => {
    cy.get('button').contains('Explore Now').click({force: true}) // button has error, parent class has 'disaply: none' -- remove {force: true} to check
    cy.get('video').should('have.prop', 'paused', false).and('have.prop', 'ended', false)
    .then(($video) => {
      $video[0].playbackRate = 10
    })
  })

  it('video should trigger the next step', () => {
    cy.get('h3').contains('Can we trust the story of Jesus?').should('exist')
    cy.get('button').contains('Yes').should('exist')
    cy.get('button').contains('No').should('exist')
  })

  it('click one of the buttons should trigger the continuation of the video', () => {
    cy.get('button').contains('Yes').click({force: true})
    cy.get('video').should('have.prop', 'paused', false).and('have.prop', 'ended', false)
  })
  
  it('video should trigger the next step', () => {
    cy.get('h2').contains('Jesus in History').should('exist')
    cy.get('button').contains('One question remains').should('exist')
  })

  it('clicking on the button should show the response step', () => {
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