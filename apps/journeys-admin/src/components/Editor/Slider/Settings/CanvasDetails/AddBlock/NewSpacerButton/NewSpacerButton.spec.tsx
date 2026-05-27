import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'
import { type MockedFunction } from 'vitest'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  SpacerBlockCreate,
  SpacerBlockCreateVariables
} from '../../../../../../../../__generated__/SpacerBlockCreate'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { SPACER_BLOCK_CREATE } from './NewSpacerButton'

import { NewSpacerButton } from '.'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

vi.mock('uuid', () => ({
  __esModule: true,
  v4: vi.fn()
}))

const mockUuidv4 = uuidv4 as MockedFunction<typeof uuidv4>

describe('NewSpacerButton', () => {
  const spacerBlockCreateMock: MockedResponse<
    SpacerBlockCreate,
    SpacerBlockCreateVariables
  > = {
    request: {
      query: SPACER_BLOCK_CREATE
    },
    variableMatcher: (variables) => true,
    result: vi.fn(() => ({
      data: {
        spacerBlockCreate: {
          __typename: 'SpacerBlock',
          id: 'spacerBlock.id',
          parentBlockId: 'card.id',
          parentOrder: 0,
          spacing: 100
        }
      }
    })) as MockedResponse<
      SpacerBlockCreate,
      SpacerBlockCreateVariables
    >['result']
  }

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
        backdropBlur: null,
        eventLabel: null,
        children: [],
        showAssistant: null,
        expandChatByDefault: null
      }
    ]
  }

  beforeEach(() => vi.clearAllMocks())

  it('should create a new SpacerBlock', async () => {
    mockUuidv4.mockReturnValueOnce('spacerBlock.id')

    const { getByRole } = render(
      <MockedProvider mocks={[spacerBlockCreateMock]}>
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewSpacerButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(spacerBlockCreateMock.result).toHaveBeenCalled())
  })

  it('should undo when undo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('spacerBlock.id')
    const deleteResult = vi.fn().mockResolvedValue({
      ...deleteBlock.result
    })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'spacerBlock.id'
        }
      },
      result: deleteResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          spacerBlockCreateMock,
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
            <NewSpacerButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Spacer' }))
    await waitFor(() => expect(spacerBlockCreateMock.result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo when redo clicked', async () => {
    mockUuidv4.mockReturnValueOnce('spacerBlock.id')
    const deleteResult = vi.fn().mockResolvedValue({ ...deleteBlock.result })
    const deleteBlockMock = {
      ...deleteBlock,
      request: {
        ...deleteBlock.request,
        variables: {
          id: 'spacerBlock.id'
        }
      },
      result: deleteResult
    }

    const restoreResult = vi
      .fn()
      .mockResolvedValue({ ...blockRestore.result })

    const blockRestoreMock = {
      ...blockRestore,
      request: {
        ...blockRestore.request,
        variables: { id: 'spacerBlock.id' }
      },
      result: restoreResult
    }

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          spacerBlockCreateMock,
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
            <NewSpacerButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Spacer' }))
    await waitFor(() => expect(spacerBlockCreateMock.result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalled())
  })

  it('should update cache', async () => {
    mockUuidv4.mockReturnValueOnce('spacerBlock.id')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey.id': {
        blocks: [],
        id: 'journey.id',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[spacerBlockCreateMock]}>
        <JourneyProvider
          value={{
            journey: { id: 'journey.id' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewSpacerButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(spacerBlockCreateMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
        { __ref: 'SpacerBlock:spacerBlock.id' }
      ])
    )
  })

  it('should disable when loading', async () => {
    // The click fires SpacerBlockCreate. A never-resolving mock keeps the
    // mutation in flight (button stays disabled) and matches the operation so
    // it does not raise an unhandled Apollo error after the test completes.
    const loadingMock: MockedResponse<
      SpacerBlockCreate,
      SpacerBlockCreateVariables
    > = {
      request: { query: SPACER_BLOCK_CREATE },
      variableMatcher: () => true,
      delay: Infinity,
      result: {}
    }

    const { getByRole } = render(
      <MockedProvider mocks={[loadingMock]}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider initialState={{ selectedStep }}>
            <NewSpacerButton />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    expect(getByRole('button')).toBeDisabled()
  })
})
