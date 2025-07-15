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
} from '../../../../../../../../../__generated__/CardIntroCreate'
import {
  CardIntroDelete,
  CardIntroDeleteVariables
} from '../../../../../../../../../__generated__/CardIntroDelete'
import {
  CardIntroRestore,
  CardIntroRestoreVariables
} from '../../../../../../../../../__generated__/CardIntroRestore'
import {
  ButtonVariant,
  IconName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_INTRO_CREATE,
  CARD_INTRO_DELETE,
  CARD_INTRO_RESTORE
} from './CardIntro'

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
    backdropBlur: null,
    children: []
  }
  const step: TreeBlock = {
    id: 'stepId',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
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
          id: 'subtitleId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: 'Interactive Video',
          variant: TypographyVariant.h6,
          settings: {
            color: null
          }
        },
        titleInput: {
          id: 'titleId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: "Jesus: History's Most Influential Figure?",
          variant: TypographyVariant.h1,
          settings: {
            color: null
          }
        },
        bodyInput: {
          id: 'bodyId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content:
            'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.',
          variant: TypographyVariant.body1,
          settings: {
            color: null
          }
        },
        buttonInput: {
          id: 'buttonId',
          size: null,
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
          id: 'videoId',
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
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          },
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
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          },
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
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          },
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
          submitEnabled: null,
          action: null,
          settings: null,
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
          submitEnabled: null,
          action: null,
          settings: null,
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
          mediaVideo: {
            id: '1_jf-0-0',
            title: [
              {
                value: 'JESUS',
                __typename: 'VideoTitle'
              }
            ],
            images: [
              {
                __typename: 'CloudflareImage',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            variant: {
              id: '1_529-jf-0-0',
              hls: 'https://arc.gt/j67rz',
              __typename: 'VideoVariant'
            },
            variantLanguages: [],
            __typename: 'Video'
          },
          action: null,
          __typename: 'VideoBlock'
        }
      }
    }
  }

  const cardIntroDeleteMock: MockedResponse<
    CardIntroDelete,
    CardIntroDeleteVariables
  > = {
    request: {
      query: CARD_INTRO_DELETE,
      variables: {
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        bodyId: 'bodyId',
        buttonId: 'buttonId',
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        videoId: 'videoId'
      }
    },
    result: {
      data: {
        subtitle: [],
        title: [],
        body: [],
        button: [],
        startIcon: [],
        endIcon: [],
        video: []
      }
    }
  }

  const cardIntroRestoreMock: MockedResponse<
    CardIntroRestore,
    CardIntroRestoreVariables
  > = {
    request: {
      query: CARD_INTRO_RESTORE,
      variables: {
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        bodyId: 'bodyId',
        buttonId: 'buttonId',
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        videoId: 'videoId'
      }
    },
    result: {
      data: {
        subtitle: [],
        title: [],
        body: [],
        button: [],
        startIcon: [],
        endIcon: [],
        video: []
      }
    }
  }

  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('videoId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })
    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardIntroCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardIntro />
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

  it('should undo a card intro create', async () => {
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('videoId')

    const result = jest.fn().mockReturnValue(cardIntroCreateMock.result)
    const result2 = jest.fn().mockReturnValue(cardIntroDeleteMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardIntroCreateMock, result },
          {
            ...cardIntroDeleteMock,
            result: result2
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardIntro />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })
  })

  it('should redo a card intro create', async () => {
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('bodyId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('videoId')

    const result = jest.fn().mockReturnValue(cardIntroCreateMock.result)
    const result2 = jest.fn().mockReturnValue(cardIntroDeleteMock.result)
    const result3 = jest.fn().mockReturnValue(cardIntroRestoreMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardIntroCreateMock, result },
          {
            ...cardIntroDeleteMock,
            result: result2
          },
          {
            ...cardIntroRestoreMock,
            result: result3
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardIntro />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Intro Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })

    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => {
      expect(result3).toHaveBeenCalled()
    })
  })
})
