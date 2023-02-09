import { render } from '@testing-library/react'
import {
  defaultJourney,
  publishedJourney,
  oldJourney
} from '../../journeyListData'
import { JourneyCardText } from '.'

describe('JourneyCardText', () => {
  it('should show title', () => {
    const { getByText } = render(<JourneyCardText journey={publishedJourney} />)
    expect(getByText('Published Journey Heading')).toBeInTheDocument()
  })

  it('should show description with a dash', () => {
    const { getByText } = render(<JourneyCardText journey={publishedJourney} />)
    expect(getByText('January 1 - a published journey')).toBeInTheDocument()
  })

  it('should show formatted date', () => {
    const { getByText } = render(<JourneyCardText journey={defaultJourney} />)
    expect(getByText('January 1')).toBeInTheDocument()
  })

  it('should show date with year if journey is created before the current year', () => {
    const { getByText } = render(<JourneyCardText journey={oldJourney} />)
    expect(
      getByText(
        'November 19, 2020 - Journey created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
  })
})
