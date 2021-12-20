import { render } from '@testing-library/react'
import { JourneyList } from '.'
import { defaultJourney, publishedJourney, oldJourney } from './journeyListData'

describe('JourneyList', () => {
  it.skip('should render journeys in descending createdAt date by default', () => {
    const { getAllByTestId } = render(
      <JourneyList journeys={[defaultJourney]} />
    )

    const journeyCards = getAllByTestId('journey-card')

    expect(journeyCards[0].textContent).toContain('Nov 22')
    expect(journeyCards[1].textContent).toContain('Nov 21')
    expect(journeyCards[2].textContent).toContain('Nov 20')
    expect(journeyCards[3].textContent).toContain('Nov 20th, 2020')
  })

  it.skip('should order journeys in alphabetical order', () => {
    const { getAllByTestId } = render(
      <JourneyList journeys={[defaultJourney]} />
    )

    const journeyCards = getAllByTestId('journey-card')

    // fireEvent - click around to sort by

    expect(journeyCards[0].textContent).toContain('Default Journey Heading')
    expect(journeyCards[1].textContent).toContain('Old Journey Heading')
    expect(journeyCards[2].textContent).toContain('Published Journey heading')
    expect(journeyCards[3].textContent).toContain('This heading is very')
  it('should render all journeys', () => {
    const { getAllByLabelText } = render(
      <JourneyList journeys={[defaultJourney, publishedJourney, oldJourney]} />
    )
    expect(getAllByLabelText('journey-card').length).toBe(3)
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
