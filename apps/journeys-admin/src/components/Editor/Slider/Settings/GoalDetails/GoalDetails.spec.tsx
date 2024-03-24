import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'

import { GoalDetails } from './GoalDetails'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => false)
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('GoalDetails', () => {
  const dispatch = jest.fn()

  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Goals,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('should return placeholder text', () => {
    state.selectedGoalUrl = undefined

    render(<GoalDetails />)

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('What are Goals?')).toBeInTheDocument()
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should render ActionInformation when selectedGoalUrl is null', () => {
    state.selectedGoalUrl = undefined

    render(<GoalDetails />)

    expect(screen.getByTestId('ActionInformation')).toBeInTheDocument()
  })

  it('should render ActionEditor and ActionCards when selectedGoalUrl is not null', () => {
    state.selectedGoalUrl = 'url'

    render(
      <MockedProvider>
        <GoalDetails />
      </MockedProvider>
    )

    expect(screen.getByTestId('ActionEditor')).toBeInTheDocument()
    expect(screen.getByTestId('ActionCards')).toBeInTheDocument()
  })

  it('should dispatch SetSelectedGoalUrl with selectedGoalUrl', async () => {
    state.selectedGoalUrl = 'https://url'
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
          <GoalDetails />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.submit(screen.getByRole('textbox', { name: 'Navigate to' }))

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'SetSelectedGoalUrlAction',
        selectedGoalUrl: 'https://url'
      })
    })
  })
})
