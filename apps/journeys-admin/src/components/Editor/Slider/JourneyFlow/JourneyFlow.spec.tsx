import { MutationResult } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/compat/router'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import {
  blocks,
  blocksWithStepBlockPosition,
  defaultJourney as coreDefaultJourney,
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
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'
import { useStepBlockPositionUpdateMutation } from '../../../../libs/useStepBlockPositionUpdateMutation'
import { MuxVideoUploadProvider } from '../../../MuxVideoUploadProvider'
import { CommandRedoItem } from '../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Toolbar/Items/CommandUndoItem'

import { GET_STEP_BLOCKS_WITH_POSITION } from './JourneyFlow'
import { transformSteps } from './libs/transformSteps'
import {
  DEFAULT_SOCIAL_NODE_X,
  DEFAULT_SOCIAL_NODE_Y
} from './nodes/SocialPreviewNode/libs/positions'

import { JourneyFlow } from '.'

const defaultJourney = {
  ...coreDefaultJourney,
  socialNodeX: DEFAULT_SOCIAL_NODE_X,
  socialNodeY: DEFAULT_SOCIAL_NODE_Y
}

jest.mock('next/compat/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

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

jest.mock('../../../../libs/useJourneyUpdateMutation', () => {
  return {
    useJourneyUpdateMutation: jest.fn().mockReturnValue([jest.fn(), null])
  }
})

const mockUseJourneyUpdateMutation =
  useJourneyUpdateMutation as jest.MockedFunction<
    typeof useJourneyUpdateMutation
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
  beforeEach(() => {
    mockReactFlow()

    mockedUseRouter.mockReturnValue({
      query: { journeyId: defaultJourney.id }
    } as unknown as NextRouter)
  })

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

    const nonTemplateJourney: Journey = {
      ...defaultJourney,
      team: {
        ...defaultJourney.team,
        __typename: 'Team' as const,
        id: 'other-team-id',
        title: defaultJourney.team?.title ?? 'Other Team',
        publicTitle: defaultJourney.team?.publicTitle ?? null
      },
      template: false
    }

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ editorAnalytics: true }}>
            <JourneyProvider value={{ journey: nonTemplateJourney }}>
              <EditorProvider
                initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
              >
                <MuxVideoUploadProvider>
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                  </Box>
                </MuxVideoUploadProvider>
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(screen.getByTestId('JourneyFlow')).toBeInTheDocument()
    expect(screen.getByTestId('SocialPreviewNode')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Step' })).not.toBeDisabled()
    await waitFor(() =>
      expect(screen.getAllByTestId('StepBlockNodeCard')).toHaveLength(7)
    )
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
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney
              }
            }}
          >
            <EditorProvider
              initialState={{
                steps,
                activeSlide: ActiveSlide.JourneyFlow
              }}
            >
              <MuxVideoUploadProvider>
                <Box sx={{ width: '100vw', height: '100vh' }}>
                  <CommandUndoItem variant="button" />
                  <JourneyFlow />
                </Box>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
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
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney
              }
            }}
          >
            <EditorProvider
              initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
            >
              <MuxVideoUploadProvider>
                <Box sx={{ width: '100vw', height: '100vh' }}>
                  <CommandUndoItem variant="button" />
                  <CommandRedoItem variant="button" />
                  <JourneyFlow />
                </Box>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
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

  it('should update social preview node position during reset/undo/redo', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    // Mock for journey update
    const mockJourneyUpdate = jest.fn()
    const mockJourneyResult = jest.fn() as unknown as MutationResult
    mockUseJourneyUpdateMutation.mockReturnValue([
      mockJourneyUpdate,
      mockJourneyResult
    ])

    const initialSocialNodeX = 100
    const initialSocialNodeY = 200

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                socialNodeX: initialSocialNodeX,
                socialNodeY: initialSocialNodeY
              }
            }}
          >
            <EditorProvider
              initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
            >
              <MuxVideoUploadProvider>
                <Box sx={{ width: '100vw', height: '100vh' }}>
                  <CommandUndoItem variant="button" />
                  <CommandRedoItem variant="button" />
                  <JourneyFlow />
                </Box>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const mockJourneyUpdateExecute = {
      variables: {
        id: defaultJourney.id,
        input: {
          socialNodeX: DEFAULT_SOCIAL_NODE_X,
          socialNodeY: DEFAULT_SOCIAL_NODE_Y
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          ...defaultJourney,
          socialNodeX: DEFAULT_SOCIAL_NODE_X,
          socialNodeY: DEFAULT_SOCIAL_NODE_Y
        }
      }
    }

    const mockJourneyUpdateUndo = {
      variables: {
        id: defaultJourney.id,
        input: {
          socialNodeX: initialSocialNodeX,
          socialNodeY: initialSocialNodeY
        }
      },
      optimisticResponse: {
        journeyUpdate: {
          ...defaultJourney,
          socialNodeX: initialSocialNodeX,
          socialNodeY: initialSocialNodeY
        }
      }
    }

    await waitFor(() => expect(result).toHaveBeenCalled())

    fireEvent.click(screen.getByTestId('ArrowRefresh6Icon'))
    expect(mockJourneyUpdate).toHaveBeenCalledWith(mockJourneyUpdateExecute)
    mockJourneyUpdate.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(mockJourneyUpdate).toHaveBeenCalledWith(mockJourneyUpdateUndo)
    mockJourneyUpdate.mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    expect(mockJourneyUpdate).toHaveBeenCalledWith(mockJourneyUpdateExecute)
  })

  it('should hide new step button if in analytics mode', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                steps,
                activeSlide: ActiveSlide.JourneyFlow,
                showAnalytics: true
              }}
            >
              <MuxVideoUploadProvider>
                <Box sx={{ width: '100vw', height: '100vh' }}>
                  <JourneyFlow />
                </Box>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.queryByRole('button', { name: 'Add Step' })
    ).not.toBeInTheDocument()
  })

  it('should change background color when in analytics mode', () => {
    render(
      <MockedProvider mocks={[mockGetStepBlocksWithPosition]}>
        <SnackbarProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                steps,
                activeSlide: ActiveSlide.JourneyFlow,
                showAnalytics: true
              }}
            >
              <MuxVideoUploadProvider>
                <Box sx={{ width: '100vw', height: '100vh' }}>
                  <JourneyFlow />
                </Box>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('rf__background')).toHaveStyle({
      'background-color': 'rgb(222, 232, 239)'
    })
  })

  it('should hide analytics panel for local templates', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    const localTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'my-team-id',
        title: 'My Team',
        publicTitle: null
      },
      template: true
    }

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ editorAnalytics: true }}>
            <JourneyProvider value={{ journey: localTemplateJourney }}>
              <EditorProvider
                initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
              >
                <MuxVideoUploadProvider>
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                  </Box>
                </MuxVideoUploadProvider>
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.queryByRole('checkbox', { name: 'Analytics Overlay' })
    ).not.toBeInTheDocument()
  })

  it('should not show analytics panel for global templates', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    const jfpTeamTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'jfp-team',
        title: 'JFP Team',
        publicTitle: null
      },
      template: true
    }

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ editorAnalytics: true }}>
            <JourneyProvider value={{ journey: jfpTeamTemplateJourney }}>
              <EditorProvider
                initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
              >
                <MuxVideoUploadProvider>
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                  </Box>
                </MuxVideoUploadProvider>
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.queryByRole('checkbox', { name: 'Analytics Overlay' })
    ).not.toBeInTheDocument()
  })

  it('should show analytics panel for journeys', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    const jfpTeamTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'my-team',
        title: 'My Team',
        publicTitle: null
      },
      template: false
    }

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ editorAnalytics: true }}>
            <JourneyProvider value={{ journey: jfpTeamTemplateJourney }}>
              <EditorProvider
                initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
              >
                <MuxVideoUploadProvider>
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                  </Box>
                </MuxVideoUploadProvider>
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.getByRole('checkbox', { name: 'Analytics Overlay' })
    ).toBeInTheDocument()
  })

  it('should hide analytics panel when editorAnalytics feature flag is false', async () => {
    const result = jest
      .fn()
      .mockReturnValue(mockGetStepBlocksWithPosition.result)

    render(
      <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
        <SnackbarProvider>
          <FlagsProvider flags={{ editorAnalytics: false }}>
            <JourneyProvider value={{ journey: defaultJourney }}>
              <EditorProvider
                initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
              >
                <MuxVideoUploadProvider>
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                  </Box>
                </MuxVideoUploadProvider>
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(
      screen.queryByRole('checkbox', { name: 'Analytics Overlay' })
    ).not.toBeInTheDocument()
  })

  describe('template info helper (NES-1642)', () => {
    const localTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'my-team-id',
        title: 'My Team',
        publicTitle: null
      },
      template: true
    }

    const globalTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'jfp-team',
        title: 'JFP Team',
        publicTitle: null
      },
      template: true
    }

    const nonTemplateJourney = {
      ...defaultJourney,
      team: {
        __typename: 'Team' as const,
        id: 'my-team-id',
        title: 'My Team',
        publicTitle: null
      },
      template: false
    }

    function renderWithFlags(
      journey: Journey,
      flags: { teamTemplateCollection?: boolean; editorAnalytics?: boolean }
    ) {
      const result = jest
        .fn()
        .mockReturnValue(mockGetStepBlocksWithPosition.result)

      render(
        <MockedProvider mocks={[{ ...mockGetStepBlocksWithPosition, result }]}>
          <SnackbarProvider>
            <FlagsProvider flags={flags}>
              <JourneyProvider value={{ journey }}>
                <EditorProvider
                  initialState={{
                    steps,
                    activeSlide: ActiveSlide.JourneyFlow
                  }}
                >
                  <MuxVideoUploadProvider>
                    <Box sx={{ width: '100vw', height: '100vh' }}>
                      <JourneyFlow />
                    </Box>
                  </MuxVideoUploadProvider>
                </EditorProvider>
              </JourneyProvider>
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      return { result }
    }

    it('renders the helper trigger for local templates when teamTemplateCollection is on', async () => {
      const { result } = renderWithFlags(localTemplateJourney, {
        teamTemplateCollection: true
      })

      await waitFor(() => expect(result).toHaveBeenCalled())

      expect(
        screen.getByTestId('TemplateInfoHelperTrigger')
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('checkbox', { name: 'Analytics Overlay' })
      ).not.toBeInTheDocument()
    })

    it('renders the helper trigger for global templates when teamTemplateCollection is on', async () => {
      const { result } = renderWithFlags(globalTemplateJourney, {
        teamTemplateCollection: true
      })

      await waitFor(() => expect(result).toHaveBeenCalled())

      expect(
        screen.getByTestId('TemplateInfoHelperTrigger')
      ).toBeInTheDocument()
    })

    it('does not render the helper trigger when teamTemplateCollection is off', async () => {
      const { result } = renderWithFlags(localTemplateJourney, {
        teamTemplateCollection: false
      })

      await waitFor(() => expect(result).toHaveBeenCalled())

      expect(
        screen.queryByTestId('TemplateInfoHelperTrigger')
      ).not.toBeInTheDocument()
    })

    it('does not render the helper trigger for non-template journeys', async () => {
      const { result } = renderWithFlags(nonTemplateJourney, {
        teamTemplateCollection: true,
        editorAnalytics: true
      })

      await waitFor(() => expect(result).toHaveBeenCalled())

      expect(
        screen.queryByTestId('TemplateInfoHelperTrigger')
      ).not.toBeInTheDocument()
      // The analytics switch still renders for non-template journeys.
      expect(
        screen.getByRole('checkbox', { name: 'Analytics Overlay' })
      ).toBeInTheDocument()
    })
  })
})
