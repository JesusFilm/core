import { formatISO, startOfYear } from 'date-fns'

import {
  GetAdminJourneys_journeys_userJourneys as ApiUser,
  GetAdminJourneys_journeys as Journey
} from '../../../__generated__/GetAdminJourneys'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'

export const fakeDate = '2021-12-11'

const userJourneys: ApiUser[] = [
  {
    __typename: 'UserJourney',
    id: 'user-journey-id',
    role: UserJourneyRole.owner,
    openedAt: null,
    user: {
      __typename: 'User',
      id: 'user-id1',
      firstName: 'Amin',
      lastName: 'One',
      imageUrl: 'https://bit.ly/3Gth4Yf'
    }
  },
  {
    __typename: 'UserJourney',
    id: 'user-journey-id2',
    role: UserJourneyRole.editor,
    openedAt: null,
    user: {
      __typename: 'User',
      id: 'user-id2',
      firstName: 'Horace',
      lastName: 'Two',
      imageUrl: 'https://bit.ly/3rgHd6a'
    }
  },
  {
    __typename: 'UserJourney',
    id: 'user-journey-id3',
    role: UserJourneyRole.editor,
    openedAt: null,
    user: {
      __typename: 'User',
      id: 'user-id3',
      firstName: 'Coral',
      lastName: 'Three',
      imageUrl: 'https://bit.ly/3nlwUwJ'
    }
  }
]

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
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
  updatedAt: formatISO(startOfYear(new Date(fakeDate))),
  createdAt: formatISO(startOfYear(new Date(fakeDate))),
  publishedAt: null,
  status: JourneyStatus.draft,
  seoTitle: null,
  seoDescription: null,
  userJourneys,
  trashedAt: null,
  template: false,
  primaryImageBlock: null,
  fromTemplateId: null
}

export const journeyWithImage: Journey = {
  ...defaultJourney,
  primaryImageBlock: {
    __typename: 'ImageBlock',
    id: 'image-id',
    parentBlockId: null,
    parentOrder: 1,
    src: 'https://example.com/image.jpg',
    alt: 'Test Social Media Image',
    width: 1920,
    height: 1080,
    blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj'
  }
}

export const oldJourney: Journey = {
  ...defaultJourney,
  id: 'old-journey-id',
  title: 'An Old Journey Heading',
  description:
    'Journey created before the current year should also show the year in the date',
  updatedAt: '2020-11-19T12:34:56.647Z',
  createdAt: '2020-11-19T12:34:56.647Z',
  publishedAt: '2020-12-19T12:34:56.647Z',
  status: JourneyStatus.published
}

export const publishedJourney: Journey = {
  ...defaultJourney,
  id: 'published-journey-id',
  title: 'Published Journey Heading',
  description: 'a published journey',
  publishedAt: formatISO(startOfYear(new Date(fakeDate))),
  status: JourneyStatus.published
}

export const descriptiveJourney: Journey = {
  ...defaultJourney,
  id: 'descriptive-journey-id',
  title:
    'This heading is very long so that we can test out the wrapping of the title on the card, by default this should be no longer than 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  description:
    'This description is also very very long for the purpose of testing out text wrapping which also should restricted to 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  language: {
    __typename: 'Language',
    id: '20615',
    name: [
      {
        __typename: 'LanguageName',
        value: '普通話',
        primary: true
      },
      {
        __typename: 'LanguageName',
        value: 'Chinese, Mandarin',
        primary: false
      }
    ]
  },
  userJourneys: [
    ...userJourneys,
    {
      __typename: 'UserJourney',
      id: 'user-journey-id4',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user-id4',
        firstName: 'Box',
        lastName: 'Four',
        imageUrl: 'https://shorturl.at/itLUY'
      }
    },
    {
      __typename: 'UserJourney',
      id: 'user-journey-id5',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user-id5',
        firstName: 'John',
        lastName: 'Five',
        imageUrl: 'https://shorturl.at/mEMU8'
      }
    },
    {
      __typename: 'UserJourney',
      id: 'user-journey-id6',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user-id6',
        firstName: 'Jane',
        lastName: 'Six',
        imageUrl: 'https://shorturl.at/fhjmK'
      }
    },
    {
      __typename: 'UserJourney',
      id: 'user-journey-id7',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        __typename: 'User',
        id: 'user-id7',
        firstName: 'Jannet',
        lastName: 'Seven',
        imageUrl: 'https://shorturl.at/qsH49'
      }
    }
  ]
}

export const archiveddJourney: Journey = {
  ...defaultJourney,
  id: 'archived-journey-id',
  title: 'Archived Journey Heading',
  description: 'a archived journey',
  status: JourneyStatus.archived
}

export const trashedJourney: Journey = {
  ...defaultJourney,
  id: 'rashed-journey-id',
  title: 'Trashed Journey Heading',
  description: 'a trashed journey',
  status: JourneyStatus.trashed
}
