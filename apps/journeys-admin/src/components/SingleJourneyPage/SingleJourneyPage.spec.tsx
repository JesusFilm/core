import { render } from '@testing-library/react'
import SingleJourneyPage from './SingleJourneyPage'
import { defaultJourney } from '../JourneyList/journeyListData'

describe('SingleJourneyPage', () => {
  it('should render all journeys', () => {
    render(<SingleJourneyPage journey={defaultJourney} />)
    // check number of journeys in list is correct
    // check id and order or journeys
  })
})
