import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { ActiveCanvasDetailsDrawer, ActiveContent, ActiveFab, ActiveSlide, EditorState, useEditor } from '@core/journeys/ui/EditorProvider'

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
    render(
      <MockedProvider><GoalDetails /></MockedProvider>
    )
    state.selectedGoalUrl = undefined;
    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('What are Goals?')).toBeInTheDocument()
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getByText('Link to Bible')).toBeInTheDocument()
  })

  it('should render ActionInformation when selectedGoalUrl is null', () => {
    state.selectedGoalUrl = undefined;
    render(<MockedProvider><GoalDetails /></MockedProvider>);

    expect(screen.getByTestId('ActionInformation')).toBeInTheDocument();
 });

 it('should render ActionEditor and ActionCards when selectedGoalUrl is not null', async () => {
  state.selectedGoalUrl = 'url';
  render(<MockedProvider><GoalDetails /></MockedProvider>);

  await waitFor(() => {
    expect(screen.queryByTestId('ActionEditor')).toBeInTheDocument();
    expect(screen.queryByTestId('ActionCards')).toBeInTheDocument();
  });
});
  
})
