// End to end test of adding a block to a card on the journey
describe('fact-or-fiction adding', () => {
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

  const card6 = 'c7721ae1-f2d2-4a09-b4f6-fcf230c107e9'
  const cardsPanel = 'control-panel-tabpanel-0'
  it('navigates to the 6th card', () => {
    // on the panel of cards, click on a card 6
    cy.get(`[id="${cardsPanel}"]`).within(() => {
      cy.get(`[id="${card6}"]`).click({ force: true }) // error: needs force:true because there is another element covering it
    })
    // properties tab should now be selected
    cy.get('button[role="tab"]')
      .contains('Properties')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  // gets iframe for 6th card, checks that it doesn't contain a new text block

  it('gets iframe for card 6, checks that it does not contain a new text block', () => {
    const displayedCard = 'step-' + card6
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
            .should('not.exist')
            .click()
        })
    })
  })

  // click on blocks tab
  it('click on blocks tab', () => {
    // navigate back to cards tab
    cy.get('button[role="tab"]').contains('Blocks').click()
    // cards tab should be selected
    cy.get('button[role="tab"]')
      .contains('Blocks')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  const blocksPanel = 'control-panel-tabpanel-2'
  it('should click on text button to add typography block', () => {
    cy.get(`[id="${blocksPanel}"]`).within(() => {
      cy.get('button').contains('Text').click()
    })
  })
})
