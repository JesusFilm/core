import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  defaultJourney,
  publishedLocalTemplate
} from '@core/journeys/ui/TemplateView/data'

import { ThemeProvider } from '../../../../ThemeProvider'

import { DetailsItem } from './DetailsItem'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
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

  it('opens LocalTemplateDetailsDialog and sets templateDetails param for a local template', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <ThemeProvider>
            <JourneyProvider value={{ journey: publishedLocalTemplate }}>
              <DetailsItem variant="menu-item" />
            </JourneyProvider>
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Edit Details'))
    expect(push).toHaveBeenCalledWith(
      { query: { param: 'templateDetails' } },
      undefined,
      { shallow: true }
    )
    await waitFor(() =>
      expect(
        screen.getByTestId('LocalTemplateDetailsDialog')
      ).toBeInTheDocument()
    )
    expect(screen.queryByTestId('JourneyDetailsDialog')).not.toBeInTheDocument()
  })
})
