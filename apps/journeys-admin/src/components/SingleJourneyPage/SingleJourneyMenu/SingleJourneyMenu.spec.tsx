import { render } from '@testing-library/react'
import SingleJourneyMenu from '.'
import { defaultJourney } from '../../JourneyList/journeyListData'

describe('SingleJourneyMenu', () => {
  it('should open menu on click', () => {
    // render(<SingleJourneyMenu journey={defaultJourney} />)
    // check all 4 aria props :
    // aria-expanded, aria-labelledby aria-controls, aria-haspopup
  })
  it('should publish journey', () => {
    // const { getAllByText } = render(<SingleJourneyMenu />)
    // check correct gql mutation triggered
  })
  it('should handle edit journey title', () => {
    // const { getAllByText } = render(<SingleJourneyMenu />)
    // check correct dialog opens
  })
  it('should handle edit journey description', () => {
    // const { getAllByText } = render(<SingleJourneyMenu />)
    // check correct dialog opens
  })

  it('should handle changing journey access', () => {
    // const { getAllByText } = render(<SingleJourneyMenu />)
    // check correct action triggered
  })
  it('should handle copy url', () => {
    // const { getAllByText } = render(<SingleJourneyMenu />)
    // check correct alert opens
  })
})
