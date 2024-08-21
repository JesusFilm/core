import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { StepFields } from '../../../../../../__generated__/StepFields'
import { TestEditorState } from '../../../../../libs/TestEditorState'

import { GoalDetails } from './GoalDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

describe('GoalDetails', () => {
  const state: EditorState = {
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  it('should return placeholder text', () => {
    render(<GoalDetails />)

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('What are Goals?')).toBeInTheDocument()
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should render ActionInformation when selectedGoalUrl is null', () => {
    render(<GoalDetails />)

    expect(screen.getByTestId('ActionInformation')).toBeInTheDocument()
  })

  it('should render ActionEditor and ActionCards when selectedGoalUrl is not null', () => {
    const stateWithGoal = {
      ...state,
      selectedGoalUrl: 'https://initialUrl.com'
    }

    render(
      <MockedProvider>
        <EditorProvider initialState={stateWithGoal}>
          <GoalDetails />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('ActionEditor')).toBeInTheDocument()
    expect(screen.getByTestId('ActionCards')).toBeInTheDocument()
  })

  it('should dispatch SetSelectedGoalUrl with selectedGoalUrl', async () => {
    const stateWithGoal = {
      ...state,
      selectedGoalUrl: 'https://initialUrl.com'
    }
    const journey = {
      id: 'journey.id',
      __typename: 'Journey',
      language: {
        bcp: null
      }
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <EditorProvider initialState={stateWithGoal}>
            <TestEditorState />
            <GoalDetails />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      screen.getByText('selectedGoalUrl: https://initialUrl.com')
    ).toBeInTheDocument()

    const form = screen.getByRole('textbox', { name: 'Navigate to' })
    fireEvent.change(form, { target: { value: 'https://newUrl.com' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(
        screen.getByText('selectedGoalUrl: https://newUrl.com')
      ).toBeInTheDocument()
    })
  })

  it('should navigate to journey map with social when close icon is clicked', async () => {
    const contentState = { ...state, activeSlide: ActiveSlide.Content }
    render(
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <GoalDetails />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    expect(screen.getByText('activeContent: social')).toBeInTheDocument()
  })

  it('should navigate to journey map with canvas when close icon is clicked', async () => {
    const contentState = {
      ...state,
      activeSlide: ActiveSlide.Content,
      steps: [{} as unknown as TreeBlock<StepFields>]
    }
    render(
      <MockedProvider>
        <EditorProvider initialState={contentState}>
          <TestEditorState />
          <GoalDetails />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('activeContent: goals')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
  })
})
