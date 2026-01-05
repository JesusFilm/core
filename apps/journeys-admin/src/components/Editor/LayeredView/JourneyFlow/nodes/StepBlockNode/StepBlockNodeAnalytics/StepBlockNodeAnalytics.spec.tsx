import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'

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
      expect(screen.getByText('Approximate Exit rate')).toBeInTheDocument()
    )
  })

  it('should render fallback visitors', () => {
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
  })

  it('should hide exit rate and duration if total visitors is less than 10', async () => {
    const initialState = {
      analytics: {
        stepsStats: [
          {
            stepId: 'step.id',
            visitors: 9,
            visitorsExitAtStep: 20,
            timeOnPage: 20
          }
        ],
        totalVisitors: 9
      }
    } as unknown as EditorState

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeAnalytics stepId="step.id" />
      </EditorProvider>
    )

    expect(screen.getAllByText('~')).toHaveLength(2)
    fireEvent.mouseOver(screen.getAllByText('~')[0])
    await waitFor(() =>
      expect(screen.getByText('Exit Rate: Needs more data')).toBeInTheDocument()
    )
    fireEvent.mouseOver(screen.getAllByText('~')[1])
    await waitFor(() =>
      expect(
        screen.getByText('Visit Duration: Needs more data')
      ).toBeInTheDocument()
    )
  })
})
