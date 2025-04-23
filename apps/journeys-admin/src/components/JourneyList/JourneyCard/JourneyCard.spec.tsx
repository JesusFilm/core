import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'

import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney, fakeDate, journeyWithImage } from '../journeyListData'

import { JourneyCard } from './JourneyCard'
import { JourneyCardVariant } from './journeyCardVariant'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

const mockUseNavigationState = useNavigationState as jest.MockedFunction<
  typeof useNavigationState
>

describe('JourneyCard', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
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
        name: 'Default Journey Heading English • 11 months ago'
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
      name: 'Default Journey Heading English • 11 months ago'
    })
    expect(link).toHaveClass('Mui-disabled')
  })

  it('should show Image element when primaryImageBlock.src exists', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={journeyWithImage} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByRole('img', { name: 'Test Social Media Image' })).toBeInTheDocument()
  })

  it('should not show Image element when primaryImageBlock.src is null', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.queryByTestId('JourneyCard-Image')).not.toBeInTheDocument()
  })

  it('should show "New" chip for new journey card variant', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} variant={JourneyCardVariant.new} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByTestId('new-journey-badge')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })
})
