import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { NextRouter, useRouter } from 'next/router'
import { CardView } from './CardView'
import { steps, oneStep } from './data'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyView/CardView', () => {
  it('should render cards', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug="my-journey" blocks={steps} />
      </MockedProvider>
    )
    expect(getByText('5 cards in this journey')).toBeInTheDocument()
  })
  it('should render description for 1 card', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug="my-journey" blocks={oneStep} />
      </MockedProvider>
    )
    expect(getByText('1 card in this journey')).toBeInTheDocument()
  })

  it('should render description when no cards are present', () => {
    const { getByText } = render(
      <MockedProvider>
        <CardView slug="my-journey" blocks={[]} />
      </MockedProvider>
    )
    expect(getByText('Select Empty Card to add')).toBeInTheDocument()
  })

  it('should navigate to edit page when adding new card', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)
    const { getByTestId } = render(
      <MockedProvider>
        <CardView slug="my-journey" blocks={steps} />
      </MockedProvider>
    )
    fireEvent.click(getByTestId('preview-step0.id'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith({
        pathname: '/journeys/[slug]/edit',
        query: { slug: 'my-journey', stepId: 'step0.id' }
      })
    )
  })
})
