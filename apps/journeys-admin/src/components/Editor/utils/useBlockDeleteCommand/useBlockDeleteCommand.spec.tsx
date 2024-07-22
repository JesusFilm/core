import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  deleteCardBlockMock,
  deleteStepMock,
  selectedStep
} from '../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { cardBlock } from '../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { useBlockDeleteCommand } from './useBlockDeleteCommand'

describe('useBlockDeleteCommand', () => {
  const initiatEditorState = {
    steps: [selectedStep],
    selectedStep: selectedStep,
    selectedBlock: cardBlock
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call block delete for step', async () => {
    const deleteStepMockResult = jest.fn(() => ({
      ...deleteStepMock.result
    }))

    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...deleteStepMock, result: deleteStepMockResult }]}
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
              {children}
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      await waitFor(async () => {
        await result.current.addBlockDelete(selectedStep)
      })
      await waitFor(async () => {
        await expect(deleteStepMockResult).toHaveBeenCalled()
      })
    })
  })

  it('should call block delete for non step blocks', async () => {
    const deleteCardBlockMockResult = jest.fn(() => ({
      ...deleteCardBlockMock.result
    }))

    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            { ...deleteCardBlockMock, result: deleteCardBlockMockResult }
          ]}
        >
          <EditorProvider initialState={initiatEditorState}>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, id: 'journey-id' } }}
            >
              {children}
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      await waitFor(async () => {
        await result.current.addBlockDelete(cardBlock)
      })
      await waitFor(async () => {
        await expect(deleteCardBlockMockResult).toHaveBeenCalled()
      })
    })
  })
})
