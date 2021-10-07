// import { getGreeting } from '../support/app.po'

describe('journeys', () => {
  beforeEach(() => cy.visit('/'))

  it('Should redirect to the first journey', () => {
    cy.contains('#FallingPlates').click()

    cy.url().should('include', 'c1fd3143-8a24-4031-a05f-e043cf8c4d21')
  })
})
