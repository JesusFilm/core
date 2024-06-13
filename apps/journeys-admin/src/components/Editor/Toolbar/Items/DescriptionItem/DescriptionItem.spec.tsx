import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { DescriptionItem } from './DescriptionItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('DescriptionItem', () => {
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

  it('should open description dialog', async () => {
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some Title'
    } as unknown as JourneyFields
    const { getByText, getByTestId, queryByTestId, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <DescriptionItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('Description'))
    await waitFor(() =>
      expect(getByTestId('DescriptionDialog')).toBeInTheDocument()
    )
    expect(queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(getByText('Cancel'))
    await waitFor(() =>
      expect(queryByTestId('DescriptionDialog')).not.toBeInTheDocument()
    )
  })

  it('should handle helpscout params on click', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <DescriptionItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('Description'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'description' }
      },
      undefined,
      { shallow: true }
    )
  })
})
