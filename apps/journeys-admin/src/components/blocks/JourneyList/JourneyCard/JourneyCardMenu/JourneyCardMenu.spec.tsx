import { render } from '@testing-library/react'
import { defaultJourney } from '../journeyListData
import JourneyCardMenu from '.'

describe('JourneyCardMenu', () => {
  it('should render JourneyCardMenu', () => {
    const { getAllByText } = render(<JourneyCardMenu />)
    // Check
    expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
