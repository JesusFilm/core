import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'

import CardOverview from './CardOverview'
import { steps, oneStep } from './CardOverviewData'

describe('CardOverview', () => {
  it('should render description for no cards', () => {
    const { getByText } = render(
      <CardOverview slug={'my-journey'} blocks={[]} />
    )
    expect(getByText('No cards')).toBeInTheDocument()
  })
  it('should have edit button when cards are present', () => {
    const { getByRole } = render(
      <MockedProvider>
        <CardOverview slug={'my-journey'} blocks={steps} />
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toBeInTheDocument()
  })
  it('should have for multiple cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardOverview slug={'my-journey'} blocks={steps} />
      </MockedProvider>
    )
    expect(getByText('5 cards')).toBeInTheDocument()
  })
  it('should redner description for 1 card', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardOverview slug={'my-journey'} blocks={oneStep} />
      </MockedProvider>
    )
    expect(getByText('1 card')).toBeInTheDocument()
  })
  it('should render a card to add a card if there are no cards in the journey', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardOverview slug={'my-journey'} blocks={[]} />
      </MockedProvider>
    )
    expect(getByText('Add a Card')).toBeInTheDocument()
  })
})
