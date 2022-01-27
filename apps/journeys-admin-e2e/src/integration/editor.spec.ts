describe('fact-or-fiction edit', () => {
  before(() => {
    cy.visit('/journeys/fact-or-fiction/edit')
  })

  const email = 'test@example.com'
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

  it('navigates back to the cards tab', () => {
    // navigate back to cards tab
    cy.get('button[role="tab"]').contains('Cards').click()
    // cards tab should be selected
    cy.get('button[role="tab"]')
      .contains('Cards')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  it('gets iframe for card 3, clicks on the block', () => {
    const displayedCard = 'step-' + card3
    cy.get(`[data-testid="${displayedCard}"]`).within(() => {
      // Access the IFrame inside that card
      // Note: following 4 lines adapted from this tutorial: https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
      cy.get('iframe')
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .then(cy.wrap)
        // Click on the h6 'What do you think?' block
        .find(`h6`)
        .should('exist')
        .click() // throws error here, because it has found 2 'h6'
    })
  })

  /* TODO in future
  it('should switch to block properties when a block on the card is clicked', () => {
    
    // get the iframe of the card, so we can click on block elements within it

    // click a block on the displayed card

  })
  */
})
