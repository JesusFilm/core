import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardVideoCreate,
  CardVideoCreateVariables
} from '../../../../../../../../../__generated__/CardVideoCreate'
import {
  CardVideoDelete,
  CardVideoDeleteVariables
} from '../../../../../../../../../__generated__/CardVideoDelete'
import {
  CardVideoRestore,
  CardVideoRestoreVariables
} from '../../../../../../../../../__generated__/CardVideoRestore'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_VIDEO_CREATE,
  CARD_VIDEO_DELETE,
  CARD_VIDEO_RESTORE
} from './CardVideo'

import { CardVideo } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardVideo', () => {
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
  const cardVideoDeleteMock: MockedResponse<
    CardVideoDelete,
    CardVideoDeleteVariables
  > = {
    request: {
      query: CARD_VIDEO_DELETE,
      variables: {
        videoId: 'videoBlockId'
      }
    },
    result: {
      data: {
        video: [
          {
            __typename: 'VideoBlock',
            id: 'videoBlockId',
            parentBlockId: 'cardId',
            parentOrder: 0,
            muted: false,
            autoplay: true,
            startAt: 2048,
            endAt: 2058,
            posterBlockId: null,
            fullsize: true,
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529',
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            image: null,
            duration: null,
            objectFit: null,
            mediaVideo: null,
            action: null
          }
        ]
      }
    }
  }

  const cardVideoCreateMock: MockedResponse<
    CardVideoCreate,
    CardVideoCreateVariables
  > = {
    request: {
      query: CARD_VIDEO_CREATE,
      variables: {
        videoInput: {
          id: 'videoBlockId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          startAt: 2048,
          endAt: 2058,
          autoplay: true,
          muted: false,
          source: VideoBlockSource.internal
        }
      }
    },
    result: {
      data: {
        video: {
          __typename: 'VideoBlock',
          id: 'videoBlockId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          muted: false,
          autoplay: true,
          startAt: 2048,
          endAt: 2058,
          posterBlockId: null,
          fullsize: true,
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          source: VideoBlockSource.internal,
          title: null,
          description: null,
          image: null,
          duration: null,
          objectFit: null,
          mediaVideo: null,
          action: null
        }
      }
    }
  }

  const cardVideoRestoreMock: MockedResponse<
    CardVideoRestore,
    CardVideoRestoreVariables
  > = {
    request: {
      query: CARD_VIDEO_RESTORE,
      variables: {
        videoId: 'videoBlockId'
      }
    },
    result: {
      data: {
        video: [
          {
            __typename: 'VideoBlock',
            id: 'videoBlockId',
            parentBlockId: 'cardId',
            parentOrder: 0,
            muted: false,
            autoplay: true,
            startAt: 2048,
            endAt: 2058,
            posterBlockId: null,
            fullsize: true,
            videoId: '1_jf-0-0',
            videoVariantLanguageId: '529',
            source: VideoBlockSource.internal,
            title: null,
            description: null,
            image: null,
            duration: null,
            objectFit: null,
            mediaVideo: null,
            action: null
          }
        ]
      }
    }
  }

  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('videoBlockId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardVideoCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo />
            <TestEditorState />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'VideoBlock:videoBlockId' }
      ])
    })
  })

  it('should select videoblock on click', async () => {
    mockUuidv4.mockReturnValueOnce('videoBlockId')

    const { getByRole, getByText } = render(
      <MockedProvider mocks={[cardVideoCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo />
            <TestEditorState />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() => {
      expect(getByText('selectedBlockId: videoBlockId')).toBeInTheDocument()
    })
  })

  it('should undo card video', async () => {
    mockUuidv4.mockReturnValueOnce('videoBlockId')

    const result = jest.fn().mockResolvedValue(cardVideoCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardVideoDeleteMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardVideoCreateMock, result },
          { ...cardVideoDeleteMock, result: result2 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })
  })

  it('should redo card video', async () => {
    mockUuidv4.mockReturnValueOnce('videoBlockId')

    const result = jest.fn().mockResolvedValue(cardVideoCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardVideoDeleteMock.result)
    const result3 = jest.fn().mockResolvedValue(cardVideoRestoreMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardVideoCreateMock, result },
          { ...cardVideoDeleteMock, result: result2 },
          { ...cardVideoRestoreMock, result: result3 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardVideo />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Video Template' }))
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
