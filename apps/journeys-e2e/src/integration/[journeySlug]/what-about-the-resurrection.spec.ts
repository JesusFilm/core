describe('what-about-the-resurrectopm', () => {
  before(() => {
    cy.visit('/what-about-the-resurrection')
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false
      }
    })
  })

  it('Should have correct metadata', () => {
    cy.get('head meta[property="og:title"]').should(
      'have.attr',
      'content',
      'What About The Resurrection?'
    )
    cy.title().should('eq', 'What About The Resurrection?')
  })

  it('Should have correct slug', () => {
    cy.url().should('include', '/what-about-the-resurrection')
  })
})

describe('what-about-the-resurrection user journey', () => {
  before(() => {
    cy.visit('/')
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false
      }
    })
  })

  it('should display the correct text for the first step', () => {
    cy.get('a').contains('What About The Resurrection?').click()
    cy.get('h3').contains('What About It?').should('exist')
    cy.get('button').contains('Find Out').should('exist')
  })

  it('should not have any data from other steps', () => {
    cy.get('h3').contains('What is Christianity to you?').should('not.exist')
  })

  it('clicking on the button should trigger the video to start', () => {
    cy.get('button').contains('Find Out').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
      .then(($video) => {
        $video[0].playbackRate = 10
      })
  })

  it('video should trigger the next step after some time', () => {
    cy.get('h3').contains('Where did his body go?').should('exist')
    cy.get('button').contains('Someone stole').should('exist')
    cy.get('button').contains("didn't really die").should('exist')
    cy.get('button').contains('rose from the dead').should('exist')
  })

  it('clicking one of the buttons should trigger the continuation of the video', () => {
    cy.get('button').contains('Someone stole').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
      .then(($video) => {
        $video[0].playbackRate = 10
      })
  })

  it('video should trigger the next step after some time', () => {
    cy.get('h6').contains("pierced Jesus' side").should('exist')
    cy.get('button').contains('What does it mean?').should('exist')
  })

  it('clicking one of the buttons should trigger the continuation of the video', () => {
    cy.get('button').contains('What does it mean?').click({ force: true })
    cy.get('video')
      .should('have.prop', 'paused', false)
      .and('have.prop', 'ended', false)
      .then(($video) => {
        $video[0].playbackRate = 10
      })
  })

  it('video should trigger the next final step after some time', () => {
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
