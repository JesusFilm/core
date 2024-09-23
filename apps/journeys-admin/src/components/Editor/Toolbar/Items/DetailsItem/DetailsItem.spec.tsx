import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

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

  it('should open title description dialog', async () => {
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some title',
      description: 'Some description'
    } as unknown as JourneyFields
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: mockJourney }}>
          <DetailsItem variant="menu-item" />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Edit Details'))
    await waitFor(() =>
      expect(screen.getByTestId('TitleDescriptionDialog')).toBeInTheDocument()
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() =>
      expect(
        screen.queryByTestId('TitleDescriptionDialog')
      ).not.toBeInTheDocument()
    )
  })

  it('should handle helpscout params on click', async () => {
    render(<DetailsItem variant="menu-item" />)

    fireEvent.click(screen.getByText('Edit Details'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'titleDescription' }
      },
      undefined,
      { shallow: true }
    )
  })
})
