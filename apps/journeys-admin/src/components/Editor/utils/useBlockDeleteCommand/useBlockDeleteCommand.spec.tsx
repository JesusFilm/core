import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

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

import { useBlockDeleteCommand } from './useBlockDeleteCommand'

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
})
