import { render } from '@testing-library/react'
import { renderWithApolloClient } from '../../../../test/testingLibrary'

import CardOverview from './CardOverview'
import { steps, oneStep } from './CardOverviewData'

describe('CardOverview', () => {
  it('should render description for no cards', () => {
    const { getByText } = render(<CardOverview slug={'my-journey'} />)
    expect(getByText('No cards in this journey')).toBeInTheDocument()
  })
  it('should have edit button when cards are present', () => {
    const { getByRole } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={steps} />
    )
    expect(getByRole('link', { name: 'Edit' })).toBeInTheDocument()
  })
  it('should have for multiple cards', () => {
    const { getByText } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={steps} />
    )
    expect(getByText('5 cards')).toBeInTheDocument()
  })
  it('should redner description for 1 card', () => {
    const { getByText } = renderWithApolloClient(
      <CardOverview slug={'my-journey'} blocks={oneStep} />
    )
    expect(getByText('1 card')).toBeInTheDocument()
  })
})
