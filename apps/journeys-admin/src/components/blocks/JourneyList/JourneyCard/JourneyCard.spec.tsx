import { render } from '@testing-library/react'
import JourneyListCard from './JourneyListCard'
import { defaultJourney } from '../journeyListData'

describe('JourneyCard', () => {
  it('should render Journey Card', () => {
    const { getAllByText } = render(
      <JourneyListCard journey={defaultJourney} />
    )
    // Check
    expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
