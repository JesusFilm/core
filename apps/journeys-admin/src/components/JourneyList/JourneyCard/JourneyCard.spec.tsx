import { render } from '@testing-library/react'
import { JourneyCard } from './JourneyCard'
import {
  publishedJourney,
  defaultJourney,
  oldJourney
} from '../journeyListData'

describe('JourneyCard', () => {
  it('should render the title', () => {
    const { getAllByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getAllByText('Published Journey Heading')[0]).toBeInTheDocument()
  })

  it('should render the formatted  date', () => {
    const { getByText } = render(<JourneyCard journey={defaultJourney} />)
    expect(getByText('Nov 19th')).toBeInTheDocument()
  })

  it('should render the description with the dash', () => {
    const { getByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getByText('Nov 19th - a published journey')).toBeInTheDocument()
  })

  it('should render the locale captialized', () => {
    const { getAllByText } = render(<JourneyCard journey={publishedJourney} />)
    expect(getAllByText('en-US')[0]).toBeInTheDocument()
  })

  it('should render the formated date with year if journey is created before the current year', () => {
    const { getAllByText } = render(<JourneyCard journey={oldJourney} />)
    expect(
      getAllByText(
        'Nov 19th, 2020 - Journey created before the current year should also show the year in the date'
      )[0]
    ).toBeInTheDocument()
  })

  it('should have correct link on title', () => {
    const { getByText } = render(<JourneyCard journey={defaultJourney} />)

    expect(getByText('Default Journey Heading')).toHaveAttribute(
      'href',
      '/journeys/default'
    )
  })
})
