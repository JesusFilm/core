import { render } from '@testing-library/react'
import { JourneyCard } from './JourneyCard'
import { defaultJourney } from '../journeyListData'

describe('JourneyCard', () => {
  it('should render Journey Card', () => {
    const { getAllByText } = render(<JourneyCard journey={defaultJourney} />)
    // Check elements display with correct values
    expect(getAllByText('Journey Heading')[0]).toBeInTheDocument()
  })
})
