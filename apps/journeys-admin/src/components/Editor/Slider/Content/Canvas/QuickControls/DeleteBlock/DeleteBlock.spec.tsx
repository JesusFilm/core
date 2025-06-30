import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockDelete } from '../../../../../../../../__generated__/BlockDelete'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { BLOCK_DELETE } from '../../../../../../../libs/useBlockDeleteMutation'
import {
  block1,
  block2,
  deleteBlockMock,
  deleteStepMock,
  selectedBlock,
  selectedStep
} from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { restoreStepMock } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { DeleteBlock } from './DeleteBlock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('DeleteBlock', () => {
  it('should delete a block on button click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: 'CardBlock:card1.id' },
          { __ref: 'TypographyBlock:typography0.id' }
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
          { __ref: 'CardBlock:card1.id' },
          { __ref: 'TypographyBlock:typography0.id' }
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
          { __ref: 'StepBlock:stepId' },
          { __ref: 'CardBlock:blockId' },
          { __ref: 'TypographyBlock:typography0.id' }
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
    const deleteCardResultMock = jest.fn(() => ({ ...deleteStepMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteStepMock, result: deleteCardResultMock }]}
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
          { __ref: 'StepBlock:stepId' },
          { __ref: 'CardBlock:blockId' },
          { __ref: 'TypographyBlock:typography0.id' }
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
    const deleteCardResultMock = jest.fn(() => ({ ...deleteStepMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[{ ...deleteStepMock, result: deleteCardResultMock }]}
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
      slug: null,
      children: [
        {
          id: 'blockId',
          __typename: 'CardBlock',
          parentBlockId: 'passedInStepId',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          children: [selectedBlock, block1, block2]
        }
      ]
    }

    const passedInStepDeleteMock: MockedResponse<BlockDelete> = {
      request: {
        query: BLOCK_DELETE,
        variables: {
          id: passedInStep.id
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
          { __ref: 'StepBlock:passedInStepId' },
          { __ref: 'CardBlock:blockId' },
          { __ref: 'TypographyBlock:typography0.id' }
        ],
        id: 'journey-id',
        __typename: 'Journey'
      }
    })

    const deleteCardResultMock = jest.fn(() => ({ ...deleteStepMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...deleteStepMock, result: deleteCardResultMock },
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
                selectedBlock: passedInStep,
                selectedStep: passedInStep,
                steps: [passedInStep, selectedStep]
              }}
            >
              <TestEditorState />
              <DeleteBlock variant="list-item" block={passedInStep} />
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
      ...restoreStepMock.result
    }))
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        blocks: [
          { __ref: 'StepBlock:stepId' },
          { __ref: 'CardBlock:blockId' },
          { __ref: 'TypographyBlock:typography0.id' }
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
    const deleteCardResultMock = jest.fn(() => ({ ...deleteStepMock.result }))
    render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            { ...deleteStepMock, result: deleteCardResultMock },
            { ...restoreStepMock, result: restoreCardMockResult }
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
