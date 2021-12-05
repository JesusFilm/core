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
  locale: 'en_US',
  createdAt: new Date('2021-11-19T12:34:56.647Z'),
  publishedAt: null,
  status: JourneyStatus.draft
}

export const oldJourney: Journey = {
  ...defaultJourney,
  title: 'Old Journey Heading',
  description:
    'Journey created before the current year should also show the year in the date',
  createdAt: new Date('2020-11-19T12:34:56.647Z'),
  publishedAt: new Date('2020-12-19T12:34:56.647Z'),
  status: JourneyStatus.published
}

export const publishedJourney: Journey = {
  ...defaultJourney,
  title: 'Published Journey Heading',
  description: ' a published journey',
  publishedAt: new Date('2021-12-19T12:34:56.647Z'),
  status: JourneyStatus.published
}

export const descriptiveJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title:
    'This heading is very long so that we can test out the wrapping of the title on the card, by default this should be no longer than 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  description:
    'This description is also very very long for the purpose of testing out text wrapping which also should restricted to 2 lines on the card. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nisi magna, tincidunt ut ornare a, hendrerit quis nunc. Ut sapien enim, elementum ut elit commodo, egestas dapibus magna. Proin mattis magna id tellus pellentesque ultricies. Donec nibh lorem, ultrices quis neque nec, porttitor molestie mi. Fusce mollis, sem sit amet finibus tempor, metus nunc congue elit, sed pulvinar tellus turpis id felis. Sed facilisis vulputate tortor, et suscipit diam. Suspendisse sem orci, facilisis et justo ac, laoreet ultricies erat. Nunc venenatis, leo ac ultricies pellentesque, enim purus accumsan dui, id facilisis nisl ipsum nec justo. Phasellus accumsan magna sit amet nisl hendrerit pharetra sit amet nec felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In dapibus nulla ut est feugiat, at accumsan massa eleifend. Suspendisse suscipit id ligula ultricies mollis. In lobortis, dolor sed consequat suscipit, lorem eros molestie neque, at malesuada erat tellus nec felis. Curabitur cursus facilisis mauris id aliquet. Nulla malesuada eu erat quis iaculis.',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  slug: 'default',
  locale: 'tzm-Latn-DZ',
  createdAt: new Date('2021-11-19T12:34:56.647Z'),
  publishedAt: null,
  status: JourneyStatus.draft
}
