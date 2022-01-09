import { render } from '@testing-library/react'
import { JourneyCard } from './JourneyCard'
import {
  publishedJourney,
  defaultJourney,
  oldJourney
} from '../journeyListData'

describe('JourneyCard', () => {
  it('should render the title', () => {
    const { getByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
  })

  it('should render the formatted  date', () => {
    const { getByText } = render(<JourneyCard journey={defaultJourney} />)
    expect(getByText('January 1')).toBeInTheDocument()
  })

  it('should render the description with the dash', () => {
    const { getByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getByText('January 1 - a published journey')).toBeInTheDocument()
  })

  it('should render the locale captialized', () => {
    const { getByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getByText('en-US')).toBeInTheDocument()
  })

  it('should render the formated date with year if journey is created before the current year', () => {
    const { getByText } = render(<JourneyCard journey={oldJourney} />)
    expect(
      getByText(
        'November 19, 2020 - Journey created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
  })

  it('should have correct link on title', () => {
    const { getByText } = render(<JourneyCard journey={defaultJourney} />)

    expect(
      getByText('Default Journey Heading').parentElement?.parentElement
    ).toHaveAttribute('href', '/journeys/default')
  })
})
