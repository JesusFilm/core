import { render } from '@testing-library/react'
import JourneyList from './JourneyList'
import { defaultJourney } from './journeyListData'

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
  })
})
