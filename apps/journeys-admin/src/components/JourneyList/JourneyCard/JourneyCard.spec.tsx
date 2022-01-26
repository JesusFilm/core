import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { ThemeProvider } from '../../ThemeProvider'
import {
  publishedJourney,
  defaultJourney,
  oldJourney
} from '../journeyListData'
import { JourneyCard } from './JourneyCard'

describe('JourneyCard', () => {
  it('should render the title', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={publishedJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
  })

  it('should render the formatted  date', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={defaultJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('January 1')).toBeInTheDocument()
  })

  it('should render the description with the dash', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={publishedJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('January 1 - a published journey')).toBeInTheDocument()
  })

  it('should render the locale captialized', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={publishedJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('en-US')).toBeInTheDocument()
  })

  it('should render the formated date with year if journey is created before the current year', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={oldJourney} />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(
      getByText(
        'November 19, 2020 - Journey created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
  })

  it('should have correct link on title', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCard journey={defaultJourney} />
        </ThemeProvider>
      </MockedProvider>
    )

    expect(
      getByText('Default Journey Heading').parentElement?.parentElement
    ).toHaveAttribute('href', '/journeys/default')
  })
})
