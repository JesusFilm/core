import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourneyForEdit'
import { journeysAdminConfig } from '../../libs/storybook'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  IconSize,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import { CardPreview } from '.'

const CardPreviewStory = {
  ...journeysAdminConfig,
  component: CardPreview,
  title: 'Journeys-Admin/CardPreview',
  parameters: {
    layout: 'fullscreen'
  }
}

const steps: Array<TreeBlock<StepBlock>> = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    locked: false,
    nextBlockId: 'step1.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
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
    locked: false,
    nextBlockId: 'step2.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step1.id',
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
    locked: false,
    nextBlockId: 'step3.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
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
            label: '',
            description: '',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
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
    locked: false,
    nextBlockId: 'step4.id',
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
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
            label: '',
            description: '',
            children: [
              {
                id: 'radioOption1.id',
                __typename: 'RadioOptionBlock',
                parentBlockId: 'radioQuestion1.id',
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
    locked: false,
    nextBlockId: null,
    children: [
      {
        id: 'card0.id',
        __typename: 'CardBlock',
        parentBlockId: 'step0.id',
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
            align: null,
            color: null,
            content: '–  The Bible, John 3:17',
            variant: TypographyVariant.caption,
            children: []
          },
          {
            id: 'image0.id',
            __typename: 'ImageBlock',
            src: 'https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
            width: 1920,
            height: 1080,
            alt: 'random image from unsplash',
            parentBlockId: 'card0.id',
            children: [],
            blurhash: 'LFALX]%g4Tf+?^jEMxo#00Mx%gjZ'
          },
          {
            __typename: 'ButtonBlock',
            id: 'button',
            parentBlockId: 'card0.id',
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
      }
    ]
  }
]

const Template: Story = () => {
  const [selected, setSelectedStep] = useState<TreeBlock<StepBlock>>(steps[0])
  return (
    <MockedProvider>
      <CardPreview
        onSelect={(step) => setSelectedStep(step)}
        selected={selected}
        steps={steps}
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})

export default CardPreviewStory as Meta
