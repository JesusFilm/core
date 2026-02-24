import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import { StepDuplicate } from '../../../../../../../../../__generated__/StepDuplicate'
import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import {
  deleteBlockMock,
  selectedStep
} from '../../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestoreMock } from '../../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { STEP_DUPLICATE } from './DuplicateStep'

import { DuplicateStep } from '.'

jest.mock('uuid', () => ({
  v4: jest.fn()
}))

const mockV4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('DuplicateStep', () => {
  beforeEach(() =>
    mockV4
      .mockReturnValueOnce('stepId')
      .mockReturnValueOnce('blockId')
      .mockReturnValueOnce('typog1')
      .mockReturnValueOnce('typog2')
      .mockReturnValueOnce('typog3')
  )

  const mockStepDuplicate: MockedResponse<StepDuplicate> = {
    request: {
      query: STEP_DUPLICATE,
      variables: {
        id: 'stepId',
        journeyId: 'journey.id',
        parentOrder: 1,
        idMap: [
          { oldId: 'stepId', newId: 'stepId' },
          { oldId: 'blockId', newId: 'blockId' },
          { oldId: 'typography0.id', newId: 'typog1' },
          { oldId: 'typography1.id', newId: 'typog2' },
          { oldId: 'typography2.id', newId: 'typog3' }
        ],
        x: 225,
        y: 0
      }
    },
    result: {
      data: {
        blockDuplicate: [{ ...selectedStep, x: 0, y: 0 }]
      }
    }
  }

  const step = {
    __typename: 'StepBlock',
    id: 'step.id'
  } as unknown as TreeBlock<StepBlock>

  const journey = {
    id: 'journey.id'
  } as unknown as Journey

  it('duplicate the step', async () => {
    const mockDuplicateStepResult = jest.fn(() => ({
      ...mockStepDuplicate.result
    }))

    render(
      <MockedProvider
        mocks={[{ ...mockStepDuplicate, result: mockDuplicateStepResult }]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <EditorProvider
              initialState={{
                steps: [{ ...selectedStep, parentOrder: 0 }]
              }}
            >
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={noop}
              />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    await waitFor(() => expect(mockDuplicateStepResult).toHaveBeenCalled())
  })

  it('should undo the duplicated step', async () => {
    const mockDuplicateStepResult = jest.fn(() => ({
      ...mockStepDuplicate.result
    }))

    const blockDeleteMockResult = jest
      .fn()
      .mockResolvedValue(deleteBlockMock.result)
    render(
      <MockedProvider
        mocks={[
          { ...mockStepDuplicate, result: mockDuplicateStepResult },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'stepId' }
            },
            result: blockDeleteMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <EditorProvider
              initialState={{
                steps: [{ ...selectedStep, parentOrder: 0 }]
              }}
            >
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={noop}
              />
              <CommandUndoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    await waitFor(() => expect(mockDuplicateStepResult).toHaveBeenCalled())
    await userEvent.click(
      screen.getByRole('button', {
        name: 'Undo'
      })
    )
    await waitFor(() => expect(blockDeleteMockResult).toHaveBeenCalled())
  })

  it('should redo the duplicated step', async () => {
    const mockDuplicateStepResult = jest.fn(() => ({
      ...mockStepDuplicate.result
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
          { ...mockStepDuplicate, result: mockDuplicateStepResult },
          {
            request: {
              ...deleteBlockMock.request,
              variables: { id: 'stepId' }
            },
            result: blockDeleteMockResult
          },
          {
            request: {
              ...blockRestoreMock.request,
              variables: { id: 'stepId' }
            },
            result: blockRestoreMockResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <EditorProvider
              initialState={{
                steps: [{ ...selectedStep, parentOrder: 0 }]
              }}
            >
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={noop}
              />
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    await waitFor(() => expect(mockDuplicateStepResult).toHaveBeenCalled())
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

  it('should update cache after duplication', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey.id': {
        blocks: [{ __ref: `StepBlock:step.id` }],
        id: 'journey.id',
        __typename: 'Journey'
      },
      'StepBlock:step.id': {
        ...step
      }
    })

    render(
      <MockedProvider mocks={[mockStepDuplicate]} cache={cache}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <EditorProvider
              initialState={{
                steps: [{ ...selectedStep, parentOrder: 0 }]
              }}
            >
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={noop}
              />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
      { __ref: `StepBlock:step.id` },
      { __ref: `StepBlock:stepId` }
    ])

    expect(cache.extract()['StepBlock:step.id']).toEqual({
      __typename: 'StepBlock',
      id: 'step.id'
    })

    expect(cache.extract()['StepBlock:stepId']).toEqual({
      __typename: 'StepBlock',
      id: 'stepId',
      x: 0,
      y: 0
    })
  })

  it('should handle actions on duplication success', async () => {
    const handleClick = jest.fn()
    const initialState = {
      steps: [{ ...selectedStep, parentOrder: 0 }],
      selectedStep: { ...selectedStep, parentOrder: 0 }
    }

    render(
      <MockedProvider mocks={[mockStepDuplicate]}>
        <EditorProvider initialState={initialState}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={handleClick}
              />
              <TestEditorState />
            </JourneyProvider>
          </SnackbarProvider>
        </EditorProvider>
      </MockedProvider>
    )

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    expect(screen.getByText('selectedStep: stepId')).toBeInTheDocument()
    expect(screen.getByText('Card Duplicated')).toBeInTheDocument()
    expect(handleClick).toHaveBeenCalled()
  })

  it('should clear hovered step on duplication', async () => {
    const initialState = {
      steps: [{ ...selectedStep, parentOrder: 0 }],
      selectedStep: { ...selectedStep, parentOrder: 0 },
      hoveredStep: selectedStep
    }

    render(
      <MockedProvider mocks={[mockStepDuplicate]}>
        <EditorProvider initialState={initialState}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <DuplicateStep
                step={selectedStep}
                xPos={0}
                yPos={0}
                handleClick={noop}
              />
              <TestEditorState />
            </JourneyProvider>
          </SnackbarProvider>
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('hoveredStep: stepId')).toBeInTheDocument()

    const duplicateButton = screen.getByRole('menuitem', {
      name: 'Duplicate Card'
    })
    await waitFor(async () => await userEvent.click(duplicateButton))

    await waitFor(() => {
      expect(screen.getByText('Card Duplicated')).toBeInTheDocument()
      expect(screen.queryByText('hoveredStep: stepId')).not.toBeInTheDocument()
      expect(screen.getByText('hoveredStep:')).toBeInTheDocument()
    })
  })
})
