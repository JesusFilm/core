import { render, fireEvent } from '@testing-library/react'
import { defaultJourney, publishedJourney, oldJourney } from './journeyListData'
import { JourneyList } from '.'

describe('JourneyList', () => {
  it('should render journeys in descending createdAt date by default', () => {
    const { getAllByLabelText } = render(
      <JourneyList journeys={[defaultJourney, oldJourney]} />
    )

    const journeyCards = getAllByLabelText('journey-card')

    expect(journeyCards[0].textContent).toContain('January 1')
    expect(journeyCards[1].textContent).toContain('November 19, 2020')
  })

  it('should order journeys in alphabetical order', () => {
    const { getAllByLabelText, getByRole } = render(
      <JourneyList journeys={[defaultJourney, oldJourney]} />
    )

    const journeyCards = getAllByLabelText('journey-card')

    fireEvent.click(getByRole('button', { name: 'Sort By' }))
    fireEvent.click(getByRole('radio', { name: 'Name' }))

    expect(journeyCards[0].textContent).toContain('An Old Journey Heading')
    expect(journeyCards[1].textContent).toContain('Default Journey Heading')
  })

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
    expect(
      getByRole('button', { name: 'Create a Journey' })
    ).toBeInTheDocument()
  })
})
