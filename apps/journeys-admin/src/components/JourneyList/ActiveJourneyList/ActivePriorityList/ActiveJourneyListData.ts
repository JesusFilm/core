import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../../../__generated__/globalTypes'

const ownerUserJourney: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourney1.id',
  role: UserJourneyRole.owner,
  openedAt: '2021-01-01T00:00:00Z',
  user: {
    __typename: 'User',
    id: 'user1.id',
    firstName: 'One',
    lastName: 'LastName',
    imageUrl: null
  }
}

const editorUserJourney: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourney2.id',
  role: UserJourneyRole.editor,
  openedAt: '2022-01-01T00:00:00Z',
  user: {
    __typename: 'User',
    id: 'user2.id',
    firstName: 'Two',
    lastName: 'LastName',
    imageUrl: null
  }
}

const newUserJourney: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourney3.id',
  role: UserJourneyRole.inviteRequested,
  openedAt: null,
  user: {
    __typename: 'User',
    id: 'user3.id',
    firstName: 'Three',
    lastName: 'LastName',
    imageUrl: null
  }
}

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey1.id',
  title: 'Default Journey Heading',
  description: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  language: {
    __typename: 'Language',
    id: '529',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  updatedAt: '2020-02-01T00:00:00Z',
  createdAt: '2020-02-01T00:00:00Z',
  publishedAt: null,
  status: JourneyStatus.draft,
  seoTitle: null,
  seoDescription: null,
  userJourneys: [ownerUserJourney, editorUserJourney],
  trashedAt: null,
  template: false,
  primaryImageBlock: null,
  fromTemplateId: null
}

export const journey: Journey = {
  ...defaultJourney,
  id: 'journey2.id',
  title: 'A Journey for title sort'
}

export const newJourney: Journey = {
  ...defaultJourney,
  id: 'journey3.id',
  title: 'New Journey',
  createdAt: '2020-01-01T00:00:00Z',
  userJourneys: [
    { ...ownerUserJourney, openedAt: null },
    { ...editorUserJourney, openedAt: null }
  ]
}

export const pendingActionJourney: Journey = {
  ...defaultJourney,
  id: 'journey4.id',
  title: 'Pending Action Journey',
  userJourneys: [ownerUserJourney, newUserJourney, editorUserJourney]
}

export const journeyWithLongTitle: Journey = {
  ...defaultJourney,
  id: 'journey5.id',
  title:
    'This is a journey with an extremely long title that should be wrapped to two lines and then truncated with the ellipsis'
}
