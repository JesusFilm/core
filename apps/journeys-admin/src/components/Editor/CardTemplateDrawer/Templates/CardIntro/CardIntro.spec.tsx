import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardIntroCreate,
  CardIntroCreateVariables
} from '../../../../../../__generated__/CardIntroCreate'
import {
  ButtonVariant,
  IconName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'

import { CARD_INTRO_CREATE } from './CardIntro'

import { CardIntro } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardIntro', () => {
  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const card: TreeBlock = {
      id: 'cardId',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: []
    }
    const step: TreeBlock = {
      id: 'stepId',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [card]
    }
    const cardIntroCreateMock: MockedResponse<
      CardIntroCreate,
      CardIntroCreateVariables
    > = {
      request: {
        query: CARD_INTRO_CREATE,
        variables: {
          journeyId: 'journeyId',
          buttonId: 'buttonId',
          subtitleInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content: 'Interactive Video',
            variant: TypographyVariant.h6
          },
          titleInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content: "Jesus: History's Most Influential Figure?",
            variant: TypographyVariant.h1
          },
          bodyInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            content:
              'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
            variant: TypographyVariant.body1
          },
          buttonInput: {
            id: 'buttonId',
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            label: 'Begin the Journey',
            variant: ButtonVariant.contained
          },
          startIconInput: {
            id: 'startIconId',
            journeyId: 'journeyId',
            parentBlockId: 'buttonId'
          },
          endIconInput: {
            id: 'endIconId',
            journeyId: 'journeyId',
            parentBlockId: 'buttonId',
            name: IconName.ArrowForwardRounded
          },
          buttonUpdateInput: {
            startIconId: 'startIconId',
            endIconId: 'endIconId'
          },
          videoInput: {
            journeyId: 'journeyId',
            parentBlockId: 'cardId',
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529',
            startAt: 2048,
            endAt: 2058,
            isCover: true,
            source: VideoBlockSource.internal
          }
        }
      },
      result: {
        data: {
          subtitle: {
            id: 'subtitleId',
            parentBlockId: 'cardId',
            parentOrder: 0,
            align: null,
            color: null,
            content: 'Interactive Video',
            variant: TypographyVariant.h6,
            __typename: 'TypographyBlock'
          },
          title: {
            id: 'titleId',
            parentBlockId: 'cardId',
            parentOrder: 1,
            align: null,
            color: null,
            content: "Jesus: History's Most Influential Figure?",
            variant: TypographyVariant.h1,
            __typename: 'TypographyBlock'
          },
          body: {
            id: 'bodyId',
            parentBlockId: 'cardId',
            parentOrder: 2,
            align: null,
            color: null,
            content:
              'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
            variant: TypographyVariant.body1,
            __typename: 'TypographyBlock'
          },
          button: {
            id: 'buttonId',
            parentBlockId: 'cardId',
            parentOrder: 3,
            label: 'Begin the Journey',
            buttonVariant: ButtonVariant.contained,
            buttonColor: null,
            size: null,
            startIconId: null,
            endIconId: null,
            action: null,
            __typename: 'ButtonBlock'
          },
          startIcon: {
            id: 'startIconId',
            parentBlockId: 'buttonId',
            parentOrder: null,
            iconName: null,
            iconSize: null,
            iconColor: null,
            __typename: 'IconBlock'
          },
          endIcon: {
            id: 'endIconId',
            parentBlockId: 'buttonId',
            parentOrder: null,
            iconName: IconName.ArrowForwardRounded,
            iconSize: null,
            iconColor: null,
            __typename: 'IconBlock'
          },
          buttonBlockUpdate: {
            id: 'buttonId',
            parentBlockId: 'cardId',
            parentOrder: 3,
            label: 'Begin the Journey',
            buttonVariant: ButtonVariant.contained,
            buttonColor: null,
            size: null,
            startIconId: 'startIconId',
            endIconId: 'endIconId',
            action: null,
            __typename: 'ButtonBlock'
          },
          video: {
            id: 'videoId',
            parentBlockId: 'cardId',
            parentOrder: null,
            muted: null,
            autoplay: null,
            startAt: 2048,
            endAt: 2058,
            posterBlockId: null,
            fullsize: null,
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529',
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            image: null,
            duration: null,
            objectFit: null,
            video: {
              id: '1_jf-0-0',
              title: [
                {
                  value: 'JESUS',
                  __typename: 'Translation'
                }
              ],
              image:
                'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg?version=2',
              variant: {
                id: '1_529-jf-0-0',
                hls: 'https://arc.gt/j67rz',
                __typename: 'VideoVariant'
              },
              __typename: 'Video'
            },
            action: {
              parentBlockId: 'videoId',
              gtmEventName: 'NavigateAction',
              __typename: 'NavigateAction'
            },
            __typename: 'VideoBlock'
          }
        }
      }
    }
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardIntroCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardIntro onClick={jest.fn()} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'TypographyBlock:bodyId' },
        { __ref: 'ButtonBlock:buttonId' },
        { __ref: 'IconBlock:startIconId' },
        { __ref: 'IconBlock:endIconId' },
        { __ref: 'VideoBlock:videoId' }
      ])
    })
  })
})
