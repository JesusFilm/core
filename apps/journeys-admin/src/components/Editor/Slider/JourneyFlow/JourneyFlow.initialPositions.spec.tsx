import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/compat/router'
import { NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveSlide,
  EditorProvider,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { blocks, defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { transformer } from '@core/journeys/ui/transformer'

import { StepFields } from '../../../../../__generated__/StepFields'
import { mockReactFlow } from '../../../../../test/mockReactFlow'
import { STEP_BLOCK_POSITION_UPDATE } from '../../../../libs/useStepBlockPositionUpdateMutation/useStepBlockPositionUpdateMutation'
import { MuxVideoUploadProvider } from '../../../MuxVideoUploadProvider'
import { EditorLayoutProvider } from '../../EditorLayoutContext'

import { GET_STEP_BLOCKS_WITH_POSITION, JourneyFlow } from './JourneyFlow'
import { arrangeSteps } from './libs/arrangeSteps'

const { journeyUpdate } = vi.hoisted(() => ({ journeyUpdate: vi.fn() }))

vi.mock('next/compat/router', () => ({ useRouter: vi.fn() }))
vi.mock('../../../../libs/useJourneyUpdateMutation', () => ({
  useJourneyUpdateMutation: () => [journeyUpdate]
}))

function SelectedStep(): ReactElement {
  const { state } = useEditor()
  return (
    <Box data-testid="selected-step" data-active-slide={state.activeSlide}>
      {state.selectedStep?.id}
    </Box>
  )
}

describe('JourneyFlow initial positions', () => {
  beforeEach(() => {
    mockReactFlow()
    vi.mocked(useRouter).mockReturnValue({
      query: { journeyId: defaultJourney.id }
    } as unknown as NextRouter)
  })

  it.each([
    { socialNodeX: null, socialNodeY: null },
    { socialNodeX: null, socialNodeY: 100 },
    { socialNodeX: -400, socialNodeY: null },
    { socialNodeX: -400, socialNodeY: 100 }
  ])('renders and selects a new card with %j', async (socialPosition) => {
    const steps = (transformer(blocks) as Array<TreeBlock<StepFields>>).slice(
      0,
      1
    )
    const step = steps[0]
    const positionInput = [{ id: step.id, ...arrangeSteps(steps)[step.id] }]
    const positionResult = vi.fn(() => ({
      data: {
        stepBlockPositionUpdate: positionInput.map((position) => ({
          __typename: 'StepBlock',
          ...position
        }))
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_STEP_BLOCKS_WITH_POSITION,
              variables: { journeyIds: [defaultJourney.id] }
            },
            result: {
              data: {
                blocks: [
                  { __typename: 'StepBlock', id: step.id, x: null, y: null }
                ]
              }
            }
          },
          {
            request: {
              query: STEP_BLOCK_POSITION_UPDATE,
              variables: { input: positionInput }
            },
            result: positionResult
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, ...socialPosition } }}
          >
            <EditorProvider
              initialState={{ steps, activeSlide: ActiveSlide.JourneyFlow }}
            >
              <MuxVideoUploadProvider>
                <EditorLayoutProvider value="layered">
                  <Box sx={{ width: '100vw', height: '100vh' }}>
                    <JourneyFlow />
                    <SelectedStep />
                  </Box>
                </EditorLayoutProvider>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const card = await screen.findByTestId(`StepBlockNode-${step.id}`)
    fireEvent.click(card)
    await waitFor(() =>
      expect(screen.getByTestId('selected-step')).toHaveTextContent(step.id)
    )
    expect(screen.getByTestId('selected-step')).toHaveAttribute(
      'data-active-slide',
      ActiveSlide.Content.toString()
    )
    await waitFor(() => expect(positionResult).toHaveBeenCalledTimes(1))
  })
})
