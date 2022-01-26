import 'cypress-iframe'

describe('fact-or-fiction edit', () => {
  before(() => {
    cy.visit('/journeys/fact-or-fiction/edit')
  })

  const email = 'test@example.com'
  // Test Example
  const password = 'Example1'
  it('should sign in successfully', () => {
    cy.get('button').contains('Sign in with email').click()
    cy.get('input[name=email]').type(email)
    cy.get('button').contains('Next').click()
    cy.get('input[name=password]').type(password)
    cy.get('button').contains('Sign In').click()
    // end result brings you to /journeys/fact-or-fiction/edit
  })

  const cardsPanel = 'journeys-admin-editor-tabpanel-0'
  const card3 = '7a6c9d6a-3894-48da-9e30-27321b15402a'
  it('should switch to properties tab when a card is clicked', () => {
    // cards tab should be selected
    cy.get('button[role="tab"]')
      .contains('Cards')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
    // on the panel of cards, click on a card 3
    cy.get(`[id="${cardsPanel}"]`).within(() => {
      cy.get(`[id="${card3}"]`).click({ force: true }) // error: needs force:true because there is another element covering it
    })
    // properties tab should now be selected
    cy.get('button[role="tab"]')
      .contains('Properties')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  // const nestedCard = '67a7feec-1699-40a5-9f28-22e473ed9348'
  // const iframeParent = 'step-7a6c9d6a-3894-48da-9e30-27321b15402a'
  it('gets iframe for card', () => {
    // const iframeParent = 'step-' + card3
    cy.get(`[data-testid="${'step-' + card3}"]`).within(() => {
      cy.get('iframe')
        .its('0.contentDocument')
        .should('exist')
        .its('body')
        .should('not.be.undefined')
        .then(cy.wrap)
        .get('h6')
        .should('exist')
      // cy.frameLoaded()
    })
  })

  // const getIframeDocument = () => {
  //   return cy
  //   .get('iframe')
  //   .its('0.contentDocument').should('exist')
  // }

  // const getIframeBody = () => {
  //   return getIframeDocument()
  //   .its('body').should('not.be.undefined')
  //   .then(cy.wrap)
  // }
  it('should switch to block properties when a block on the card is clicked', () => {
    // navigate back to cards tab
    cy.get('button[role="tab"]').contains('Cards').click()

    // get the iframe of the card, so we can click on block elements within it

    // click a block on the displayed card
    // cy.get('h6').contains('What do you think?')
    // cy.get(`[id="${nestedCard}"]`)
  })
})
