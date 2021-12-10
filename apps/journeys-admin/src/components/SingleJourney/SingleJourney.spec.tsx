import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import SingleJourney from './SingleJourney'
import { publishedJourney } from '../JourneyList/journeyListData'

describe('SingleJourney', () => {
  it('should render Single Journey Page', () => {
    render(
      <MockedProvider mocks={[]}>
        <SingleJourney journey={publishedJourney} />
      </MockedProvider>
    )

    // TODO: Update with UI components when built
  })
})
