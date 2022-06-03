// End to end test of adding and deleting a typography block to a card on the journey
describe('fact-or-fiction adding and deleting a block', () => {
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
  const blocksButton = '#control-panel-tab-2'
  it('navigates to the 6th card', () => {
    // cards tab should be selected
    cy.get(cardsButton)
      .contains('Cards')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
    // on the panel of cards, click on a card 6
    cy.get(cardsPanel)
      .children()
      .eq(5)
      .within(() => {
        cy.get('.css-qbettr').should('exist').click()
      })

    // properties tab should now be selected
    cy.get(propertiesButton)
      .contains('Properties')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })
  // gets iframe for 6th card, checks that it doesn't contain a new typography block
  it('gets iframe for card 6, checks that it does not contain a new typography block', () => {
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
              cy.contains('Add your text here...').should('not.exist')
            })
        })
    })
  })
  // click add button
  it('click add button', () => {
    // find and click add button
    cy.get('button').contains('Add').should('exist').click()
    // blocks tab should now be selected
    cy.get(blocksButton)
      .contains('Blocks')
      .should('exist')
      .should('have.attr', 'aria-selected', 'true')
  })

  // add typography block
  const blocksPanel = '#control-panel-tabpanel-2'
  it('should click on text button to add typography block', () => {
    // in the blocks panel, click on the Text block
    cy.get(blocksPanel).within(() => {
      cy.get('button').contains('Text').should('exist').click()
    })
    // check new typography block exists on card
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
              // check new typography block exists
              cy.get('p').contains('Add your text here...').should('exist')
              // check this typography block is now selected
              cy.get('p')
                .contains('Add your text here...')
                .parent()
                .should('have.class', 'iframe-1cmixpt') // this property means the typography block is selected
            })
        })
    })
  })
  // find and click the delete block button
  it('deletes the newly added block', () => {
    // clicks delete button
    cy.get('[data-testid=DeleteOutlineRoundedIcon]').click()
    // check that typography block no longer exists
    cy.get('.swiper-slide-active').within(() => {
      cy.get(`[data-testid^="step-"]`)
        .should('exist')
        .within(() => {
          cy.get('iframe')
            .its('0.contentDocument.body')
            .should('not.be.empty')
            .then(cy.wrap)
            .within(() => {
              cy.contains('Add your text here...').should('not.exist')
            })
        })
    })
  })
})
