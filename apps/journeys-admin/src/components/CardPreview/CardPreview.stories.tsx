import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  ThemeMode,
  ThemeName,
  TypographyVariant,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../libs/storybook'

import { CardPreview } from '.'

const CardPreviewStory = {
  ...journeysAdminConfig,
  component: CardPreview,
  title: 'Journeys-Admin/CardPreview',
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
            variant: TypographyVariant.h3,
            children: []
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
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
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
              parentBlockId: 'button',
              gtmEventName: 'gtmEventName'
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
            ]
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
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
        coverBlockId: 'image1.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
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
            blurhash: 'LQEf1v^*XkEe*IyD$RnOyXTJRjjG'
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
            children: []
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
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card1.id',
            parentOrder: 3,
            label: 'Watch Now',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: 'icon',
            endIconId: null,
            action: {
              __typename: 'NavigateAction',
              parentBlockId: 'button',
              gtmEventName: 'gtmEventName'
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
            ]
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
        id: 'card2.id',
        __typename: 'CardBlock',
        parentBlockId: 'step2.id',
        coverBlockId: 'image2.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
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
            blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@'
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
            children: []
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
            children: []
          },
          {
            id: 'radioQuestion1.id',
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
                  __typename: 'NavigateAction',
                  parentBlockId: 'radioOption1.id',
                  gtmEventName: 'gtmEventName'
                },
                children: []
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
                },
                children: []
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
            blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA'
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
            children: []
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
            children: []
          },
          {
            id: 'radioQuestion1.id',
            __typename: 'RadioQuestionBlock',
            parentBlockId: 'card3.id',
            parentOrder: 2,
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 0,
                label: 'Yes, God likes good people',
                action: {
                  __typename: 'NavigateAction',
                  parentBlockId: 'radioOption1.id',
                  gtmEventName: 'gtmEventName'
                },
                children: []
              },
              {
                id: 'radioOption2.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
                parentOrder: 1,
                label: 'No, He will accept me as I am',
                action: {
                  __typename: 'NavigateAction',
                  parentBlockId: 'radioOption2.id',
                  gtmEventName: 'gtmEventName'
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
    nextBlockId: 'step5.id',
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
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
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
            children: []
          },
          {
            id: 'typographyBlockId12',
            __typename: 'TypographyBlock',
            parentBlockId: 'card4.id',
            parentOrder: 2,
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
            parentBlockId: 'card4.id',
            parentOrder: 3,
            align: null,
            color: null,
            content: '–  The Bible, John 3:17',
            variant: TypographyVariant.caption,
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card4.id',
            parentOrder: 4,
            label: 'Start Over',
            buttonVariant: ButtonVariant.contained,
            buttonColor: ButtonColor.primary,
            size: ButtonSize.large,
            startIconId: 'icon',
            endIconId: null,
            action: {
              __typename: 'NavigateToBlockAction',
              parentBlockId: 'button',
              gtmEventName: 'gtmEventName',
              blockId: 'step0.id'
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
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'step5.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card5.id',
        __typename: 'CardBlock',
        parentBlockId: 'step5.id',
        coverBlockId: 'video5.id',
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            id: 'video5.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card5.id',
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
            posterBlockId: 'image5.id',
            fullsize: null,
            action: null,
            objectFit: null,
            children: [
              {
                id: 'image5.id',
                __typename: 'ImageBlock',
                src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                width: 1920,
                height: 1080,
                alt: 'random image from unsplash',
                parentBlockId: 'video5.id',
                parentOrder: 0,
                children: [],
                blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
              }
            ]
          },
          {
            id: 'typographyBlockId51',
            __typename: 'TypographyBlock',
            parentBlockId: 'card5.id',
            parentOrder: 1,
            align: null,
            color: null,
            content: 'Card with Video Background',
            variant: TypographyVariant.h1,
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
    parentOrder: 4,
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card6.id',
        __typename: 'CardBlock',
        parentBlockId: 'step6.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: true,
        children: [
          {
            id: 'video6.id',
            __typename: 'VideoBlock',
            parentBlockId: 'card6.id',
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
            posterBlockId: 'image6.id',
            fullsize: null,
            action: null,
            objectFit: null,
            children: [
              {
                id: 'image6.id',
                __typename: 'ImageBlock',
                src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
                width: 1920,
                height: 1080,
                alt: 'random image from unsplash',
                parentBlockId: 'video6.id',
                parentOrder: 0,
                children: [],
                blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
              }
            ]
          }
        ]
      }
    ]
  }
]

const Template: Story = ({ ...args }) => {
  const [selected] = useState<TreeBlock<StepBlock>>(args.steps?.[0])

  return (
    <MockedProvider>
      <JourneyProvider
        value={{
          journey: {
            id: 'journeyId',
            themeMode: ThemeMode.light,
            themeName: ThemeName.base,
            language: {
              __typename: 'Language',
              bcp47: 'en'
            }
          } as unknown as Journey,
          variant: 'admin'
        }}
      >
        <DragDropContext>
          <CardPreview
            onSelect={(step) => ({ step })}
            selected={selected}
            steps={args.steps}
            showAddButton={args.showAddButton}
            isDraggable={args.isDraggable}
            showNavigationCards={args.showNavigationCards ?? false}
          />
        </DragDropContext>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  steps
}

export const Draggable = Template.bind({})
Draggable.args = {
  steps,
  isDraggable: true
}

export const AddButton = Template.bind({})
AddButton.args = {
  steps,
  showAddButton: true
}

export const Loading = Template.bind({})
Loading.args = {
  steps: undefined
}

export const WithNavigationCards = Template.bind({})
WithNavigationCards.args = {
  steps,
  showNavigationCards: true
}

export default CardPreviewStory as Meta
