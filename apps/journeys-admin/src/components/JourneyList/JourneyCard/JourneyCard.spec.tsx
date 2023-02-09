import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney } from '../journeyListData'
import { JourneyCard } from './JourneyCard'

describe('JourneyCard', () => {
  it('should have correct link on title', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <ThemeProvider>
            <JourneyCard journey={defaultJourney} />
          </ThemeProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      getByText('Default Journey Heading').parentElement?.parentElement
    ).toHaveAttribute('href', '/journeys/journey-id')
  })
})
