import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title: 'Journey Heading',
  description: 'Description',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  locale: 'en_US',
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  status: JourneyStatus.draft
}

export const publishedJourney: Journey = {
  ...defaultJourney,
  title: 'Published Journey Heading',
  description: 'a published journey',
  publishedAt: new Date('2021-12-19T12:34:56.647Z'),
  status: JourneyStatus.published
}
