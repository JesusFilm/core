import { render } from '@testing-library/react'
import JourneyListCard from './JourneyListCard'
import { defaultJourney } from '../journeyListData'

describe('JourneyListCard', () => {
  it('should render Journey List Card', () => {
    const { getAllByText } = render(
      <JourneyListCard journey={defaultJourney} />
    )
    // check number of journeys in list is correct
    // check id and order or journeys
    expect(getAllByText('Heading')[0]).toBeInTheDocument()
  })
})
