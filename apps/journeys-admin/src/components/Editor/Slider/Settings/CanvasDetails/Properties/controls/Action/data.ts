import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

export const steps: Array<TreeBlock<StepBlock>> = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    slug: null,
    children: [
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
        backdropBlur: null,
        children: [
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
            children: [],
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
              'Follow the journey of a curious Irishman traveling around the world looking for answers and wrestling with the things that just don’t seem to make sense. ',
            variant: null,
            children: [],
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
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: {
              parentBlockId: 'button.id',
              __typename: 'NavigateToBlockAction',
              gtmEventName: 'gtmEventName',
              blockId: 'step1.id'
            },
            children: []
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
    slug: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            id: 'image1.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card1.id',
            parentOrder: 0,
            children: [],
            blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG',
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'a quick question...',
            variant: TypographyVariant.h6,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'typographyBlockId2',
            __typename: 'TypographyBlock',
            parentBlockId: 'card1.id',
            parentOrder: 2,
            align: null,
            color: null,
            content: 'Can we trust the story of Jesus ?',
            variant: TypographyVariant.h3,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'ButtonBlock',
            id: 'button1.id',
            parentBlockId: 'card1.id',
            parentOrder: 3,
            label: 'Watch Now',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: {
              parentBlockId: 'button1.id',
              __typename: 'LinkAction',
              gtmEventName: 'gtmEventName',
              url: 'https://www.google.com'
            },
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button2.id',
            parentBlockId: 'card1.id',
            parentOrder: 4,
            label: 'Contact Us',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: {
              parentBlockId: 'button2.id',
              __typename: 'EmailAction',
              gtmEventName: 'gtmEventName',
              email: 'imissedmondshen@gmail.com'
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
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id',
    slug: null,
    children: [
      {
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        coverBlockId: 'image2.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            id: 'image2.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1477936821694-ec4233a9a1a0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1136&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card2.id',
            parentOrder: null,
            children: [],
            blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@',
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card2.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'if it’s true...',
            variant: TypographyVariant.h6,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'typographyBlockId2',
            __typename: 'TypographyBlock',
            parentBlockId: 'card2.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'What is Christianity to you?',
            variant: TypographyVariant.h3,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'radioQuestion0.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card2.id',
            parentOrder: 2,
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'One of many ways to God',
                action: {
                  parentBlockId: 'radioOption1.id',
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
                label: 'One great lie...',
                action: {
                  parentBlockId: 'radioOption3.id',
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
                label: 'One true way to God',
                action: {
                  parentBlockId: 'radioOption4.id',
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step2.id'
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
    nextBlockId: 'step4.id',
    slug: null,
    children: [
      {
        id: 'card3.id',
        __typename: 'CardBlock',
        parentBlockId: 'step3.id',
        coverBlockId: 'image3.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            id: 'image3.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1651069188152-bf30b5af2a0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card3.id',
            parentOrder: null,
            children: [],
            blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA',
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card3.id',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'What do you think?',
            variant: TypographyVariant.h6,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'ButtonBlock',
            id: 'button3.id',
            parentBlockId: 'card3.id',
            parentOrder: 1,
            label: 'Testbutton',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: {
              parentBlockId: 'button3.id',
              __typename: 'NavigateToBlockAction',
              gtmEventName: 'gtmEventName',
              blockId: 'step4.id'
            },
            children: []
          },
          {
            id: 'typographyBlockId2',
            __typename: 'TypographyBlock',
            parentBlockId: 'card3.id',
            parentOrder: 2,
            align: null,
            color: null,
            content: 'Do you need to change to be good enough for God?',
            variant: TypographyVariant.h3,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card3.id',
            parentOrder: 3,
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Yes, God likes good people',
                action: {
                  parentBlockId: 'radioOption1.id',
                  __typename: 'NavigateToBlockAction',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
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
                  parentBlockId: 'radioOption3.id',
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
    slug: null,
    children: [
      {
        id: 'card4.id',
        __typename: 'CardBlock',
        parentBlockId: 'step4.id',
        coverBlockId: 'image4.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            id: 'image4.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card0.id',
            parentOrder: 0,
            children: [],
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ',
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          {
            id: 'typographyBlockId1',
            __typename: 'TypographyBlock',
            parentBlockId: 'card4.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'a quote',
            variant: TypographyVariant.overline,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'typographyBlockId2',
            __typename: 'TypographyBlock',
            parentBlockId: 'card4.id',
            parentOrder: 2,
            align: null,
            color: null,
            content:
              '“God sent his Son into the world not to judge the world, but to save the world through him.”',
            variant: TypographyVariant.subtitle1,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            id: 'typographyBlockId13',
            __typename: 'TypographyBlock',
            parentBlockId: 'card4.id',
            parentOrder: 3,
            align: null,
            color: null,
            content: '–  The Bible, John 3:17',
            variant: TypographyVariant.caption,
            children: [],
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'ButtonBlock',
            id: 'button2.id',
            parentBlockId: 'card4.id',
            parentOrder: 4,
            label: 'Start Over',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: {
              parentBlockId: 'button2.id',
              __typename: 'NavigateToBlockAction',
              gtmEventName: 'gtmEventName',
              blockId: 'step0.id'
            },
            children: []
          }
        ]
      }
    ]
  }
]
