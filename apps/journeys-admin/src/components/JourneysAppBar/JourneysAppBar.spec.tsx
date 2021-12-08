import { render } from '@testing-library/react'
import { JourneyStatus } from '../../../__generated__/globalTypes'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import JourneysAppBar from '.'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const defaultJourney: Journey = {
      __typename: 'Journey',
      id: 'journey-id',
      title: 'Journey Heading',
      description: 'Description',
      slug: 'default',
      status: JourneyStatus.draft,
      createdAt: '2021-11-19T12:34:56.647Z',
      publishedAt: null,
      blocks: null
    }

    const { getByRole } = render(<JourneysAppBar journey={defaultJourney} />)
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
