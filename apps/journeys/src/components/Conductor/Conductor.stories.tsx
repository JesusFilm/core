import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { journeysConfig } from '../../libs/storybook'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { Conductor, ConductorProps } from '.'

const basic: TreeBlock[] = [
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step2.id',
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        coverBlockId: 'image1.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: true,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card1.id',
            parentOrder: 1,
            label: 'Step 1',
            description: 'Start',
            children: [
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 2,
                label: 'Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          },
          {
            id: 'image1.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            children: [],
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
          }
        ]
      }
    ]
  },
  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: true,
    nextBlockId: 'step3.id',
    children: [
      {
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step2.id',
            parentOrder: 1,
            label: 'Step 2',
            description: 'Locked',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 2,
                label: 'Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card3.id',
        __typename: 'CardBlock',
        parentBlockId: 'step3.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card3.id',
            parentOrder: 0,
            label: 'Step 3',
            description: 'No nextBlockId',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 2,
                label: 'Step 4 (End)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card4.id',
        __typename: 'CardBlock',
        parentBlockId: 'step4.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step4.id',
            parentOrder: 1,
            label: 'Step 4',
            description: 'End',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Step 1 (Start)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step1.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'Step 2 (Locked)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 2,
                label: 'Step 3 (No nextBlockId)',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
]

const imageBlocks: TreeBlock[] = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        parentOrder: 1,
        coverBlockId: 'image0.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: "What's our purpose, and how did we get here?",
            variant: TypographyVariant.h3,
            children: []
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
            variant: null,
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card0.id',
            parentOrder: 2,
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
            },
            children: []
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
            children: [],
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
          }
        ]
      }
    ]
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step2.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        parentOrder: 1,
        coverBlockId: 'image0.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'a quick question...',
            variant: TypographyVariant.h6,
            children: []
          },
          {
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'Can we trust the story of Jesus ?',
            variant: TypographyVariant.h3,
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card0.id',
            parentOrder: 2,
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
            },
            children: []
          },
          {
            id: 'image0.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            children: [],
            blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG'
          }
        ]
      }
    ]
  },
  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        parentOrder: 1,
        coverBlockId: 'image0.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'if it’s true...',
            variant: TypographyVariant.h6,
            children: []
          },
          {
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'What is Christianity to you?',
            variant: TypographyVariant.h3,
            children: []
          },
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step2.id',
            parentOrder: 2,
            label: '',
            description: '',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'One of many ways to God',
                action: {
                  __typename: 'NavigateAction',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'One great lie...',
                action: {
                  __typename: 'NavigateAction',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              },
              {
                id: 'radioOption4.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 2,
                label: 'One true way to God',
                action: {
                  __typename: 'NavigateAction',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              }
            ]
          },
          {
            id: 'image0.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            children: [],
            blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@'
          }
        ]
      }
    ]
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: 'step4.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        parentOrder: 1,
        coverBlockId: 'image0.id',
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'What do you think?',
            variant: TypographyVariant.h6,
            children: []
          },
          {
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'Do you need to change to be good enough for God?',
            variant: TypographyVariant.h3,
            children: []
          },
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step2.id',
            parentOrder: 2,
            label: '',
            description: '',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Yes, God likes good people',
                action: {
                  __typename: 'NavigateAction',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              },
              {
                id: 'radioOption3.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'No, He will accept me as I am',
                action: {
                  __typename: 'NavigateAction',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              }
            ]
          },
          {
            id: 'image0.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1527268835115-be8ff4ff5dec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1235&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card0.id',
            parentOrder: 1,
            children: [],
            blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA'
          }
        ]
      }
    ]
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
        coverBlockId: 'image0.id',
        parentOrder: 1,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'a quote',
            variant: TypographyVariant.overline,
            children: []
          },
          {
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 1,
            align: null,
            color: null,
            content:
              '“God sent his Son into the world not to judge the world, but to save the world through him.”',
            variant: TypographyVariant.subtitle1,
            children: []
          },
          {
            id: 'typographyBlockId13',
            __typename: 'TypographyBlock',
            parentBlockId: 'card0.id',
            parentOrder: 2,
            align: null,
            color: null,
            content: '–  The Bible, John 3:17',
            variant: TypographyVariant.caption,
            children: []
          },

          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card0.id',
            parentOrder: 3,
            label: 'Start Over',
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
              __typename: 'NavigateToBlockAction',
              gtmEventName: 'gtmEventName',
              blockId: 'step0.id'
            },
            children: []
          }
        ]
      },
      {
        id: 'image0.id',
        __typename: 'ImageBlock',
        src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
        width: 1920,
        height: 1080,
        alt: 'random image from unsplash',
        parentBlockId: 'card0.id',
        parentOrder: 0,
        children: [],
        blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
      }
    ]
  }
]

const videoBlock: TreeBlock[] = [
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step2.id',
    children: [
      {
        id: 'video1.id',
        __typename: 'VideoBlock',
        parentBlockId: 'card1.id',
        parentOrder: 0,
        title: '',
        autoplay: true,
        muted: true,
        videoContent: {
          __typename: 'VideoArclight',
          src: 'https://arc.gt/hls/2_0-FallingPlates/529'
        },
        endAt: null,
        startAt: null,
        posterBlockId: null,
        children: [
          {
            id: 'trigger.id',
            __typename: 'VideoTriggerBlock',
            parentBlockId: 'video1.id',
            parentOrder: 0,
            triggerStart: 20,
            triggerAction: {
              __typename: 'NavigateToBlockAction',
              gtmEventName: 'gtmEventName',
              blockId: 'step2.id'
            },
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: true,
    nextBlockId: 'step3.id',
    children: [
      {
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'step2.id',
            parentOrder: 0,
            label: 'Step 2',
            description: 'Locked',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Video with Poster',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step3.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'Video With Autoplay',
                action: {
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'video2.id',
        __typename: 'VideoBlock',
        parentBlockId: 'card3.id',
        parentOrder: 0,
        title: '',
        autoplay: false,
        muted: false,
        posterBlockId: 'posterBlockId',
        videoContent: {
          __typename: 'VideoArclight',
          src: 'https://arc.gt/hls/2_0-FallingPlates/529'
        },
        endAt: null,
        startAt: null,
        children: [
          {
            id: 'posterBlockId',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
            alt: 'random image from unsplash',
            width: 1600,
            height: 1067,
            blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
            parentBlockId: 'videoBlockId',
            parentOrder: 0,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'video3.id',
        __typename: 'VideoBlock',
        parentBlockId: 'card3.id',
        parentOrder: 0,
        title: '',
        autoplay: true,
        muted: false,
        posterBlockId: null,
        videoContent: {
          __typename: 'VideoArclight',
          src: 'https://arc.gt/hls/2_0-FallingPlates/529'
        },
        endAt: null,
        startAt: 10,
        children: []
      }
    ]
  }
]

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ConductorProps> = ({ ...props }) => (
  <MockedProvider>
    <Conductor {...props} />
  </MockedProvider>
)

export const Default: Story<ConductorProps> = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent: Story<ConductorProps> = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithVideoContent: Story<ConductorProps> = Template.bind({})
WithVideoContent.args = {
  blocks: videoBlock
}
WithVideoContent.parameters = {
  chromatic: { delay: 100, diffThreshold: 0.2 }
}

export default Demo as Meta
