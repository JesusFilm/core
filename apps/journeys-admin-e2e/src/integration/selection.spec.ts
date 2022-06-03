// end to end test for selecting different buttons/elements in the editor, and esuring
// the correct info is being displayed
describe('fact-or-fiction selecting', () => {
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
  const cardsPanel = '[data-testid=horizontal-select]'
  const cardsButton = '#control-panel-tab-0'
  const propertiesButton = '#control-panel-tab-1'
  it('should switch to properties tab when a card is clicked', () => {
    // cards tab should be selected
    cy.get(cardsButton)
      .contains('Cards')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
    // on the panel of cards, click on a card 3
    cy.get(cardsPanel)
      .children()
      .eq(2)
      .within(() => {
        cy.get('.css-qbettr').should('exist').click()
      })
    // TODO: doesn't work, need to get element within and click that instead
    // // properties tab should now be selected
    cy.get(propertiesButton)
      .contains('Properties')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })
  it('navigates back to the cards tab', () => {
    // navigate back to cards tab
    cy.get(cardsButton).contains('Cards').click()
    // cards tab should be selected
    cy.get(cardsButton)
      .contains('Cards')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })
  // // inner iframe MuiBox-root iframe-1bh9mr5
  it('gets iframe for card 3, clicks on the block', () => {
    cy.get('.swiper-slide-active').within(() => {
      cy.get(`[data-testid^="step-"]`)
        .should('exist')
        .within(() => {
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
        })
    })
  })
  it('should switch to block properties when a block on the card is clicked', () => {
    // properties tab should now be selected
    cy.get(propertiesButton)
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
