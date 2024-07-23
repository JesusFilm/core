import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { deleteStepMock as deleteStep } from '../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock } from '../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { stepAndCardBlockCreateMock } from '../../../../../libs/useStepAndCardBlockCreateMutation/useStepAndCardBlockCreateMutation.mock'
import { CommandRedoItem } from '../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Toolbar/Items/CommandUndoItem'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { NewStepButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewStepButton', () => {
  it('should render', () => {
    render(
      <MockedProvider>
        <ReactFlowProvider>
          <NewStepButton />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('button', { name: 'Add Step' })).toBeInTheDocument()
  })

  it('should create a step on click', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)

    render(
      <MockedProvider mocks={[{ ...stepAndCardBlockCreateMock, result }]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <ReactFlowProvider>
              <NewStepButton />
            </ReactFlowProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
  it('should remove a step on undo click', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)
    const deletStepMock = {
      ...deleteStep,
      request: {
        ...deleteStep.request,
        variables: {
          id: 'newStep.id',
          journeyId: 'journey-id',
          parentBlockId: null
        }
      }
    }
    const deleteResult = jest.fn().mockReturnValue(deletStepMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateMock, result },
          { ...deletStepMock, result: deleteResult }
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <ReactFlowProvider>
              <CommandUndoItem variant="button" />
              <NewStepButton />
            </ReactFlowProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
  })

  it('should redo a step on redo click', async () => {
    mockUuidv4.mockReturnValueOnce('newStep.id')
    mockUuidv4.mockReturnValueOnce('newCard.id')

    const result = jest.fn().mockReturnValue(stepAndCardBlockCreateMock.result)
    const deletStepMock = {
      ...deleteStep,
      request: {
        ...deleteStep.request,
        variables: {
          id: 'newStep.id',
          journeyId: 'journey-id',
          parentBlockId: null
        }
      }
    }
    const deleteResult = jest.fn().mockReturnValue(deletStepMock.result)

    const blockRestoreMock = {
      ...useBlockRestoreMutationMock,
      request: {
        ...useBlockRestoreMutationMock.request,
        variables: { id: 'newStep.id' }
      }
    }

    const blockRestoreResult = jest
      .fn()
      .mockReturnValue(blockRestoreMock.result)

    render(
      <MockedProvider
        mocks={[
          { ...stepAndCardBlockCreateMock, result },
          { ...deletStepMock, result: deleteResult },
          { ...blockRestoreMock, result: blockRestoreResult }
        ]}
      >
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider>
            <ReactFlowProvider>
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
              <NewStepButton />
            </ReactFlowProvider>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add Step' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(blockRestoreResult).toHaveBeenCalled())
  })
})
