import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  MessagePlatform,
  ThemeMode,
  ThemeName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'

import { Canvas } from '.'

const CanvasStory: Meta<typeof Canvas> = {
  ...journeysAdminConfig,
  component: Canvas,
  title: 'Journeys-Admin/Editor/Slider/Content/Canvas',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const steps: Array<TreeBlock<StepBlock>> = [
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
            startIconId: 'icon',
            endIconId: null,
            submitEnabled: null,
            action: {
              __typename: 'NavigateToBlockAction',
              parentBlockId: 'button0.id',
              gtmEventName: 'gtmEventName',
              blockId: 'step1.id'
            },
            children: [
              {
                id: 'icon',
                __typename: 'IconBlock',
                parentBlockId: 'button',
                parentOrder: 0,
                iconName: IconName.PlayArrowRounded,
                iconColor: null,
                iconSize: IconSize.md,
                children: []
              }
            ],
            settings: null
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
            id: 'typographyBlockId12',
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
            startIconId: 'icon',
            endIconId: null,
            submitEnabled: null,
            action: {
              __typename: 'NavigateToBlockAction',
              parentBlockId: 'button1.id',
              gtmEventName: 'gtmEventName',
              blockId: 'step2.id'
            },
            children: [
              {
                id: 'icon',
                __typename: 'IconBlock',
                parentBlockId: 'button',
                parentOrder: 0,
                iconName: IconName.PlayArrowRounded,
                iconColor: null,
                iconSize: IconSize.md,
                children: []
              }
            ],
            settings: null
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
            parentOrder: 0,
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
            parentOrder: 1,
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
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentOrder: 2,
            parentBlockId: 'card2.id',
            gridView: false,
            children: [
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
                },
                children: []
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
                },
                children: []
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
    parentOrder: 3,
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
            parentOrder: 0,
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
            parentOrder: 1,
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
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card3.id',
            parentOrder: 2,
            gridView: false,
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Yes, God likes good people',
                pollOptionImageBlockId: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'radioOption1.id',
                  gtmEventName: 'gtmEventName',
                  blockId: 'step4.id'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'No, He will accept me as I am',
                pollOptionImageBlockId: null,
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'radioOption2.id',
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
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        id: 'card4.id',
        __typename: 'CardBlock',
        parentBlockId: 'step4.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            __typename: 'VideoBlock',
            id: 'video1.id',
            parentBlockId: 'card4.id',
            autoplay: false,
            parentOrder: 0,
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
            posterBlockId: null,
            fullsize: null,
            action: null,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'step5.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 5,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        id: 'card5.id',
        __typename: 'CardBlock',
        parentBlockId: 'step5.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
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
            children: [],
            scale: null,
            focalLeft: 50,
            focalTop: 50
          },
          {
            __typename: 'SignUpBlock',
            id: 'SignUp1',
            parentBlockId: 'card5.id',
            parentOrder: 1,
            submitIconId: null,
            submitLabel: null,
            action: null,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'step6.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        id: 'card6.id',
        __typename: 'CardBlock',
        parentBlockId: 'step6.id',
        coverBlockId: 'image6.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        backdropBlur: null,
        children: [
          {
            id: 'image6.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card6.id',
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
            parentBlockId: 'card6.id',
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
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card6.id',
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
            parentBlockId: 'card6.id',
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
            parentBlockId: 'card6.id',
            parentOrder: 4,
            label: 'Start Over',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: 'icon',
            endIconId: null,
            submitEnabled: null,
            action: {
              __typename: 'NavigateToBlockAction',
              parentBlockId: 'button2.id',
              gtmEventName: 'gtmEventName',
              blockId: 'step6.id'
            },
            children: [
              {
                id: 'icon',
                __typename: 'IconBlock',
                parentBlockId: 'button',
                parentOrder: 0,
                iconName: IconName.PlayArrowRounded,
                iconColor: null,
                iconSize: IconSize.md,
                children: []
              }
            ],
            settings: null
          }
        ]
      }
    ]
  }
]

type Story = StoryObj<
  ComponentProps<typeof Canvas> & {
    journey: Partial<Journey>
    state: Partial<EditorState>
    steps?: Array<TreeBlock<StepBlock>>
  }
>

const Template: Story = {
  render: ({ journey, state, steps }) => {
    return (
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.dark,
              themeName: ThemeName.base,
              seoTitle: 'my journey',
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
              ...journey
            } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ steps, ...state }}>
            <Canvas />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
  },
  args: {
    steps
  }
}

export const Default = {
  ...Template
}

export const EmptyCard = {
  ...Template,
  args: {
    ...Template.args,
    steps: [
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: 'step2.id',
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
            children: []
          }
        ]
      }
    ]
  }
}

export const RTL = {
  ...Template,
  args: {
    ...Template.args,
    journey: {
      language: {
        __typename: 'Language',
        id: '529',
        bcp47: 'ar',
        name: [
          {
            __typename: 'LanguageName',
            value: 'Arabic',
            primary: true
          }
        ]
      }
    }
  }
}

export const JourneyAppearanceEdit = {
  ...Template,
  args: {
    ...Template.args,
    state: {
      selectedBlock: {},
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.JourneyAppearance
    },
    journey: {
      chatButtons: [
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.tikTok
        },
        {
          __typename: 'ChatButton',
          id: '1',
          link: 'https://m.me/',
          platform: MessagePlatform.snapchat
        }
      ]
    }
  }
}

export default CanvasStory
