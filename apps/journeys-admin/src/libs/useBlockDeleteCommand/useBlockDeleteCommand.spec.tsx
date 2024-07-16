import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { CommandUndoItem } from '../../components/Editor/Toolbar/Items/CommandUndoItem'
import {
  deleteCardBlockMock,
  deleteStepMock,
  selectedStep
} from '../useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { cardBlock } from '../useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { useBlockDeleteCommand } from './useBlockDeleteCommand'

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue
    }
  }
}))

const mockEnqueue = jest.fn()

describe('useBlockDeleteCommand', () => {
  const initiatEditorState = {
    steps: [selectedStep],
    selectedStep: selectedStep,
    selectedBlock: cardBlock
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fail if no journey found', async () => {
    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <EditorProvider initialState={initiatEditorState}>
            <SnackbarProvider>{children}</SnackbarProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      await waitFor(async () => {
        await result.current.addBlockDelete(selectedStep)
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Delete operation failed, please reload and try again',
          { preventDuplicate: true, variant: 'error' }
        )
      })
      await waitFor(async () => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Delete operation failed, please reload and try again',
          { preventDuplicate: true, variant: 'error' }
        )
      })
    })
  })

  it('should fail if no steps found', async () => {
    const { result } = renderHook(() => useBlockDeleteCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <EditorProvider
            initialState={{
              ...initiatEditorState,
              steps: undefined,
              selectedStep: undefined
            }}
          >
            <JourneyProvider value={{ journey: defaultJourney }}>
              <SnackbarProvider>{children}</SnackbarProvider>
            </JourneyProvider>
          </EditorProvider>
        </MockedProvider>
      )
    })
    await act(async () => {
      await waitFor(async () => {
        await result.current.addBlockDelete(selectedStep)
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Delete operation failed, please reload and try again',
          { preventDuplicate: true, variant: 'error' }
        )
      })
      await waitFor(async () => {
        expect(mockEnqueue).toHaveBeenCalledWith(
          'Delete operation failed, please reload and try again',
          { preventDuplicate: true, variant: 'error' }
        )
      })
    })
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
              <SnackbarProvider>{children}</SnackbarProvider>
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
      await waitFor(async () => {
        expect(mockEnqueue).toHaveBeenCalledWith('Card Deleted', {
          preventDuplicate: true,
          variant: 'success'
        })
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
              <SnackbarProvider>{children}</SnackbarProvider>
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
      await waitFor(async () => {
        expect(mockEnqueue).toHaveBeenCalledWith('Block Deleted', {
          preventDuplicate: true,
          variant: 'success'
        })
      })
    })
  })
})
