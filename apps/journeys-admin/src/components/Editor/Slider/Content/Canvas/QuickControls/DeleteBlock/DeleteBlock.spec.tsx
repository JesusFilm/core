import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockDelete } from '../../../../../../../../__generated__/BlockDelete'
import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { BLOCK_DELETE } from '../../../../../../../libs/useBlockDeleteMutation'
import { deleteBlockMock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'

import { BlockRestore } from '../../../../../../../../__generated__/BlockRestore'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'
import { BLOCK_RESTORE, DeleteBlock } from './DeleteBlock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('DeleteBlock', () => {
  const selectedBlock: TreeBlock<TypographyBlock> = {
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
  const block1: TreeBlock<TypographyBlock> = {
    ...selectedBlock,
    id: 'typography1.id',
    parentOrder: 1
  }
  const block2: TreeBlock<TypographyBlock> = {
    ...selectedBlock,
    id: 'typography2.id',
    parentOrder: 2
  }

  const selectedStep: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'stepId',
    parentBlockId: 'journey-id',
    parentOrder: 0,
    locked: true,
    nextBlockId: null,
    children: [
      {
        id: 'card1.id',
        __typename: 'CardBlock',
        parentBlockId: 'stepId',
        parentOrder: 0,
        coverBlockId: null,
        backgroundColor: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [selectedBlock, block1, block2]
      }
    ]
  }

  const deleteCardMock: MockedResponse<BlockDelete> = {
    request: {
      query: BLOCK_DELETE,
      variables: {
        id: selectedStep.id,
        parentBlockId: selectedStep.parentBlockId,
        journeyId: 'journey-id'
      }
    },
    result: {
      data: {
        blockDelete: [
          {
            __typename: 'StepBlock',
            id: selectedStep.id,
            parentOrder: selectedStep.parentOrder,
            nextBlockId: null
          }
        ]
      }
    }
  }

  const restoreCardMock: MockedResponse<BlockRestore> = {
    request: {
      query: BLOCK_RESTORE,
      variables: {
        blockRestoreId: selectedStep.id
      }
    },
    result: {
      data: {
        blockRestore: [
          {
            ...selectedStep,
            x: 1,
            y: 1
          },
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            parentBlockId: 'stepId',
            parentOrder: 0,
            coverBlockId: null,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false
          },
          selectedBlock,
          block1,
          block2
        ]
      }
    }
  }

  it('should delete a block on button click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const deleteBlockResultMock = jest.fn(() => ({ ...deleteBlockMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteBlockMock, result: deleteBlockResultMock }]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toContainElement(
      screen.getByTestId('Trash2Icon')
    )
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(deleteBlockResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete a block on menu item click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const deleteBlockResultMock = jest.fn(() => ({ ...deleteBlockMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteBlockMock, result: deleteBlockResultMock }]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Delete Block' })
    )
    await waitFor(() => expect(deleteBlockResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete card on button click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `StepBlock:stepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:stepId': {
        ...selectedStep
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const deleteCardResultMock = jest.fn(() => ({ ...deleteCardMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteCardMock, result: deleteCardResultMock }]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByRole('button')).toContainElement(
      screen.getByTestId('Trash2Icon')
    )
    await userEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Delete Card?' })
      ).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteCardResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])
  })

  it('should delete card on menu click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `StepBlock:stepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:stepId': {
        ...selectedStep
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const deleteCardResultMock = jest.fn(() => ({ ...deleteCardMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteCardMock, result: deleteCardResultMock }]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Delete Card?' })
      ).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteCardResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })

  it('should be disabled if nothing is selected', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant="button" />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled if manually disabling button', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant="button" disabled />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should delete the card that is passed in', async () => {
    const passedInStep: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'passedInStepId',
      parentBlockId: 'journey-id',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'passedInStepId',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: [selectedBlock, block1, block2]
        }
      ]
    }

    const passedInStepDeleteMock: MockedResponse<BlockDelete> = {
      request: {
        query: BLOCK_DELETE,
        variables: {
          id: passedInStep.id,
          parentBlockId: passedInStep.parentBlockId,
          journeyId: 'journey-id'
        }
      },
      result: jest.fn(() => ({
        data: {
          blockDelete: [
            {
              __typename: 'StepBlock',
              id: passedInStep.id,
              parentOrder: passedInStep.parentOrder,
              nextBlockId: null
            }
          ]
        }
      }))
    }

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `StepBlock:passedInStepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      }
    })

    const deleteCardResultMock = jest.fn(() => ({ ...deleteCardMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...deleteCardMock, result: deleteCardResultMock },
            passedInStepDeleteMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedBlock: { ...selectedStep, id: 'passedInStepId' },
                selectedStep,
                steps: [selectedStep, selectedStep]
              }}
            >
              <DeleteBlock variant="list-item" block={passedInStep} />
              <TestEditorState />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Delete Card?' })
      ).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(passedInStepDeleteMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(deleteCardResultMock).not.toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])

    expect(
      screen.getByText(`selectedBlock: ${selectedStep.id}`)
    ).toBeInTheDocument()
  })

  it('should restore card on undo click', async () => {
    const selectedBlock = selectedStep
    const restoreCardMockResult = jest.fn(() => ({
      ...restoreCardMock.result
    }))
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: `StepBlock:stepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      },
      'StepBlock:stepId': {
        ...selectedStep
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const deleteCardResultMock = jest.fn(() => ({ ...deleteCardMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...deleteCardMock, result: deleteCardResultMock },
            { ...restoreCardMock, result: restoreCardMockResult }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
              <CommandUndoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    // delete the card
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Delete Card?' })
      ).toBeInTheDocument()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteCardResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    )
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )

    // undo the delete
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(restoreCardMockResult).toHaveBeenCalled())
  })
})
