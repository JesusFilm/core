import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import SingleJourneyPage from './SingleJourneyPage'
import { defaultJourney } from '../JourneyList/journeyListData'

describe('SingleJourneyPage', () => {
  it('should render all journeys', () => {
    render(
      <MockedProvider mocks={[]}>
        <SingleJourneyPage journey={defaultJourney} />
      </MockedProvider>
    )
    // check number of journeys in list is correct
    // check id and order or journeys
  })
})
