import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardPollCreate,
  CardPollCreateVariables
} from '../../../../../../../../../__generated__/CardPollCreate'
import {
  CardPollDelete,
  CardPollDeleteVariables
} from '../../../../../../../../../__generated__/CardPollDelete'
import {
  CardPollRestore,
  CardPollRestoreVariables
} from '../../../../../../../../../__generated__/CardPollRestore'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_POLL_CREATE,
  CARD_POLL_DELETE,
  CARD_POLL_RESTORE
} from './CardPoll'

import { CardPoll } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardPoll', () => {
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
  const cardPollCreateMock: MockedResponse<
    CardPollCreate,
    CardPollCreateVariables
  > = {
    request: {
      query: CARD_POLL_CREATE,
      variables: {
        imageInput: {
          id: 'imageId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          alt: 'photo-1488048924544-c818a467dacd',
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          height: 3456,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          width: 5184,
          isCover: true,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        subtitleInput: {
          id: 'subtitleId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: 'Got an Opinion?',
          align: null,
          color: null,
          variant: TypographyVariant.h6,
          settings: {
            color: null
          }
        },
        titleInput: {
          id: 'titleId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          align: null,
          color: null,
          content: "Which of Jesus' teachings challenges you the most?",
          variant: TypographyVariant.h2,
          settings: {
            color: null
          }
        },
        radioQuestionInput: {
          id: 'radioQuestionId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId'
        },
        radioOptionInput1: {
          id: 'radioOption1Id',
          journeyId: 'journeyId',
          parentBlockId: 'radioQuestionId',
          label: 'Turning the other cheek'
        },
        radioOptionInput2: {
          id: 'radioOption2Id',
          journeyId: 'journeyId',
          parentBlockId: 'radioQuestionId',
          label: 'Loving your enemies'
        },
        radioOptionInput3: {
          id: 'radioOption3Id',
          journeyId: 'journeyId',
          parentBlockId: 'radioQuestionId',
          label: 'Not worrying about tomorrow'
        },
        radioOptionInput4: {
          id: 'radioOption4Id',
          journeyId: 'journeyId',
          parentBlockId: 'radioQuestionId',
          label: 'Seeking first the kingdom of God'
        },
        bodyInput: {
          id: 'bodyId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: '↑ Select an answer to continue',
          align: null,
          variant: TypographyVariant.caption,
          color: TypographyColor.secondary,
          settings: {
            color: null
          }
        },
        journeyId: 'journeyId',
        cardId: 'cardId',
        cardInput: {
          fullscreen: true
        }
      }
    },
    result: {
      data: {
        image: {
          id: 'imageId',
          parentBlockId: 'cardId',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1488048924544-c818a467dacd',
          width: 5184,
          height: 3456,
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          __typename: 'ImageBlock',
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        subtitle: {
          id: 'subtitleId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Got an Opinion?',
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
          content: "Which of Jesus' teachings challenges you the most?",
          variant: TypographyVariant.h2,
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          },
          __typename: 'TypographyBlock'
        },
        radioQuestion: {
          id: 'radioQuestionId',
          parentBlockId: 'cardId',
          parentOrder: 2,
          __typename: 'RadioQuestionBlock',
          gridView: false
        },
        radioOption1: {
          id: 'radioOption1Id',
          parentBlockId: 'radioQuestionId',
          parentOrder: 0,
          label: 'Turning the other cheek',
          action: null,
          __typename: 'RadioOptionBlock',
          pollOptionImageBlockId: null
        },
        radioOption2: {
          id: 'radioOption2Id',
          parentBlockId: 'radioQuestionId',
          parentOrder: 1,
          label: 'Loving your enemies',
          action: null,
          __typename: 'RadioOptionBlock',
          pollOptionImageBlockId: null
        },
        radioOption3: {
          id: 'radioOption3Id',
          parentBlockId: 'radioQuestionId',
          parentOrder: 2,
          label: 'Not worrying about tomorrow',
          action: null,
          __typename: 'RadioOptionBlock',
          pollOptionImageBlockId: null
        },
        radioOption4: {
          id: 'radioOption4Id',
          parentBlockId: 'radioQuestionId',
          parentOrder: 3,
          label: 'Seeking first the kingdom of God',
          action: null,
          __typename: 'RadioOptionBlock',
          pollOptionImageBlockId: null
        },
        body: {
          id: 'bodyId',
          parentBlockId: 'cardId',
          parentOrder: 3,
          align: null,
          color: TypographyColor.secondary,
          content: '↑ Select an answer to continue',
          variant: TypographyVariant.caption,
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          },
          __typename: 'TypographyBlock'
        },
        cardBlockUpdate: {
          id: 'cardId',
          parentBlockId: 'stepId',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: 'imageId',
          themeMode: null,
          themeName: null,
          fullscreen: true,
          backdropBlur: null,
          __typename: 'CardBlock'
        }
      }
    }
  }

  const cardPollDeleteMock: MockedResponse<
    CardPollDelete,
    CardPollDeleteVariables
  > = {
    request: {
      query: CARD_POLL_DELETE,
      variables: {
        imageId: 'imageId',
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        radioQuestionId: 'radioQuestionId',
        radioOption1Id: 'radioOption1Id',
        radioOption2Id: 'radioOption2Id',
        radioOption3Id: 'radioOption3Id',
        radioOption4Id: 'radioOption4Id',
        bodyId: 'bodyId'
      }
    },
    result: {
      data: {
        imageDelete: [],
        subtitleDelete: [],
        titleDelete: [],
        radioQuestionDelete: [],
        radioOption1Delete: [],
        radioOption2Delete: [],
        radioOption3Delete: [],
        radioOption4Delete: [],
        bodyDelete: []
      }
    }
  }

  const cardPollRestore: MockedResponse<
    CardPollRestore,
    CardPollRestoreVariables
  > = {
    request: {
      query: CARD_POLL_RESTORE,
      variables: {
        imageId: 'imageId',
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        radioQuestionId: 'radioQuestionId',
        radioOption1Id: 'radioOption1Id',
        radioOption2Id: 'radioOption2Id',
        radioOption3Id: 'radioOption3Id',
        radioOption4Id: 'radioOption4Id',
        bodyId: 'bodyId'
      }
    },
    result: {
      data: {
        imageRestore: [],
        subtitleRestore: [],
        titleRestore: [],
        radioQuestionRestore: [],
        radioOption1Restore: [],
        radioOption2Restore: [],
        radioOption3Restore: [],
        radioOption4Restore: [],
        bodyRestore: []
      }
    }
  }

  it('updates card content and updates local cache', async () => {
    mockUuidv4
      .mockReturnValueOnce('imageId')
      .mockReturnValueOnce('subtitleId')
      .mockReturnValueOnce('titleId')
      .mockReturnValueOnce('radioQuestionId')
      .mockReturnValueOnce('radioOption1Id')
      .mockReturnValueOnce('radioOption2Id')
      .mockReturnValueOnce('radioOption3Id')
      .mockReturnValueOnce('radioOption4Id')
      .mockReturnValueOnce('bodyId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardPollCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardPoll />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'RadioQuestionBlock:radioQuestionId' },
        { __ref: 'RadioOptionBlock:radioOption1Id' },
        { __ref: 'RadioOptionBlock:radioOption2Id' },
        { __ref: 'RadioOptionBlock:radioOption3Id' },
        { __ref: 'RadioOptionBlock:radioOption4Id' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })

  it('undoes a card poll template create', async () => {
    mockUuidv4
      .mockReturnValueOnce('imageId')
      .mockReturnValueOnce('subtitleId')
      .mockReturnValueOnce('titleId')
      .mockReturnValueOnce('radioQuestionId')
      .mockReturnValueOnce('radioOption1Id')
      .mockReturnValueOnce('radioOption2Id')
      .mockReturnValueOnce('radioOption3Id')
      .mockReturnValueOnce('radioOption4Id')
      .mockReturnValueOnce('bodyId')
    const result = jest.fn().mockResolvedValue(cardPollCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardPollDeleteMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardPollCreateMock, result },
          {
            ...cardPollDeleteMock,
            result: result2
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardPoll />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('redoes a card poll template create', async () => {
    mockUuidv4
      .mockReturnValueOnce('imageId')
      .mockReturnValueOnce('subtitleId')
      .mockReturnValueOnce('titleId')
      .mockReturnValueOnce('radioQuestionId')
      .mockReturnValueOnce('radioOption1Id')
      .mockReturnValueOnce('radioOption2Id')
      .mockReturnValueOnce('radioOption3Id')
      .mockReturnValueOnce('radioOption4Id')
      .mockReturnValueOnce('bodyId')
    const result = jest.fn().mockResolvedValue(cardPollCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardPollDeleteMock.result)
    const result3 = jest.fn().mockResolvedValue(cardPollRestore.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardPollCreateMock, result },
          {
            ...cardPollDeleteMock,
            result: result2
          },
          {
            ...cardPollRestore,
            result: result3
          }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardPoll />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Poll Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
