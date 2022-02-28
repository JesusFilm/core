import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey as Journey
} from '../../../../../../../__generated__/GetJourney'
import {
  ThemeName,
  ThemeMode,
  ButtonVariant,
  ButtonColor,
  TypographyVariant,
  ButtonSize
} from '../../../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../../../libs/context'
import {
  NavigateToBlockAction,
  NAVIGATE_TO_BLOCK_ACTION_UPDATE
} from './NavigateToBlockAction'

describe('NavigateToBlockAction', () => {
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
              id: 'button0.id',
              parentBlockId: 'card0.id',
              parentOrder: 3,
              label: 'Watch Now',
              buttonVariant: ButtonVariant.contained,
              buttonColor: ButtonColor.primary,
              size: ButtonSize.large,
              startIconId: null,
              endIconId: null,
              action: {
                parentBlockId: 'button0.id',
                __typename: 'NavigateAction',
                gtmEventName: 'gtmEventName'
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
      parentOrder: 0,
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
              id: 'button1.id',
              parentBlockId: 'card1.id',
              parentOrder: 3,
              label: 'Watch Now',
              buttonVariant: ButtonVariant.contained,
              buttonColor: ButtonColor.primary,
              size: ButtonSize.large,
              startIconId: null,
              endIconId: null,
              action: null,
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
      parentOrder: 0,
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
              parentOrder: 0,
              children: [],
              blurhash: 'L;KRQa-Rs-kA}ot4bZj@SMR,WWj@'
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
              children: []
            },
            {
              id: 'radioQuestion0.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'card2.id',
              parentOrder: 2,
              label: 'What is Christianity to you?',
              description: '',
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  parentOrder: 0,
                  label: 'One of many ways to God',
                  action: {
                    parentBlockId: 'radioOption1.id',
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
                    parentBlockId: 'radioOption3.id',
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
                    parentBlockId: 'radioOption4.id',
                    __typename: 'NavigateAction',
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
      parentOrder: 0,
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
              src: 'https://images.unsplash.com/photo-1527268835115-be8ff4ff5dec?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1235&q=80',
              width: 1920,
              height: 1080,
              alt: 'random image from unsplash',
              parentBlockId: 'card3.id',
              parentOrder: 0,
              children: [],
              blurhash: 'L3CZt$_NyX4n=|?b00Ip8_IV00IA'
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
              children: []
            },
            {
              id: 'radioQuestion1.id',
              __typename: 'RadioQuestionBlock',
              parentBlockId: 'card3.id',
              parentOrder: 2,
              label: 'Do you need to change to be good enough for God?',
              description: '',
              children: [
                {
                  id: 'radioOption1.id',
                  __typename: 'RadioOptionBlock',
                  parentBlockId: 'radioQuestion1.id',
                  parentOrder: 0,
                  label: 'Yes, God likes good people',
                  action: {
                    parentBlockId: 'radioQuestion1.id',
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
                    parentBlockId: 'radioQuestion1.id',
                    __typename: 'NavigateAction',
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
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
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
              id: 'button2.id',
              parentBlockId: 'card4.id',
              parentOrder: 4,
              label: 'Start Over',
              buttonVariant: ButtonVariant.contained,
              buttonColor: ButtonColor.primary,
              size: ButtonSize.large,
              startIconId: null,
              endIconId: null,
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
  it('sets action on card click', async () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
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
      action: null,
      children: []
    }

    const result = jest.fn(() => ({
      data: {
        blockUpdateNavigateToBlockAction: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
          gtmEventName: 'gtmEventName',
          blockId: 'step2.id'
        }
      }
    }))
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: NAVIGATE_TO_BLOCK_ACTION_UPDATE,
              variables: {
                id: selectedBlock.id,
                journeyId: 'journeyId',
                input: {
                  blockId: 'step2.id'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider
          value={
            {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base
            } as unknown as Journey
          }
        >
          <EditorProvider initialState={{ steps, selectedBlock }}>
            <NavigateToBlockAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('preview-step2.id'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
