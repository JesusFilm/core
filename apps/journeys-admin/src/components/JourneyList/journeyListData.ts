import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title: 'Journey Heading',
  description: 'Description',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  locale: 'en_US',
  createdAt: '2020-12-25T12:34:56.647Z',
  publishedAt: null,
  status: null
}
