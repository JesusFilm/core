import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { JourneyStatus } from '../../../__generated__/globalTypes'

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title: 'Journey Heading',
  description: 'Description',
  slug: 'default',
  locale: 'en-US',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: null
}
