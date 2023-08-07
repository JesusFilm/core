import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
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
      getByRole('link', { name: 'Default Journey Heading January 1' })
    ).toHaveAttribute('href', '/journeys/journey-id')
  })
})
