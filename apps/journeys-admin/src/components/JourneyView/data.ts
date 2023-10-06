import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  TypographyVariant,
  UserJourneyRole
} from '../../../__generated__/globalTypes'

export const defaultJourney: Journey = {
  __typename: 'Journey',
  id: 'journey-id',
  title: 'Journey Heading',
  featuredAt: null,
  description: 'Description',
  strategySlug: null,
  slug: 'default',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  blocks: null,
  primaryImageBlock: null,
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  userJourneys: [
    {
      id: 'userJourneyId1',
      __typename: 'UserJourney',
      role: UserJourneyRole.owner,
      openedAt: null,
      user: {
        id: '1',
        __typename: 'User',
        firstName: 'Amin',
        lastName: 'One',
        email: '1@email.com',
        imageUrl: 'https://bit.ly/3Gth4Yf'
      }
    },
    {
      id: 'userJourneyId2',
      __typename: 'UserJourney',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        id: '2',
        __typename: 'User',
        firstName: 'Horace',
        lastName: 'Two',
        email: '2@email.com',
        imageUrl: 'https://bit.ly/3rgHd6a'
      }
    },
    {
      id: 'userJourneyId3',
      __typename: 'UserJourney',
      role: UserJourneyRole.editor,
      openedAt: null,
      user: {
        id: '3',
        __typename: 'User',
        firstName: 'Coral',
        lastName: 'Three',
        email: '3@email.com',
        imageUrl: 'https://bit.ly/3nlwUwJ'
      }
    }
  ]
}

export const publishedJourney: Journey = {
  ...defaultJourney,
  title: 'Published Journey Heading',
  description: 'a published journey',
  publishedAt: '2021-12-19T12:34:56.647Z',
  status: JourneyStatus.published,
  blocks: [
    {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'step1.id'
    },
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      coverBlockId: 'image0.id',
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false
    },
    {
      id: 'image0.id',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      width: 1920,
      height: 1080,
      alt: 'random image from unsplash',
      parentBlockId: 'card0.id',
      parentOrder: 0,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    },
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 1,
      align: null,
      color: null,
      content: "What's our purpose, and how did we get here?",
      variant: TypographyVariant.h3
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 2,
      align: null,
      color: null,
      content:
        'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
      variant: null
    },
    {
      __typename: 'ButtonBlock',
      id: 'button0.id',
      parentBlockId: 'card0.id',
      parentOrder: 3,
      label: 'Watch Now',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.large,
      startIconId: 'icon',
      endIconId: null,
      action: {
        __typename: 'NavigateAction',
        parentBlockId: 'button0.id',
        gtmEventName: 'gtmEventName'
      }
    },
    {
      id: 'icon',
      __typename: 'IconBlock',
      parentBlockId: 'button',
      parentOrder: 0,
      iconName: IconName.PlayArrowRounded,
      iconColor: null,
      iconSize: IconSize.md
    }
  ]
}

export const archivedJourney: Journey = {
  ...defaultJourney,
  id: 'archived-journey-id',
  status: JourneyStatus.archived
}

export const trashedJourney: Journey = {
  ...defaultJourney,
  id: 'trashed-journey-id',
  status: JourneyStatus.trashed
}
