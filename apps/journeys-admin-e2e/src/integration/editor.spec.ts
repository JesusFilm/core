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
  const card3 = '8730d39c-9ba0-4dc7-8289-ad562d799f11'
  const cardsPanel = 'control-panel-tabpanel-0'
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

  // inner iframe MuiBox-root iframe-1bh9mr5
  it('gets iframe for card 3, clicks on the block', () => {
    const displayedCard = 'step-' + card3
    cy.get(`[data-testid="${displayedCard}"]`).within(() => {
      // Access the IFrame inside that card
      // Note: following 4 lines adapted from this tutorial: https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
      cy.get('iframe')
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .then(cy.wrap)
        .within(() => {
          cy.get('h6')
            .contains('What do you think?')
            // .eq(0)
            .should('exist')
            .click()
        })
      // Click on the h6 'What do you think?' block
      // .find(`h6`)
      // .should('exist')
      // .click() // throws error here, because it has found 2 'h6'
    })
  })

  it('should switch to block properties when a block on the card is clicked', () => {
    // properties tab should now be selected
    cy.get('button[role="tab"]')
      .contains('Properties')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  const propertiesPanel = 'control-panel-tabpanel-1'
  it('properties tab should now be displaying the Typography properties', () => {
    cy.get(`[id="${propertiesPanel}"]`).within(() => {
      cy.get('p').contains('Editing Typography Properties').should('exist')
      cy.get('span').contains('Text Variant').should('exist')
      cy.get('p').contains('Header 6').should('exist')

      // confirm that properties tab isn't displaying the regular card properties
      cy.get('p').contains('Editing Card Properties').should('not.exist')
    })
  })
})
