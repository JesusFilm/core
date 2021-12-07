import { render } from '@testing-library/react'
import JourneyList from './JourneyList'
import { defaultJourney } from './journeyListData'

describe('JourneyList', () => {
  it('should render all journeys', () => {
    render(<JourneyList journeys={[defaultJourney]} />)
    // check number of journeys in list is correct
    // check id and order or journeys
  })
})
