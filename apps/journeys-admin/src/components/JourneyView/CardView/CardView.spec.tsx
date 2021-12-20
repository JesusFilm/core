import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { CardView } from './CardView'
import { steps, oneStep } from './data'

describe('JourneyView/CardView', () => {
  it('should render description for no cards', () => {
    const { getByText } = render(<CardView slug={'my-journey'} blocks={[]} />)
    expect(getByText('No cards')).toBeInTheDocument()
  })
  it('should have edit button when cards are present', () => {
    const { getByRole } = render(
      <MockedProvider>
        <CardView slug="my-journey" blocks={steps} />
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/journeys/my-journey/edit'
    )
  })
  it('should render cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug={'my-journey'} blocks={steps} />
      </MockedProvider>
    )
    expect(getByText('5 cards')).toBeInTheDocument()
  })
  it('should render description for 1 card', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug={'my-journey'} blocks={oneStep} />
      </MockedProvider>
    )
    expect(getByText('1 card')).toBeInTheDocument()
  })
  it('should add a card when no cards are present', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug={'my-journey'} blocks={[]} />
      </MockedProvider>
    )
    expect(getByText('Add a Card')).toBeInTheDocument()
  })
})
