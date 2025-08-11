import { Edge, MarkerType, Node } from 'reactflow'

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
  UserJourneyRole,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { BlockFields as Block } from '../../libs/block/__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../libs/useJourneyQuery/__generated__/GetJourney'

export interface StepBlockWithPosition {
  __typename: 'StepBlock'
  id: string
  x: number
  y: number
}

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
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  },
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  updatedAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  blocks: null,
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  template: null,
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
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
        imageUrl: 'https://bit.ly/3nlwUwJ'
      }
    }
  ],
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: []
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
      nextBlockId: 'step1.id',
      slug: null
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
      fullscreen: false,
      backdropBlur: null
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
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    },
    {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 1,
      align: null,
      color: null,
      content: "What's our purpose, and how did we get here?",
      variant: TypographyVariant.h3,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    },
    {
      id: 'typographyBlockId2',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 2,
      align: null,
      color: null,
      content:
        "Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don't seem to make sense.",
      variant: null,
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
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
      submitEnabled: null,
      action: null,
      settings: null
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

export const blocks: Block[] = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    slug: null
  },
  {
    id: 'card0.id',
    __typename: 'CardBlock',
    parentBlockId: 'step0.id',
    parentOrder: 0,
    coverBlockId: 'video0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: "What's our purpose, and how did we get here?",
    variant: TypographyVariant.h3,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    align: null,
    color: null,
    content:
      "Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don't seem to make sense.",
    variant: null,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    __typename: 'ButtonBlock',
    id: 'button0.id',
    parentBlockId: 'card0.id',
    parentOrder: 2,
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'icon0-1.id',
    endIconId: null,
    submitEnabled: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'button0.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step1.id'
    },
    settings: null
  },
  {
    id: 'icon0-1.id',
    __typename: 'IconBlock',
    parentBlockId: 'button0.id',
    parentOrder: 0,
    iconName: IconName.PlayArrowRounded,
    iconColor: null,
    iconSize: IconSize.md
  },
  {
    __typename: 'VideoBlock',
    id: 'video0.id',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    autoplay: true,
    muted: true,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    mediaVideo: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'VideoTitle',
          value: 'FallingPlates'
        }
      ],
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh:
            'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
        }
      ],
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      },
      variantLanguages: []
    },
    startAt: null,
    endAt: null,
    fullsize: null,
    action: null,
    posterBlockId: 'image0.id'
  },
  {
    id: 'image0.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'video0.id',
    parentOrder: 4,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step2.id',
    slug: null
  },
  {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: 'image1.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    id: 'typographyBlockId3',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'a quick question...',
    variant: TypographyVariant.h6,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId4',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Can we trust the story of Jesus ?',
    variant: TypographyVariant.h3,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    __typename: 'ButtonBlock',
    id: 'button1.id',
    parentBlockId: 'card1.id',
    parentOrder: 2,
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'icon1-1.id',
    endIconId: null,
    submitEnabled: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'button1.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step2.id'
    },
    settings: null
  },
  {
    id: 'icon1-1.id',
    __typename: 'IconBlock',
    parentBlockId: 'button1.id',
    parentOrder: 0,
    iconName: IconName.PlayArrowRounded,
    iconColor: null,
    iconSize: IconSize.md
  },
  {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 3,
    blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },

  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id',
    slug: null
  },
  {
    id: 'card2.id',
    __typename: 'CardBlock',
    parentBlockId: 'step2.id',
    parentOrder: 0,
    coverBlockId: 'image2.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    id: 'typographyBlockId5',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: "if it's true...",
    variant: TypographyVariant.h6,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'What is Christianity to you?',
    variant: TypographyVariant.h3,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'radioQuestion1.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card2.id',
    parentOrder: 2,
    gridView: false
  },
  {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 0,
    label: 'One of many ways to God',
    pollOptionImageBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption1.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step3.id'
    }
  },
  {
    id: 'radioOption2.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 1,
    label: 'One great lie...',
    pollOptionImageBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption2.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step3.id'
    }
  },
  {
    id: 'radioOption3.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 2,
    label: 'One true way to God',
    pollOptionImageBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption3.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step3.id'
    }
  },
  {
    id: 'image2.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card2.id',
    parentOrder: 2,
    blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: 'step4.id',
    slug: null
  },
  {
    id: 'card3.id',
    __typename: 'CardBlock',
    parentBlockId: 'step3.id',
    parentOrder: 0,
    coverBlockId: 'image3.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    id: 'typographyBlockId7',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'What do you think?',
    variant: TypographyVariant.h6,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Do you need to change to be good enough for God?',
    variant: TypographyVariant.h3,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'radioQuestion2.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card3.id',
    parentOrder: 2,
    gridView: false
  },
  {
    id: 'radioOption4.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    parentOrder: 0,
    label: 'Yes, God likes good people',
    pollOptionImageBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption4.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step4.id'
    }
  },
  {
    id: 'radioOption5.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    parentOrder: 1,
    label: 'No, He will accept me as I am',
    pollOptionImageBlockId: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'radioOption5.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step4.id'
    }
  },
  {
    id: 'image3.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1651069188152-bf30b5af2a0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card3.id',
    parentOrder: 2,
    blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    slug: null
  },
  {
    __typename: 'VideoBlock',
    id: 'video1.id',
    parentBlockId: 'step4.id',
    parentOrder: 0,
    autoplay: false,
    muted: true,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    mediaVideo: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'VideoTitle',
          value: 'FallingPlates'
        }
      ],
      images: [
        {
          __typename: 'CloudflareImage',
          mobileCinematicHigh:
            'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
        }
      ],
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      },
      variantLanguages: []
    },
    startAt: null,
    endAt: null,
    fullsize: null,
    action: null,
    posterBlockId: 'posterBlockId'
  },
  {
    id: 'posterBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'video1.id',
    parentOrder: 0,
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    id: 'step5.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 5,
    locked: false,
    nextBlockId: null,
    slug: null
  },
  {
    id: 'card5.id',
    __typename: 'CardBlock',
    parentBlockId: 'step5.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    __typename: 'ImageBlock',
    id: 'Image1',
    src: 'https://images.unsplash.com/photo-1600133153574-25d98a99528c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80',
    width: 1600,
    height: 1067,
    alt: 'random image from unsplash',
    parentBlockId: 'card5.id',
    parentOrder: 0,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    __typename: 'SignUpBlock',
    id: 'SignUp1',
    parentBlockId: 'card5.id',
    parentOrder: 1,
    submitIconId: 'icon5-1.id',
    submitLabel: null,
    action: null
  },
  {
    id: 'icon5-1.id',
    __typename: 'IconBlock',
    parentBlockId: 'SignUp1',
    parentOrder: 0,
    iconName: null,
    iconColor: null,
    iconSize: null
  },
  {
    id: 'step6.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    slug: null
  },
  {
    id: 'card6.id',
    __typename: 'CardBlock',
    parentBlockId: 'step6.id',
    parentOrder: 0,
    coverBlockId: 'image6.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null
  },
  {
    id: 'image6.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card6.id',
    parentOrder: 0,
    blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
    scale: null,
    focalLeft: 50,
    focalTop: 50
  },
  {
    id: 'typographyBlockId11',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'a quote',
    variant: TypographyVariant.overline,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId12',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 2,
    align: null,
    color: null,
    content:
      '"God sent his Son into the world not to judge the world, but to save the world through him."',
    variant: TypographyVariant.subtitle1,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    id: 'typographyBlockId13',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 3,
    align: null,
    color: null,
    content: '–  The Bible, John 3:17',
    variant: TypographyVariant.caption,
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
  },
  {
    __typename: 'ButtonBlock',
    id: 'button3.id',
    parentBlockId: 'card6.id',
    parentOrder: 4,
    label: 'Start Over',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'icon6-1.id',
    endIconId: null,
    submitEnabled: null,
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'button3.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step6.id'
    },
    settings: null
  },
  {
    id: 'icon6-1.id',
    __typename: 'IconBlock',
    parentBlockId: 'button3.id',
    parentOrder: 0,
    iconName: IconName.PlayArrowRounded,
    iconColor: null,
    iconSize: IconSize.md
  }
]

export const blocksWithStepBlockPosition: StepBlockWithPosition[] = blocks
  .filter((block) => block.__typename === 'StepBlock')
  .map((block, index) => {
    return {
      __typename: 'StepBlock',
      id: block.id,
      x: Number.parseInt(`${index * 3}00`),
      y: 1
    }
  })

export const nodes: Node[] = [
  {
    id: 'SocialPreview',
    type: 'SocialPreview',
    data: {},
    position: { x: -365, y: -46 },
    draggable: false
  },
  {
    id: 'hidden',
    data: {},
    position: { x: -165, y: -46 },
    draggable: false,
    hidden: true
  },
  {
    id: 'step0.id',
    type: 'StepBlock',
    data: {},
    position: { x: 0, y: 1 }
  },
  {
    id: 'step1.id',
    type: 'StepBlock',
    data: {},
    position: { x: 300, y: 1 }
  },
  {
    id: 'step2.id',
    type: 'StepBlock',
    data: {},
    position: { x: 600, y: 1 }
  },
  {
    id: 'step3.id',
    type: 'StepBlock',
    data: {},
    position: { x: 900, y: 1 }
  },
  {
    id: 'step4.id',
    type: 'StepBlock',
    data: {},
    position: { x: 1200, y: 1 }
  },
  {
    id: 'step5.id',
    type: 'StepBlock',
    data: {},
    position: { x: 1500, y: 1 }
  },
  {
    id: 'step6.id',
    type: 'StepBlock',
    data: {},
    position: { x: 1800, y: 1 }
  }
]

export const edges: Edge[] = [
  {
    id: 'SocialPreview->hidden',
    source: 'SocialPreview',
    target: 'hidden',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#C52D3A'
    },
    style: { opacity: 0 }
  },
  {
    id: 'step0.id->step1.id',
    source: 'step0.id',
    sourceHandle: undefined,
    target: 'step1.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'button0.id->step1.id',
    source: 'step0.id',
    sourceHandle: 'button0.id',
    target: 'step1.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'step1.id->step2.id',
    source: 'step1.id',
    sourceHandle: undefined,
    target: 'step2.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'button1.id->step2.id',
    source: 'step1.id',
    sourceHandle: 'button1.id',
    target: 'step2.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'step2.id->step3.id',
    source: 'step2.id',
    sourceHandle: undefined,
    target: 'step3.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'radioOption1.id->step3.id',
    source: 'step2.id',
    sourceHandle: 'radioOption1.id',
    target: 'step3.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'radioOption2.id->step3.id',
    source: 'step2.id',
    sourceHandle: 'radioOption2.id',
    target: 'step3.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'radioOption3.id->step3.id',
    source: 'step2.id',
    sourceHandle: 'radioOption3.id',
    target: 'step3.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'step3.id->step4.id',
    source: 'step3.id',
    sourceHandle: undefined,
    target: 'step4.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'radioOption4.id->step4.id',
    source: 'step3.id',
    sourceHandle: 'radioOption4.id',
    target: 'step4.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'radioOption5.id->step4.id',
    source: 'step3.id',
    sourceHandle: 'radioOption5.id',
    target: 'step4.id',
    type: 'Custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  },
  {
    id: 'SocialPreview->step0.id',
    source: 'SocialPreview',
    target: 'step0.id',
    type: 'Start',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      height: 10,
      width: 10,
      color: '#d9d9dc'
    }
  }
]
