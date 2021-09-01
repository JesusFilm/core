import { getGreeting } from '../support/app.po'

describe('journeys', () => {
  beforeEach(() => cy.visit('/'))

  it('should display welcome message', () => {
    getGreeting().contains('Block renderer and conductor samples')
  })
})
