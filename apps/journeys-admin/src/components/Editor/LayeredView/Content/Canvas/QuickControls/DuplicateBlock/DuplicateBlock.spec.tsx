import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockDuplicate,
  BlockDuplicate_blockDuplicate_ButtonBlock
} from '../../../../../../../../__generated__/BlockDuplicate'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
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
    children: [],
    settings: {
      __typename: 'TypographyBlockSettings',
      color: null
    }
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
            id: 'duplicatedId',
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
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
          {
            __typename: 'TypographyBlock',
            id: block.id,
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
          },
          {
            __typename: 'TypographyBlock',
            id: 'duplicatedId',
            settings: {
              __typename: 'TypographyBlockSettings',
              color: null
            }
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

  it('should return button with submitEnabled=false on the optimistic response when duplicating a submit button', async () => {
    const buttonBlock: TreeBlock<ButtonBlock> = {
      id: 'button0.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      label: 'Submit',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      submitEnabled: true,
      action: null,
      startIconId: null,
      endIconId: null,
      children: [],
      settings: null
    }

    // capture the optimistic response from the mutation
    let capturedOptimisticResponse: BlockDuplicate | null = null

    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockImplementation(() => {
        return [
          (options: any) => {
            capturedOptimisticResponse = options?.optimisticResponse
            return Promise.resolve({ data: { blockDuplicate: [] } })
          },
          { loading: false }
        ]
      })

    render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <EditorProvider
            initialState={{ selectedBlock: buttonBlock, selectedStep }}
          >
            <DuplicateBlock />
          </EditorProvider>
        </JourneyProvider>
      </SnackbarProvider>
    )

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(capturedOptimisticResponse).not.toBeNull()

    // Assert the optimistic response returns the selected block and the duplicated block
    expect(capturedOptimisticResponse!.blockDuplicate.length).toEqual(2)

    // Cast to ButtonBlock type since we know these are button blocks
    const originalButton = capturedOptimisticResponse!
      .blockDuplicate[0] as BlockDuplicate_blockDuplicate_ButtonBlock
    const duplicatedButton = capturedOptimisticResponse!
      .blockDuplicate[1] as BlockDuplicate_blockDuplicate_ButtonBlock

    expect(originalButton.id).toBe(buttonBlock.id)
    expect(originalButton.submitEnabled).toBe(true)

    // Assert that the duplicated button has the new id and submitEnabled=false
    expect(duplicatedButton.id).toBe('newBlockId')
    expect(duplicatedButton.submitEnabled).toBe(false)

    jest.restoreAllMocks()
  })
})
