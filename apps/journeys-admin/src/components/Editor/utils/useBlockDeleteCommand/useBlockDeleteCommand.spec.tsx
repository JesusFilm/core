import { gql } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_MultiselectBlock as MultiselectBlock,
  BlockFields_MultiselectOptionBlock as MultiselectOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { BLOCK_DELETE } from '../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation'
import {
  deleteCardBlockMock,
  deleteStepMock,
  selectedStep
} from '../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import {
  cardBlock,
  restoreStepMock,
  useBlockRestoreMutationMock
} from '../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandUndoItem } from '../../Toolbar/Items/CommandUndoItem'

import { MULTISELECT_BLOCK_UPDATE as multiselectUpdateDoc , useBlockDeleteCommand } from './useBlockDeleteCommand'

describe('useBlockDeleteCommand', () => {
  const initiatEditorState = {
    steps: [selectedStep],
    selectedStep,
    selectedBlock: cardBlock
  }

  it('should call block delete for step block', async () => {
    const deleteStepMockResult = jest.fn(() => ({
      ...deleteStepMock.result
    }))
    const useBlockRestoreMutationMockResult = jest.fn(() => ({
      ...restoreStepMock.result
    }))
    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...deleteStepMock,
              result: deleteStepMockResult
            },
            {
              ...restoreStepMock,
              result: useBlockRestoreMutationMockResult
            }
          ]}
        >
          <EditorProvider
            initialState={{
              ...initiatEditorState,
              selectedBlock: selectedStep
            }}
          >
            <JourneyProvider
              value={{ journey: { ...defaultJourney, id: 'journey-id' } }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                {children}
              </CommandProvider>
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current.addBlockDelete(selectedStep)
    await waitFor(() => {
      expect(deleteStepMockResult).toHaveBeenCalled()
    })
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => {
      expect(useBlockRestoreMutationMockResult).toHaveBeenCalled()
    })
  })

  it('should call block delete for non step block', async () => {
    const deleteCardBlockMockResult = jest.fn(() => ({
      ...deleteCardBlockMock.result
    }))
    const useBlockRestoreMutationMockResult = jest.fn(() => ({
      ...useBlockRestoreMutationMock.result
    }))

    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              ...deleteCardBlockMock,
              result: deleteCardBlockMockResult
            },
            {
              ...useBlockRestoreMutationMock,
              result: useBlockRestoreMutationMockResult
            }
          ]}
        >
          <EditorProvider initialState={initiatEditorState}>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, id: 'journey-id' } }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                {children}
              </CommandProvider>
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    result.current.addBlockDelete({ ...cardBlock, id: 'blockId' })
    await waitFor(() => {
      expect(deleteCardBlockMockResult).toHaveBeenCalled()
    })
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => {
      expect(useBlockRestoreMutationMockResult).toHaveBeenCalled()
    })
  })

  it('should reduce parent multiselect max when deleting an option', async () => {
    const multiselect: TreeBlock<MultiselectBlock> = {
      __typename: 'MultiselectBlock',
      id: 'multiselect1',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      min: 0,
      max: 2,
      children: []
    }
    const option1: TreeBlock<MultiselectOptionBlock> = {
      __typename: 'MultiselectOptionBlock',
      id: 'option1',
      parentBlockId: multiselect.id,
      parentOrder: 0,
      label: 'A',
      children: []
    }
    const option2: TreeBlock<MultiselectOptionBlock> = {
      __typename: 'MultiselectOptionBlock',
      id: 'option2',
      parentBlockId: multiselect.id,
      parentOrder: 1,
      label: 'B',
      children: []
    }
    multiselect.children = [option1, option2]

    const card: TreeBlock<CardBlock> = {
      __typename: 'CardBlock',
      id: 'card1.id',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [multiselect]
    }
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journey-id',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      slug: null,
      children: [card]
    }

    // using imported document from the implementation for consistency

    const blockDeleteMockResult = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            __typename: 'MultiselectOptionBlock',
            id: option1.id,
            parentOrder: option1.parentOrder
          }
        ]
      }
    }))
    const multiselectUpdateMockResult = jest.fn(() => ({
      data: {
        multiselectBlockUpdate: {
          __typename: 'MultiselectBlock',
          id: multiselect.id,
          parentBlockId: multiselect.parentBlockId,
          parentOrder: multiselect.parentOrder,
          min: multiselect.min,
          max: 1
        }
      }
    }))

    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: { id: option1.id }
              },
              result: blockDeleteMockResult
            },
            {
              request: {
                query: multiselectUpdateDoc,
                variables: {
                  id: multiselect.id,
                  input: { max: 1 }
                }
              },
              result: multiselectUpdateMockResult
            }
          ]}
        >
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              selectedBlock: card
            }}
          >
            <JourneyProvider
              value={{ journey: { ...defaultJourney, id: 'journey-id' } }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                {children}
              </CommandProvider>
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })

    result.current.addBlockDelete(option1)

    await waitFor(() => {
      expect(blockDeleteMockResult).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(multiselectUpdateMockResult).toHaveBeenCalled()
    })
  })

  it('should not change max when parent max is null', async () => {
    const multiselect: TreeBlock<MultiselectBlock> = {
      __typename: 'MultiselectBlock',
      id: 'multiselect2',
      parentBlockId: 'card1.id',
      parentOrder: 0,
      min: 0,
      max: null,
      children: []
    }
    const option1: TreeBlock<MultiselectOptionBlock> = {
      __typename: 'MultiselectOptionBlock',
      id: 'optA',
      parentBlockId: multiselect.id,
      parentOrder: 0,
      label: 'A',
      children: []
    }
    const option2: TreeBlock<MultiselectOptionBlock> = {
      __typename: 'MultiselectOptionBlock',
      id: 'optB',
      parentBlockId: multiselect.id,
      parentOrder: 1,
      label: 'B',
      children: []
    }
    multiselect.children = [option1, option2]

    const card: TreeBlock<CardBlock> = {
      __typename: 'CardBlock',
      id: 'card1.id',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [multiselect]
    }
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journey-id',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      slug: null,
      children: [card]
    }

    const blockDeleteMockResult = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            __typename: 'MultiselectOptionBlock',
            id: option1.id,
            parentOrder: option1.parentOrder
          }
        ]
      }
    }))

    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: { id: option1.id }
              },
              result: blockDeleteMockResult
            }
            // Intentionally do NOT include a multiselect update mock, since update should not fire when max is null
          ]}
        >
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              selectedBlock: card
            }}
          >
            <JourneyProvider
              value={{ journey: { ...defaultJourney, id: 'journey-id' } }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                {children}
              </CommandProvider>
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })

    result.current.addBlockDelete(option1)

    await waitFor(() => {
      expect(blockDeleteMockResult).toHaveBeenCalled()
    })
    // Ensure no unexpected multiselect update was executed
    // Apollo would throw an Unhandled error if an unmocked request was made during the test
  })
})
