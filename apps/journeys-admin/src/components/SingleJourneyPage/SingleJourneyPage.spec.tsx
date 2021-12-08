import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import SingleJourneyPage from './SingleJourneyPage'
import { publishedJourney } from '../JourneyList/journeyListData'

describe('SingleJourneyPage', () => {
  it('should render Single Journey Page', () => {
    render(
      <MockedProvider mocks={[]}>
        <SingleJourneyPage journey={publishedJourney} />
      </MockedProvider>
    )

    // TODO: Update with UI components when built
  })
})
