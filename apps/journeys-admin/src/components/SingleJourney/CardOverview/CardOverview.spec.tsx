import { render } from '@testing-library/react'
import { renderWithApolloClient } from '../../../../test/testingLibrary'

import CardOverview from './CardOverview'
import { steps, oneStep } from './CardOverviewData'

describe('CardOverview', () => {
  it('should render description for no cards', () => {
    const { getByText } = render(
      <CardOverview slug={'my-journey'} blocks={[]} />
    )
    expect(getByText('No cards')).toBeInTheDocument()
  })
  it('should render edit button when cards are present', () => {
    const { getByRole } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={steps} />
    )
    expect(getByRole('link', { name: 'Edit' })).toBeInTheDocument()
  })
  it('should render text for multiple cards', () => {
    const { getByText } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={steps} />
    )
    expect(getByText('5 cards')).toBeInTheDocument()
  })
  it('should render description for 1 card', () => {
    const { getByText } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={oneStep} />
    )
    expect(getByText('1 card')).toBeInTheDocument()
  })
  it('should render a card to add a card if there are no cards in the journey', () => {
    const { getByText } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={[]} />
    )
    expect(getByText('Add a Card')).toBeInTheDocument()
  })
})
