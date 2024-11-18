import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney } from '../journeyListData'
import { JourneyCard } from './JourneyCard'
import { useNavigationState } from '@core/journeys/ui/useNavigationState'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  __esModule: true,
  useNavigationState: jest.fn()
}))

const mockUseNavigationState = useNavigationState as jest.MockedFunction<
  typeof useNavigationState
>

describe('JourneyCard', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should have correct link on title', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.getByRole('link', {
        name: 'Default Journey Heading January 1, 2021'
      })
    ).toHaveAttribute('href', '/journeys/journey-id')
  })

  it('should disable card interaction after initial click to prevent multiple navigations', () => {
    mockUseNavigationState.mockReturnValue(true)

    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const link = screen.getByRole('link', {
      name: 'Default Journey Heading January 1, 2021'
    })
    expect(link).toHaveClass('Mui-disabled')
  })
})
