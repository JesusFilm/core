import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { TextResponseType } from '../../../../../../../../__generated__/globalTypes'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_BLOCK_CREATE } from './NewTextResponseButton'

import { NewTextResponseButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewTextResponseButton', () => {
  const request = {
    query: TEXT_RESPONSE_BLOCK_CREATE,
    variables: {
      input: {
        id: 'textResponseBlock.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: 'Your answer here'
      }
    }
  }

  const result = jest.fn(() => ({
    data: {
      textResponseBlockCreate: {
        __typename: 'TextResponseBlock',
        id: 'textResponseBlock.id',
        parentBlockId: 'card.id',
        parentOrder: 0,
        label: 'Your answer here',
        hint: null,
        minRows: null
      }
    }
  }))

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: null,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [
      {
        id: 'card.id',
        __typename: 'CardBlock',
        parentBlockId: 'step.id',
        coverBlockId: null,
        parentOrder: 0,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: []
      }
    ]
  }

  beforeEach(() => jest.clearAllMocks())

  it('should create a new TextResponseBlock', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should undo when undo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
    const deleteResult = jest.fn().mockResolvedValue({
      ...deleteBlock.result,
      type: TextResponseType.freeForm
    })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'textResponseBlock.id'
        }
      },
      result: deleteResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result
          },
          {
            ...deleteBlockMock,
            result: deleteResult
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <CommandUndoItem variant="button" />
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Text Input' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo when redo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
    const deleteResult = jest.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'textResponseBlock.id'
        }
      },
      result: deleteResult
    }

    const restoreResult = jest
      .fn()
      .mockResolvedValue({ ...blockRestore.result })

    const blockRestoreMock = {
      ...blockRestore,
      request: {
        ...blockRestore.request,
        variables: { id: 'textResponseBlock.id' }
      },
      result: restoreResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request,
            result
          },
          {
            ...deleteBlockMock,
            result: deleteResult
          },
          { ...blockRestoreMock, result: restoreResult }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <CommandRedoItem variant="button" />
            <CommandUndoItem variant="button" />
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Text Input' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
  })

  it('should update cache', async () => {
    mockUuidv4.mockReturnValueOnce('textResponseBlock.id')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey.id': {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request,
            result
          }
        ]}
      >
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() =>
      expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
        { __ref: 'TextResponseBlock:textResponseBlock.id' }
      ])
    )
  })

  it('should disable when loading', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewTextResponseButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
