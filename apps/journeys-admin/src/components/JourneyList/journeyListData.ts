import { formatISO, startOfYear } from 'date-fns'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import {
  ThemeName,
  ThemeMode,
  JourneyStatus
} from '../../../__generated__/globalTypes'

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title: 'Default Journey Heading',
  description: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  locale: 'en-US',
  createdAt: formatISO(startOfYear(new Date())),
  publishedAt: null,
  status: JourneyStatus.draft,
  userJourneys: [
    {
      __typename: 'UserJourney',
      id: 'user-journey-id',
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
      user: {
        __typename: 'User',
        id: 'user-id3',
        firstName: 'Coral',
        lastName: 'Three',
        imageUrl: 'https://bit.ly/3nlwUwJ'
      }
    }
  ]
}

export const oldJourney: Journey = {
  ...defaultJourney,
  id: 'old-journey-id',
  title: 'An Old Journey Heading',
  description:
    'Journey created before the current year should also show the year in the date',
  createdAt: '2020-11-19T12:34:56.647Z',
  publishedAt: '2020-12-19T12:34:56.647Z',
  status: JourneyStatus.published
}

export const publishedJourney: Journey = {
  ...defaultJourney,
  id: 'published-journey-id',
  title: 'Published Journey Heading',
  description: 'a published journey',
  publishedAt: formatISO(startOfYear(new Date())),
  status: JourneyStatus.published
}

export const descriptiveJourney: Journey = {
  ...defaultJourney,
  title:
    'This heading is very long so that we can test out the wrapping of the title on the card, by default this should be no longer than 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  description:
    'This description is also very very long for the purpose of testing out text wrapping which also should restricted to 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  locale: 'zh-Hans'
}

export const resultData = {
  journeyCreate: {
    createdAt: '2022-02-17T21:47:32.004Z',
    description:
      'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
    id: '4d568fca-4b30-4886-a284-96ee9ea73e21',
    locale: 'en-US',
    publishedAt: null,
    slug: 'untitled-journey-4d568fca-4b30-4886-a284-96ee9ea73e21',
    status: 'draft',
    themeMode: 'light',
    themeName: 'base',
    title: 'Untitled Journey'
  },
  stepBlockCreate: {
    id: '272e6b14-1ae3-43a8-9ecc-47cf5a1ee95e',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 0,
    __typename: 'StepBlock'
  },
  cardBlockCreate: {
    backgroundColor: null,
    coverBlockId: '7b541060-e80c-4c0a-ab60-f4c8cadb6c43',
    fullscreen: false,
    id: 'a007921f-d01b-42d1-94a1-ae7740e446e5',
    parentBlockId: '272e6b14-1ae3-43a8-9ecc-47cf5a1ee95e',
    parentOrder: 0,
    themeMode: null,
    themeName: null,
    __typename: 'CardBlock'
  },
  imageBLockCreate: {
    alt: 'two hot air balloons in the sky',
    blurhash: 'UhFr#f59PC=r{@E3XTxWjGngs7NeslWCskRk',
    height: 1559,
    id: '7b541060-e80c-4c0a-ab60-f4c8cadb6c43',
    parentBlockId: 'a007921f-d01b-42d1-94a1-ae7740e446e5',
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2348&q=80',
    width: 2348,
    __typename: 'ImageBlock'
  },
  headlineTypography: {
    align: null,
    color: null,
    content: 'The Journey Is On',
    id: '1b47acd8-4307-48ac-8532-e816769d8552',
    parentBlockId: 'a007921f-d01b-42d1-94a1-ae7740e446e5',
    parentOrder: 1,
    variant: 'h3',
    __typename: 'TypographyBlock'
  },
  bodyTypography: {
    align: null,
    color: null,
    content: '"Go, and lead the people on their way..."',
    id: 'd5d21837-0505-44d1-9969-6946d303114f',
    parentBlockId: 'a007921f-d01b-42d1-94a1-ae7740e446e5',
    parentOrder: 2,
    variant: 'body1',
    __typename: 'TypographyBlock'
  },
  captionTypography: {
    align: null,
    color: null,
    content: 'Deutoronomy 10:11',
    id: 'f2ad1086-0f89-44dd-ad94-77abcb8647bd',
    parentBlockId: 'a007921f-d01b-42d1-94a1-ae7740e446e5',
    parentOrder: 3,
    variant: 'caption',
    __typename: 'TypographyBlock'
  }
}
