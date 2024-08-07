import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockDuplicate } from '../../../../../../../../__generated__/BlockDuplicate'
import { BlockFields_TypographyBlock as TypographyBlock } from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import {
  deleteBlockMock,
  selectedStep
} from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestoreMock } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { BLOCK_DUPLICATE, DuplicateBlock } from './DuplicateBlock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  v4: () => 'newBlockId'
}))

describe('DuplicateBlock', () => {
  const block: TreeBlock<TypographyBlock> = {
    id: 'typography0.id',
    __typename: 'TypographyBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    content: 'Title',
    variant: TypographyVariant.h1,
    color: TypographyColor.primary,
    align: TypographyAlign.center,
    children: []
  }

  const blockOrder = block?.parentOrder != null ? block.parentOrder : 0

  const duplicateBlockMock: MockedResponse<BlockDuplicate> = {
    request: {
      query: BLOCK_DUPLICATE,
      variables: {
        id: block.id,
        journeyId: 'journeyId',
        parentOrder: blockOrder + 1,
        idMap: [
          {
            oldId: block.id,
            newId: 'newBlockId'
          }
        ]
      }
    },
    result: {
      data: {
        blockDuplicate: [
          {
            __typename: 'TypographyBlock',
            id: 'duplicatedId'
          } as unknown as TypographyBlock
        ]
      }
    }
  }

  it('should duplicate a block on button click', async () => {
    const duplicateBlockResultMock = jest.fn(() => ({
      ...duplicateBlockMock.result
    }))
    render(
      <MockedProvider
        mocks={[{ ...duplicateBlockMock, result: duplicateBlockResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedBlock: block, selectedStep }}
            >
              <DuplicateBlock />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
  })

  it('should undo duplicating a block', async () => {
    const duplicateBlockResultMock = jest.fn(() => ({
      ...duplicateBlockMock.result
    }))

    const blockDeleteMockResult = jest
      .fn()
      .mockResolvedValue(deleteBlockMock.result)
    render(
      <MockedProvider
        mocks={[
          { ...duplicateBlockMock, result: duplicateBlockResultMock },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'newBlockId' }
            },
            result: blockDeleteMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedBlock: block, selectedStep }}
            >
              <DuplicateBlock />
              <CommandUndoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button', {
      name: 'Duplicate Block Actions'
    })
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Undo'
      })
    )
    await waitFor(() => expect(blockDeleteMockResult).toHaveBeenCalled())
  })

  it('should undo and redo duplicating a block', async () => {
    const duplicateBlockResultMock = jest.fn(() => ({
      ...duplicateBlockMock.result
    }))

    const blockDeleteMockResult = jest
      .fn()
      .mockResolvedValue(deleteBlockMock.result)

    const blockRestoreMockResult = jest
      .fn()
      .mockResolvedValue(blockRestoreMock.result)
    render(
      <MockedProvider
        mocks={[
          { ...duplicateBlockMock, result: duplicateBlockResultMock },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'newBlockId' }
            },
            result: blockDeleteMockResult
          },
          {
            request: {
              ...blockRestoreMock.request,
              variables: { id: 'newBlockId' }
            },
            result: blockRestoreMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedBlock: block, selectedStep }}
            >
              <DuplicateBlock />
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button', {
      name: 'Duplicate Block Actions'
    })
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Undo'
      })
    )
    await waitFor(() => expect(blockDeleteMockResult).toHaveBeenCalled())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Redo'
      })
    )
    await waitFor(() => expect(blockRestoreMockResult).toHaveBeenCalled())
  })

  it('should be disabled if nothing is selected', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled if manually disabling button', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock disabled />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should update cache on block duplication', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: `TypographyBlock:${block.id}` }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const duplicateBlockResultMock = jest.fn(() => ({
      data: {
        blockDuplicate: [
          { __typename: 'TypographyBlock', id: block.id },
          {
            __typename: 'TypographyBlock',
            id: 'duplicatedId'
          }
        ]
      }
    }))
    render(
      <MockedProvider
        cache={cache}
        mocks={[{ ...duplicateBlockMock, result: duplicateBlockResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedBlock: block, selectedStep }}
            >
              <DuplicateBlock />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: `TypographyBlock:${block.id}` },
      { __ref: 'TypographyBlock:duplicatedId' }
    ])
  })
})
