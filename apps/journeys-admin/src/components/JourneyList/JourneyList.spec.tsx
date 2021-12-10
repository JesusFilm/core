import { render } from '@testing-library/react'
import JourneyList from './JourneyList'
import { defaultJourney, publishedJourney, oldJourney } from './journeyListData'

describe('JourneyList', () => {
  it('should render all journeys', () => {
    const { getAllByRole } = render(
      <JourneyList journeys={[defaultJourney, publishedJourney, oldJourney]} />
    )
    expect(getAllByRole('heading').length).toBe(3)
  })
  it('should render text when there are no journeys', () => {
    const { getByText, getByRole } = render(<JourneyList journeys={[]} />)

    expect(getByText('No journeys to display.')).toBeInTheDocument()
    expect(
      getByText('Create a journey, then find it here.')
    ).toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('Create a Journey')
  })
})
