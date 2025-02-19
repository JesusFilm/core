import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'

import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney } from '../journeyListData'

import { JourneyCard } from './JourneyCard'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

const mockUseNavigationState = useNavigationState as jest.MockedFunction<
  typeof useNavigationState
>

describe('JourneyCard', () => {
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

  it('should disabled card when navigating', () => {
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
