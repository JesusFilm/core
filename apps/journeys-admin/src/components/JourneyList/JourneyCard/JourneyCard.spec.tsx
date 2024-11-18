import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney } from '../journeyListData'

import { JourneyCard } from './JourneyCard'

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
