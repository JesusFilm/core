import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { DetailsItem } from './DetailsItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DetailsItem', () => {
  const push = jest.fn()
  const on = jest.fn()

  beforeEach(() => {
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
    jest.clearAllMocks()
  })

  it('should open journey details dialog', async () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <DetailsItem variant="menu-item" />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Edit Details'))
    await waitFor(() =>
      expect(screen.getByTestId('JourneyDetailsDialog')).toBeInTheDocument()
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('JourneyDetailsDialog')
      ).not.toBeInTheDocument()
    )
  })

  it('should handle helpscout params on click', async () => {
    render(<DetailsItem variant="menu-item" />)

    fireEvent.click(screen.getByText('Edit Details'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'journeyDetails' }
      },
      undefined,
      { shallow: true }
    )
  })
})
