import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StepBlockNodeAnalytics } from '.'

describe('StepBlockNodeAnalytics', () => {
  it('should render', async () => {
    const initialState = {
      analytics: {
        stepsStats: [
          {
            stepId: 'step.id',
            visitors: 1000,
            visitorsExitAtStep: 100,
            timeOnPage: 72
          }
        ],
        totalVisitors: 1000
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
    fireEvent.mouseOver(screen.getByText('10%'))
    await waitFor(() =>
      expect(screen.getByText('Exit rate')).toBeInTheDocument()
    )
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
    expect(screen.getByText('0s')).toBeInTheDocument()
  })

  it('should hide exit rate if total visitors is less than 50', async () => {
    const initialState = {
      analytics: {
        stepsStats: [
          {
            stepId: 'step.id',
            visitors: 49,
            visitorsExitAtStep: 20,
            timeOnPage: 20
          }
        ],
        totalVisitors: 49
      }
    } as unknown as EditorState

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeAnalytics stepId="step.id" />
      </EditorProvider>
    )

    expect(screen.getByText('~')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByText('~'))
    await waitFor(() =>
      expect(
        screen.getByText('Need more data to accurately show the exit rate')
      ).toBeInTheDocument()
    )
  })
})
