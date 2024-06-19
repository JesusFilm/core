import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields } from '../../../../../../__generated__/JourneyFields'

import { AccessItem } from './AccessItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('AccessItem', () => {
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

  it('should open access item dialog', async () => {
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some Title'
    } as unknown as JourneyFields
    const { getByText, getByTestId, queryByTestId, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <AccessItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('Manage Access'))
    await waitFor(() => expect(getByTestId('AccessDialog')).toBeInTheDocument())
    expect(queryByRole('menuitem')).not.toBeInTheDocument()
    fireEvent.click(getByTestId('dialog-close-button'))
    await waitFor(() =>
      expect(queryByTestId('AccessDialog')).not.toBeInTheDocument()
    )
  })

  it('should render with access item dialog opened if manageAccess query params in true', async () => {
    const mockJourney: JourneyFields = {
      id: 'journeyId',
      title: 'Some Title'
    } as unknown as JourneyFields
    mockedUseRouter.mockReturnValue({
      query: { manageAccess: 'true' },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

    const { getByTestId, queryByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: mockJourney }}>
            <AccessItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(getByTestId('AccessDialog')).toBeInTheDocument())
    expect(queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('should handle helpscout params on click', async () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <AccessItem variant="menu-item" />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByText('Manage Access'))
    expect(push).toHaveBeenCalledWith(
      {
        query: { param: 'access' }
      },
      undefined,
      { shallow: true }
    )
  })
})
