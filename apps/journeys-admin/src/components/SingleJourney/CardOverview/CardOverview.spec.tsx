import { render } from '@testing-library/react'
import { renderWithApolloClient } from '../../../../test/testingLibrary'

import CardOverview from './CardOverview'
import { steps } from './CardOverviewData'

describe('CardOverview', () => {
  describe('with no cards', () => {
    it('should render add button', () => {
      const { getByRole } = render(<CardOverview slug={'my-journey'} />)
      expect(getByRole('link')).toBeInTheDocument()
      expect(getByRole('link')).toHaveAttribute(
        'href',
        '/journeys/my-journey/create_PLACEHOLDER'
      )
    })
    it('should render text describing no cards', () => {
      const { getByText } = render(<CardOverview slug={'my-journey'} />)
      expect(getByText('Add')).toBeInTheDocument()
    })
  })
  describe('with cards', () => {
    it('should have edit button', () => {
      const { getByRole } = renderWithApolloClient(
        <CardOverview slug={'my-journey'} blocks={steps} />
      )
      expect(getByRole('link', { name: 'Edit' })).toBeInTheDocument()
    })
    it('should have text on how many cards present in journey', () => {
      // expect text to be present
      const { getByText } = renderWithApolloClient(
        <CardOverview slug={'my-journey'} blocks={steps} />
      )
      expect(getByText('5 cards in this journey')).toBeInTheDocument()
    })
  })
})
