import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { Step } from '@core/journeys/ui/Step'
import { render, screen } from '@testing-library/react'
import { StepBlockNodeAnalytics } from '.'

describe('StepBlockNodeAnalytics', () => {
  it('should render', () => {
    const initialState = {
      analytics: {
        stepsStats: [
          {
            stepId: 'step.id',
            visitors: 1000,
            visitorsExitAtStep: 100,
            timeOnPage: 72
          }
        ]
      }
    } as unknown as EditorState
    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeAnalytics stepId="step.id" />
      </EditorProvider>
    )

    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('1m12s')).toBeInTheDocument()
  })

  it('should render fallbacks', () => {
    const initialState = {
      analytics: {
        stepsStats: [
          {
            stepId: 'step.id',
            visitors: null,
            visitorsExitAtStep: null,
            timeOnPage: null
          }
        ]
      }
    } as unknown as EditorState

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeAnalytics stepId="step.id" />
      </EditorProvider>
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0s')).toBeInTheDocument()
  })
})
