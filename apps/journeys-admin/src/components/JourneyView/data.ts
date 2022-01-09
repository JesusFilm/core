import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  TypographyVariant
} from '../../../__generated__/globalTypes'

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
  blocks: null,
  primaryImageBlock: null,
  userJourneys: []
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
      locked: false,
      nextBlockId: 'step1.id'
    },
    {
      id: 'card0.id',
      __typename: 'CardBlock',
      parentBlockId: 'step0.id',
      coverBlockId: 'image0.id',
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false
    },
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      align: null,
      color: null,
      content: "What's our purpose, and how did we get here?",
      variant: TypographyVariant.h3
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      align: null,
      color: null,
      content:
        'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
      variant: null
    },
    {
      __typename: 'ButtonBlock',
      id: 'button',
      parentBlockId: 'card0.id',
      label: 'Watch Now',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.large,
      startIcon: {
        __typename: 'Icon',
        name: IconName.PlayArrowRounded,
        color: null,
        size: IconSize.md
      },
      endIcon: null,
      action: {
        __typename: 'NavigateAction',
        gtmEventName: 'gtmEventName'
      }
    },
    {
      id: 'image0.id',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      width: 1920,
      height: 1080,
      alt: 'random image from unsplash',
      parentBlockId: 'card0.id',
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    }
  ]
}
