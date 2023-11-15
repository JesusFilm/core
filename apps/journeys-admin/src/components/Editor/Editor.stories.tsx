import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'

import { ActiveJourneyEditContent } from '@core/journeys/ui/EditorProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  GetJourney_journey_blocks as Block,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
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
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'
import { PageWrapper } from '../NewPageWrapper'

import { ControlPanel } from './ControlPanel'
import { Drawer } from './Drawer'
import { EditToolbar } from './EditToolbar'
import { JourneyEdit } from './JourneyEdit'

import { Editor } from '.'

const EditorStory: Meta<typeof Editor> = {
  ...journeysAdminConfig,
  component: Editor,
  title: 'Journeys-Admin/Editor',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen',
    chromatic: {
      ...journeysAdminConfig.parameters.chromatic,
      diffThreshold: 0.75
    },
    docs: {
      source: { type: 'code' }
    }
  }
}

const blocks: Block[] = [
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
    parentOrder: 0,
    coverBlockId: 'video0.id',
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: "What's our purpose, and how did we get here?",
    variant: TypographyVariant.h3
  },
  {
    id: 'typographyBlockId2',
    __typename: 'TypographyBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
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
    parentOrder: 2,
    label: 'Watch Now',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: 'icon0-1.id',
    endIconId: null,
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'button0.id',
      gtmEventName: 'gtmEventName'
    }
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
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
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
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step2.id'
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
    fullscreen: false
  },
  {
    id: 'typographyBlockId3',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'a quick question...',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId4',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Can we trust the story of Jesus ?',
    variant: TypographyVariant.h3
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
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'button1.id',
      gtmEventName: 'gtmEventName'
    }
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
    blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG'
  },

  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id'
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
    fullscreen: false
  },
  {
    id: 'typographyBlockId5',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'if it’s true...',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card2.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'What is Christianity to you?',
    variant: TypographyVariant.h3
  },
  {
    id: 'radioQuestion1.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card2.id',
    parentOrder: 2
  },
  {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 0,
    label: 'One of many ways to God',
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'radioOption1.id',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption2.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 1,
    label: 'One great lie...',
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'radioOption2.id',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption3.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 2,
    label: 'One true way to God',
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'radioOption3.id',
      gtmEventName: 'gtmEventName'
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
    blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@'
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: 'step4.id'
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
    fullscreen: false
  },
  {
    id: 'typographyBlockId7',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    parentOrder: 0,
    align: null,
    color: null,
    content: 'What do you think?',
    variant: TypographyVariant.h6
  },
  {
    id: 'typographyBlockId1',
    __typename: 'TypographyBlock',
    parentBlockId: 'card3.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'Do you need to change to be good enough for God?',
    variant: TypographyVariant.h3
  },
  {
    id: 'radioQuestion2.id',
    __typename: 'RadioQuestionBlock',
    parentBlockId: 'card3.id',
    parentOrder: 2
  },
  {
    id: 'radioOption4.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    parentOrder: 0,
    label: 'Yes, God likes good people',
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'radioOption4.id',
      gtmEventName: 'gtmEventName'
    }
  },
  {
    id: 'radioOption5.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion2.id',
    parentOrder: 1,
    label: 'No, He will accept me as I am',
    action: {
      __typename: 'NavigateAction',
      parentBlockId: 'radioOption5.id',
      gtmEventName: 'gtmEventName'
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
    blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA'
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null
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
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'Translation',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      }
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
    parentOrder: 0
  },
  {
    id: 'step5.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 5,
    locked: false,
    nextBlockId: null
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
    fullscreen: false
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
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
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
    nextBlockId: null
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
    fullscreen: false
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
    blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
  },
  {
    id: 'typographyBlockId11',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 1,
    align: null,
    color: null,
    content: 'a quote',
    variant: TypographyVariant.overline
  },
  {
    id: 'typographyBlockId12',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 2,
    align: null,
    color: null,
    content:
      '“God sent his Son into the world not to judge the world, but to save the world through him.”',
    variant: TypographyVariant.subtitle1
  },
  {
    id: 'typographyBlockId13',
    __typename: 'TypographyBlock',
    parentBlockId: 'card6.id',
    parentOrder: 3,
    align: null,
    color: null,
    content: '–  The Bible, John 3:17',
    variant: TypographyVariant.caption
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
    action: {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'button3.id',
      gtmEventName: 'gtmEventName',
      blockId: 'step6.id'
    }
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

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'NUA Journey: Ep.3 – Decision',
  slug: 'nua-journey-ep-3-decision',
  description: 'my cool journey',
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
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: [],
  blocks,
  featuredAt: null,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  template: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: []
}

const Template: StoryObj<typeof Editor> = {
  render: (args) => {
    return (
      <MockedProvider>
        <FlagsProvider>
          <Editor
            journey={args.journey}
            view={args.view ?? ActiveJourneyEditContent.Canvas}
          >
            <PageWrapper
              title={args.journey?.title ?? 'Edit Journey'}
              mainHeaderChildren={<EditToolbar />}
              bottomPanelChildren={<ControlPanel />}
              customSidePanel={<Drawer />}
              mainBodyPadding={false}
              backHref="/journeys/nua-journey-ep-3-decision"
            >
              <JourneyEdit />
            </PageWrapper>
          </Editor>
        </FlagsProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: { journey }
}

export const SocialPreview = {
  ...Template,
  args: { journey },
  play: async () => {
    const button = screen.getByTestId('NavigationCardSocial')
    await userEvent.click(button)
    await waitFor(async () => {
      await screen.getByText('Social App View')
    })
  }
}

export const Goals = {
  ...Template,
  args: { journey },
  play: async () => {
    const button = screen.getByTestId('NavigationCardGoals')
    await userEvent.click(button)
    await waitFor(async () => {
      await screen.getByText('Every Journey has a goal')
    })
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export const RTL = {
  ...Template,
  args: {
    journey: {
      ...journey,
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'ar',
        name: [
          {
            __typename: 'Translation',
            value: 'Arabic',
            primary: true
          }
        ]
      }
    }
  }
}

export default EditorStory
