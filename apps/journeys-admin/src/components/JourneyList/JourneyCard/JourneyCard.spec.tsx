import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney } from '../journeyListData'

import { JourneyCard } from './JourneyCard'

describe('JourneyCard', () => {
  it('should have correct link on title', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      getByRole('link', { name: 'Default Journey Heading January 1, 2021' })
    ).toHaveAttribute('href', '/journeys/journey-id')
  })

  it('should disable after being clicked', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const link = getByRole('link', {
      name: 'Default Journey Heading January 1, 2021'
    })
    expect(link).toHaveStyle('pointer-events: auto')

    fireEvent.click(link)

    expect(link).toHaveStyle('pointer-events: none')
  })
})
