import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, getByTestId, render, screen } from '@testing-library/react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import {
  ActiveContent,
  ActiveFab,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
  EditorProvider
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { TestEditorState } from '../../../../../../libs/TestEditorState'
import { GoalDetails } from '../../../Settings/GoalDetails'
import { Goal } from '../Goals'

import { GoalsList } from './GoalsList'


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

describe('GoalsList', () => {
  const goals: Goal[] = [
    {
      url: 'https://www.google.com/',
      count: 2,
      goalType: GoalType.Website
    },
    {
      url: 'https://www.biblegateway.com/versions/',
      count: 1,
      goalType: GoalType.Bible
    },
    {
      url: 'https://www.messenger.com/t/',
      count: 1,
      goalType: GoalType.Chat
    }
  ]

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

  describe('GoalsList', () => {
 
    it('should render the component title and subtitle', () => {
      const { getByText } = render(<GoalsList goals={goals} />)
      expect(getByText('The Journey Goals')).toBeInTheDocument()
    
    })

    it('should call dispatch with a URL', () => {
      const { getByRole } = render(<GoalsList goals={goals} />)
      fireEvent.click(getByRole('button', { name: 'Learn More' }))
      expect(useEditor().dispatch).toHaveBeenCalledWith({ type: 'SetSelectedGoalUrlAction' });
    })

    it('should render the goal URL subtitle', () => {
      const { getAllByText } = render(<GoalsList goals={goals} />)
      expect(getAllByText('https://www.google.com/')[0]).toBeInTheDocument()
      expect(getAllByText('Visit a Website')[0]).toBeInTheDocument()
    })

    it('should open the drawer or dispatch on click', () => {
      const { getAllByTestId } = render(<GoalsList goals={goals} />)
      fireEvent.click(getAllByTestId('Edit2Icon')[0])
      expect(dispatch).toHaveBeenCalled()
    })

    it('should render the table titles', () => {
      const { getAllByText } = render(<GoalsList goals={goals} />)
      expect(getAllByText('Target and Goal')[0]).toBeInTheDocument()
      expect(getAllByText('Appears on')[0]).toBeInTheDocument()
    })
  })
})
