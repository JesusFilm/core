import { MutationResult } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  blocks,
  blocksWithStepBlockPosition,
  defaultJourney,
  edges,
  nodes
} from '@core/journeys/ui/TemplateView/data'
import { transformer } from '@core/journeys/ui/transformer'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  GetStepBlocksWithPosition,
  GetStepBlocksWithPositionVariables
} from '../../../../../__generated__/GetStepBlocksWithPosition'
import { StepFields as StepBlock } from '../../../../../__generated__/StepFields'
import { mockReactFlow } from '../../../../../test/mockReactFlow'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'
import { CommandRedoItem } from '../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Toolbar/Items/CommandUndoItem'

import { GET_STEP_BLOCKS_WITH_POSITION } from './JourneyFlow'
import { transformSteps } from './libs/transformSteps'

import { JourneyFlow } from '.'

jest.mock('../../../../libs/useStepBlockPositionUpdateMutation', () => {
  return {
    useStepBlockPositionUpdateMutation: jest
      .fn()
      .mockReturnValue([jest.fn(), null])
  }
})

const mockUseStepBlockPositionUpdateMutation =
  useStepBlockPositionUpdateMutation as jest.MockedFunction<
    typeof useStepBlockPositionUpdateMutation
  >

jest.mock('./libs/transformSteps', () => {
  return {
    transformSteps: jest.fn()
  }
})

const mockTransformSteps = transformSteps as jest.MockedFunction<
  typeof transformSteps
>

describe('JourneyFlow', () => {
  beforeEach(() => mockReactFlow())

  const mockGetStepBlocksWithPosition: MockedResponse<
    GetStepBlocksWithPosition,
    GetStepBlocksWithPositionVariables
  > = {
    request: {
      query: GET_STEP_BLOCKS_WITH_POSITION,
      variables: {
        journeyIds: [defaultJourney.id]
      }
    },
    result: {
      data: {
        blocks: blocksWithStepBlockPosition
      }
    }
  }

  const steps = transformer(blocks) as Array<TreeBlock<StepBlock>>
  mockTransformSteps.mockReturnValue({ nodes, edges })

  it('should render graph', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <FlagsProvider flags={{ editorAnalytics: true }}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
            >
              <Box sx={{ width: '100vw', height: '100vh' }}>
                <JourneyFlow />
              </Box>
            </EditorProvider>
          </JourneyProvider>
        </FlagsProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Step' })).toBeInTheDocument()
    expect(screen.getAllByTestId('StepBlockNodeCard')).toHaveLength(7)
    expect(
      screen.getByRole('checkbox', { name: 'Analytics Overlay' })
    ).toBeInTheDocument()
  })

  it('should update step positions if any step does not have a position', async () => {
    const blocks = blocksWithStepBlockPosition.map((block) => ({
      ...block,
      x: null,
      y: null
    }))
    const result = jest.fn().mockReturnValue({ data: { blocks } })
    const mockUpdate = jest.fn()
    const mockResult = jest.fn() as unknown as MutationResult
    mockUseStepBlockPositionUpdateMutation.mockReturnValue([
      mockUpdate,
      mockResult
    ])

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider
            initialState={{
              steps,
              activeSlide: ActiveSlide.JourneyFlow
            }}
          >
            <Box sx={{ width: '100vw', height: '100vh' }}>
              <CommandProvider>
                <CommandUndoItem variant="button" />
                <JourneyFlow />
              </CommandProvider>
            </Box>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockUpdate).toHaveBeenCalledWith({
      optimisticResponse: {
        stepBlockPositionUpdate: [
          { __typename: 'StepBlock', id: 'step0.id', x: 0, y: -8 },
          { __typename: 'StepBlock', id: 'step1.id', x: 600, y: -8 },
          { __typename: 'StepBlock', id: 'step2.id', x: 1200, y: -8 },
          { __typename: 'StepBlock', id: 'step3.id', x: 1800, y: -8 },
          { __typename: 'StepBlock', id: 'step4.id', x: 2400, y: -8 },
          { __typename: 'StepBlock', id: 'step5.id', x: 2500, y: -8 },
          { __typename: 'StepBlock', id: 'step6.id', x: 3600, y: -8 }
        ]
      },
      variables: {
        input: [
          { id: 'step0.id', x: 0, y: -8 },
          { id: 'step1.id', x: 600, y: -8 },
          { id: 'step2.id', x: 1200, y: -8 },
          { id: 'step3.id', x: 1800, y: -8 },
          { id: 'step4.id', x: 2400, y: -8 },
          { id: 'step5.id', x: 2500, y: -8 },
          { id: 'step6.id', x: 3600, y: -8 }
        ]
      }
    })
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })

  it('should reorganize graph', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)
    const mockUpdate = jest.fn()
    const mockResult = jest.fn() as unknown as MutationResult
    mockUseStepBlockPositionUpdateMutation.mockReturnValue([
      mockUpdate,
      mockResult
    ])

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider
            initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
          >
            <Box sx={{ width: '100vw', height: '100vh' }}>
              <CommandProvider>
                <CommandUndoItem variant="button" />
                <CommandRedoItem variant="button" />
                <JourneyFlow />
              </CommandProvider>
            </Box>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const mockUpdateExecute = {
      optimisticResponse: {
        stepBlockPositionUpdate: [
          { __typename: 'StepBlock', id: 'step0.id', x: 0, y: -8 },
          { __typename: 'StepBlock', id: 'step1.id', x: 600, y: -8 },
          { __typename: 'StepBlock', id: 'step2.id', x: 1200, y: -8 },
          { __typename: 'StepBlock', id: 'step3.id', x: 1800, y: -8 },
          { __typename: 'StepBlock', id: 'step4.id', x: 2400, y: -8 },
          { __typename: 'StepBlock', id: 'step5.id', x: 2500, y: -8 },
          { __typename: 'StepBlock', id: 'step6.id', x: 3600, y: -8 }
        ]
      },
      variables: {
        input: [
          { id: 'step0.id', x: 0, y: -8 },
          { id: 'step1.id', x: 600, y: -8 },
          { id: 'step2.id', x: 1200, y: -8 },
          { id: 'step3.id', x: 1800, y: -8 },
          { id: 'step4.id', x: 2400, y: -8 },
          { id: 'step5.id', x: 2500, y: -8 },
          { id: 'step6.id', x: 3600, y: -8 }
        ]
      }
    }

    const mockUpdateUndo = {
      optimisticResponse: {
        stepBlockPositionUpdate: [
          { __typename: 'StepBlock', id: 'step0.id', x: 0, y: 1 },
          { __typename: 'StepBlock', id: 'step1.id', x: 300, y: 1 },
          { __typename: 'StepBlock', id: 'step2.id', x: 600, y: 1 },
          { __typename: 'StepBlock', id: 'step3.id', x: 900, y: 1 },
          { __typename: 'StepBlock', id: 'step4.id', x: 1200, y: 1 },
          { __typename: 'StepBlock', id: 'step5.id', x: 1500, y: 1 },
          { __typename: 'StepBlock', id: 'step6.id', x: 1800, y: 1 }
        ]
      },
      variables: {
        input: [
          { id: 'step0.id', x: 0, y: 1 },
          { id: 'step1.id', x: 300, y: 1 },
          { id: 'step2.id', x: 600, y: 1 },
          { id: 'step3.id', x: 900, y: 1 },
          { id: 'step4.id', x: 1200, y: 1 },
          { id: 'step5.id', x: 1500, y: 1 },
          { id: 'step6.id', x: 1800, y: 1 }
        ]
      }
    }

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(screen.getByTestId('ArrowRefresh6Icon'))
    expect(mockUpdate).toHaveBeenCalledWith(mockUpdateExecute)
    mockUpdate.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(mockUpdate).toHaveBeenCalledWith(mockUpdateUndo)
    mockUpdate.mockClear()
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    expect(mockUpdate).toHaveBeenCalledWith(mockUpdateExecute)
  })

  it('should hide new step button if in analytics mode', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider
            initialState={{
              steps,
              activeSlide: ActiveSlide.JourneyFlow,
              showAnalytics: true
            }}
          >
            <Box sx={{ width: '100vw', height: '100vh' }}>
              <JourneyFlow />
            </Box>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.queryByRole('button', { name: 'Add Step' })
    ).not.toBeInTheDocument()
  })

  it('should change background color when in analytics mode', () => {
    render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={{ journey: defaultJourney }}>
          <EditorProvider
            initialState={{
              steps,
              activeSlide: ActiveSlide.JourneyFlow,
              showAnalytics: true
            }}
          >
            <Box sx={{ width: '100vw', height: '100vh' }}>
              <JourneyFlow />
            </Box>
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('rf__background')).toHaveStyle({
      'background-color': 'rgb(222, 232, 239)'
    })
  })
})
